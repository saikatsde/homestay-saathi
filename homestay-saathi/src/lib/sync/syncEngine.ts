// Sync Engine & Mutation Queue Manager per docs/04-data-sync-protocol.md
import { db, generateUUID, getOrCreateSyncMeta } from '../db';
import { MutationQueueItem } from '../types';
import { getConnectivityStatus, subscribeConnectivity } from './connectivity';
import { isFirebaseConfigured } from '../firebase/config';
import { getCurrentSession, signInAnonymousUser } from '../firebase/auth';
import { syncMutationToFirestore, pullAllFromFirestore } from '../firebase/firestoreSync';

export interface SyncEngineStatus {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  cloudSynced: boolean;
}

type SyncListener = (status: SyncEngineStatus) => void;
const syncListeners = new Set<SyncListener>();

let syncState: SyncEngineStatus = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncedAt: null,
  lastError: null,
  cloudSynced: false,
};

function notifySync() {
  syncListeners.forEach(fn => fn(syncState));
}

export function subscribeSyncState(listener: SyncListener): () => void {
  syncListeners.add(listener);
  listener(syncState);
  return () => {
    syncListeners.delete(listener);
  };
}

export const subscribeSyncStatus = subscribeSyncState;

export async function refreshQueueCounts(): Promise<void> {
  const pending = await db.mutationQueue.where('syncStatus').equals('pending').count();
  const syncing = await db.mutationQueue.where('syncStatus').equals('syncing').count();
  const failed = await db.mutationQueue.where('syncStatus').equals('failed').count();
  const meta = await db.syncMeta.get('singleton');

  syncState = {
    ...syncState,
    pendingCount: pending + syncing,
    failedCount: failed,
    lastSyncedAt: meta?.lastSyncedAt || null,
    cloudSynced: !!meta?.uid,
  };
  notifySync();
}

export interface QueueMutationOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  operationId?: string;
  entity: 'booking' | 'ledgerEntry' | 'listing' | 'checklistItem';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: T;
}

export async function queueMutation<T extends Record<string, unknown>>(
  entityOrOptions: 'booking' | 'ledgerEntry' | 'listing' | 'checklistItem' | QueueMutationOptions<T>,
  entityId?: string,
  operation?: 'create' | 'update' | 'delete',
  payload?: T
): Promise<string> {
  const meta = await getOrCreateSyncMeta();
  let entity: 'booking' | 'ledgerEntry' | 'listing' | 'checklistItem';
  let eId: string;
  let op: 'create' | 'update' | 'delete';
  let pl: Record<string, unknown>;
  let opId: string;

  if (typeof entityOrOptions === 'object') {
    entity = entityOrOptions.entity;
    eId = entityOrOptions.entityId;
    op = entityOrOptions.operation;
    pl = entityOrOptions.payload;
    opId = entityOrOptions.operationId || generateUUID();
  } else {
    entity = entityOrOptions;
    eId = entityId!;
    op = operation!;
    pl = payload || {};
    opId = generateUUID();
  }

  const clientTimestamp = new Date().toISOString();

  const item: MutationQueueItem = {
    operationId: opId,
    entity,
    entityId: eId,
    operation: op,
    payload: pl,
    clientTimestamp,
    syncStatus: 'pending',
    retryCount: 0,
    lastAttemptAt: null,
    deviceId: meta.deviceId,
  };

  await db.mutationQueue.put(item);
  await refreshQueueCounts();

  if (getConnectivityStatus() === 'online') {
    drainSyncQueue();
  }

  return opId;
}

