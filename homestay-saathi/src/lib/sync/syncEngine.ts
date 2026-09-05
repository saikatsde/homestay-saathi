// Sync Engine & Mutation Queue Manager per docs/04-data-sync-protocol.md
import { db, generateUUID, getOrCreateSyncMeta } from '../db';
import { MutationQueueItem, SyncStatus } from '../types';
import { getConnectivityStatus, subscribeConnectivity } from './connectivity';

export interface SyncEngineStatus {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

type SyncListener = (status: SyncEngineStatus) => void;
const syncListeners = new Set<SyncListener>();

let syncState: SyncEngineStatus = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  lastSyncedAt: null,
  lastError: null,
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
        await new Promise(r => setTimeout(r, 450));
        const serverUpdatedAt = new Date().toISOString();

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

        await db.mutationQueue.update(item.operationId, {
          syncStatus: 'synced',
        });

        syncedCount++;
      } catch (err: any) {
        const nextRetry = item.retryCount + 1;
        const finalFailed = nextRetry >= 8;

        await db.mutationQueue.update(item.operationId, {
          syncStatus: finalFailed ? 'failed' : 'pending',
          retryCount: nextRetry,
          errorMessage: err?.message || 'Sync connection timeout',
        });

        failedCount++;
      }
    }

    const nowISO = new Date().toISOString();
    await db.syncMeta.update('singleton', { lastSyncedAt: nowISO });
    syncState.lastSyncedAt = nowISO;
    syncState.lastError = null;
  } catch (err: any) {
    syncState.lastError = err?.message || 'Sync failed unexpectedly';
  } finally {
    syncState.isSyncing = false;
    await refreshQueueCounts();
  }

  return { synced: syncedCount, failed: failedCount };
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
