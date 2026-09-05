// Cloud Firestore Synchronization Service per docs/04-data-sync-protocol.md & docs/08-data-model.md
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './config';
import { db } from '../db';
import {
  MutationQueueItem,
  Booking,
  LedgerEntry,
  Listing,
  ChecklistItem,
  SyncMeta,
} from '../types';

/**
 * Sync a single queued mutation to Cloud Firestore with idempotency check
 */
export async function syncMutationToFirestore(
  uid: string,
  item: MutationQueueItem
): Promise<{ success: boolean; serverUpdatedAt: string }> {
  const firestore = getFirebaseFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  const opRef = doc(firestore, `users/${uid}/processedOperations/${item.operationId}`);
  const opSnap = await getDoc(opRef);

  const nowISO = new Date().toISOString();

  // 1. Idempotency check: if this operation was already processed on Firestore, skip reapplying
  if (opSnap.exists()) {
    return { success: true, serverUpdatedAt: nowISO };
  }

  // 2. Resolve target collection and doc ref
  let collectionName = 'bookings';
  if (item.entity === 'ledgerEntry') collectionName = 'ledgerEntries';
  else if (item.entity === 'listing') collectionName = 'listings';
  else if (item.entity === 'checklistItem') collectionName = 'checklistItems';

  const docRef = doc(firestore, `users/${uid}/${collectionName}/${item.entityId}`);

  // 3. Apply operation
  if (item.operation === 'delete') {
    await deleteDoc(docRef);
  } else {
    // create or update
    const cleanedPayload = { ...item.payload };
    // Remove local-only properties if any
    delete (cleanedPayload as Record<string, unknown>).syncStatus;

    await setDoc(
      docRef,
      {
        ...cleanedPayload,
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // 4. Record operation in processedOperations collection for idempotency
  await setDoc(opRef, {
    appliedAt: serverTimestamp(),
    entity: item.entity,
    entityId: item.entityId,
    deviceId: item.deviceId,
    clientTimestamp: item.clientTimestamp,
  });

  return { success: true, serverUpdatedAt: nowISO };
}

/**
 * Pull all data from Cloud Firestore and merge into local IndexedDB
 * Handles field-level merge for bookings and LWW for other entities
 */
export async function pullAllFromFirestore(uid: string): Promise<{
  bookingsCount: number;
  ledgerCount: number;
  listingsCount: number;
  checklistCount: number;
}> {
  const firestore = getFirebaseFirestore();
  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  let bCount = 0;
  let lCount = 0;
  let listCount = 0;
  let cCount = 0;

  // 1. Pull Bookings
  const bookingsSnap = await getDocs(collection(firestore, `users/${uid}/bookings`));
  for (const docSnap of bookingsSnap.docs) {
    const remote = docSnap.data() as Booking;
    const local = await db.bookings.get(remote.id);

    if (!local) {
      // Record only exists remotely, insert to local
      await db.bookings.put({
        ...remote,
        syncStatus: 'synced',
      });
      bCount++;
    } else {
      // Both exist: check timestamps for conflict
      const remoteTime = new Date(remote.updatedAt || 0).getTime();
      const localTime = new Date(local.updatedAt || 0).getTime();

      if (remoteTime > localTime) {
        // Remote is newer: perform field-level merge preserving local notes/phone if remote missing
        const merged: Booking = {
          ...local,
          ...remote,
          notes: remote.notes ?? local.notes,
          guestPhone: remote.guestPhone ?? local.guestPhone,
          syncStatus: 'synced',
          conflictHistory: [
            ...(local.conflictHistory || []),
            {
              field: 'all',
              previousValue: local,
              resolvedAt: new Date().toISOString(),
              sourceDevice: 'cloud-pull',
            },
          ],
        };
        await db.bookings.put(merged);
        bCount++;
      }
    }
  }

  // 2. Pull Ledger Entries
  const ledgerSnap = await getDocs(collection(firestore, `users/${uid}/ledgerEntries`));
  for (const docSnap of ledgerSnap.docs) {
    const remote = docSnap.data() as LedgerEntry;
    const local = await db.ledgerEntries.get(remote.id);
    if (!local) {
      await db.ledgerEntries.put({
        ...remote,
        syncStatus: 'synced',
      });
      lCount++;
    }
  }

  // 3. Pull Listings
  const listingsSnap = await getDocs(collection(firestore, `users/${uid}/listings`));
  for (const docSnap of listingsSnap.docs) {
    const remote = docSnap.data() as Listing;
    const local = await db.listings.get(remote.id);
    if (!local) {
      await db.listings.put({
        ...remote,
        syncStatus: 'synced',
      });
      listCount++;
    } else {
      const remoteTime = new Date(remote.updatedAt || 0).getTime();
      const localTime = new Date(local.updatedAt || 0).getTime();
      if (remoteTime > localTime) {
        await db.listings.put({
          ...remote,
          syncStatus: 'synced',
        });
        listCount++;
      }
    }
  }

  // 4. Pull Checklist Items
  const checklistSnap = await getDocs(collection(firestore, `users/${uid}/checklistItems`));
  for (const docSnap of checklistSnap.docs) {
    const remote = docSnap.data() as ChecklistItem;
    const local = await db.checklistItems.get(remote.id);
    if (!local) {
      await db.checklistItems.put({
        ...remote,
        syncStatus: 'synced',
      });
      cCount++;
    } else {
      const remoteTime = new Date(remote.updatedAt || 0).getTime();
      const localTime = new Date(local.updatedAt || 0).getTime();
      if (remoteTime > localTime) {
        await db.checklistItems.put({
          ...remote,
          syncStatus: 'synced',
        });
        cCount++;
      }
    }
  }

  // 5. Pull Profile Meta if present
  try {
    const profileSnap = await getDoc(doc(firestore, `users/${uid}/profile/meta`));
    if (profileSnap.exists()) {
      const remoteMeta = profileSnap.data() as Partial<SyncMeta>;
      const localMeta = await db.syncMeta.get('singleton');
      if (localMeta) {
        await db.syncMeta.update('singleton', {
          hostName: remoteMeta.hostName || localMeta.hostName,
          homestayName: remoteMeta.homestayName || localMeta.homestayName,
          location: remoteMeta.location || localMeta.location,
          rooms: remoteMeta.rooms || localMeta.rooms,
          defaultPrice: remoteMeta.defaultPrice || localMeta.defaultPrice,
          phone: remoteMeta.phone || localMeta.phone,
        });
      }
    }
  } catch (err) {
    console.warn('[Firestore] Profile pull skipped:', err);
  }

  return {
    bookingsCount: bCount,
    ledgerCount: lCount,
    listingsCount: listCount,
    checklistCount: cCount,
  };
}

/**
 * Sync host profile to Firestore
 */
export async function syncHostProfileToFirestore(uid: string, profile: Partial<SyncMeta>): Promise<void> {
  const firestore = getFirebaseFirestore();
  if (!firestore) return;

  const profileRef = doc(firestore, `users/${uid}/profile/meta`);
  await setDoc(
    profileRef,
    {
      hostName: profile.hostName || '',
      homestayName: profile.homestayName || '',
      location: profile.location || '',
      rooms: profile.rooms || 2,
      defaultPrice: profile.defaultPrice || 1800,
      phone: profile.phone || '',
      preferredLanguage: profile.preferredLanguage || 'en',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