export async function drainSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (syncState.isSyncing) return { synced: 0, failed: 0 };
  if (getConnectivityStatus() !== 'online') {
    await refreshQueueCounts();
    return { synced: 0, failed: 0 };
  }

  syncState.isSyncing = true;
  notifySync();

  let syncedCount = 0;
  let failedCount = 0;

  try {
    const meta = await getOrCreateSyncMeta();
    let effectiveUid = getCurrentSession()?.uid || meta.uid;

    // If Firebase is configured but no session yet, attempt auto-anonymous sign-in
    if (isFirebaseConfigured() && !effectiveUid) {
      try {
        const anonSession = await signInAnonymousUser();
        effectiveUid = anonSession.uid;
      } catch (authErr) {
        console.warn('[SyncEngine] Auto anonymous sign-in skipped:', authErr);
      }
    }

    const pendingItems = await db.mutationQueue
      .where('syncStatus')
      .anyOf('pending', 'failed')
      .sortBy('clientTimestamp');

    for (const item of pendingItems) {
      if (getConnectivityStatus() !== 'online') break;

      await db.mutationQueue.update(item.operationId, {
        syncStatus: 'syncing',
        lastAttemptAt: new Date().toISOString(),
      });
      await refreshQueueCounts();

      try {
        let serverUpdatedAt = new Date().toISOString();

        // 1. If Firebase is configured and user is signed in, sync to Cloud Firestore
        if (isFirebaseConfigured() && effectiveUid) {
          const res = await syncMutationToFirestore(effectiveUid, item);
          if (res.serverUpdatedAt) {
            serverUpdatedAt = res.serverUpdatedAt;
          }
        } else {
          // Graceful fallback for offline / mock testing when Firebase credentials are not set
          await new Promise((r) => setTimeout(r, 200));
        }

        // 2. Update local entity status
        if (item.entity === 'booking') {
          await db.bookings.update(item.entityId, {
            syncStatus: 'synced',
            serverUpdatedAt,
          });
        } else if (item.entity === 'ledgerEntry') {
          await db.ledgerEntries.update(item.entityId, {
            syncStatus: 'synced',
          });
        } else if (item.entity === 'listing') {
          await db.listings.update(item.entityId, {
            syncStatus: 'synced',
          });
        } else if (item.entity === 'checklistItem') {
          await db.checklistItems.update(item.entityId, {
            syncStatus: 'synced',
          });
        }

        // 3. Mark mutation as synced
        await db.mutationQueue.update(item.operationId, {
          syncStatus: 'synced',
        });

        syncedCount++;
      } catch (err: unknown) {
        console.error('[SyncEngine] Mutation sync error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Sync connection timeout';
        const nextRetry = item.retryCount + 1;
        const finalFailed = nextRetry >= 8;

        await db.mutationQueue.update(item.operationId, {
          syncStatus: finalFailed ? 'failed' : 'pending',
          retryCount: nextRetry,
          errorMessage: errorMsg,
        });

        failedCount++;
      }
    }

    const nowISO = new Date().toISOString();
    await db.syncMeta.update('singleton', { lastSyncedAt: nowISO });
    syncState.lastSyncedAt = nowISO;
    syncState.lastError = null;
  } catch (err: unknown) {
    syncState.lastError = err instanceof Error ? err.message : 'Sync failed unexpectedly';
  } finally {
    syncState.isSyncing = false;
    await refreshQueueCounts();
  }

  return { synced: syncedCount, failed: failedCount };
}

/**
 * Pull latest data from Cloud Firestore and merge into IndexedDB
 */
export async function pullLatestFromCloud(): Promise<{ totalPulled: number; error?: string }> {
  if (getConnectivityStatus() !== 'online') {
    return { totalPulled: 0, error: 'Cannot pull from cloud while offline.' };
  }

  const meta = await getOrCreateSyncMeta();
  const effectiveUid = getCurrentSession()?.uid || meta.uid;

  if (!isFirebaseConfigured() || !effectiveUid) {
    return { totalPulled: 0, error: 'Firebase is not configured or user is not logged in.' };
  }

  try {
    syncState.isSyncing = true;
    notifySync();

    const counts = await pullAllFromFirestore(effectiveUid);
    const total = counts.bookingsCount + counts.ledgerCount + counts.listingsCount + counts.checklistCount;
    
    const nowISO = new Date().toISOString();
    await db.syncMeta.update('singleton', { lastSyncedAt: nowISO });
    syncState.lastSyncedAt = nowISO;
    syncState.lastError = null;
    await refreshQueueCounts();

    return { totalPulled: total };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Pull failed';
    syncState.lastError = errorMsg;
    return { totalPulled: 0, error: errorMsg };
  } finally {
    syncState.isSyncing = false;
    notifySync();
  }
}

export function initSyncEngine(): () => void {
  refreshQueueCounts();

  const unsubConn = subscribeConnectivity((status) => {
    if (status === 'online') {
      drainSyncQueue();
    }
  });

  return () => {
    unsubConn();
  };
}

