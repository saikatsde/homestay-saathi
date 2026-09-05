// Flat Dexie IndexedDB instance per docs/08-data-model.md
import Dexie, { type Table } from 'dexie';
import type { 
  Booking, 
  LedgerEntry, 
  Listing, 
  ChecklistItem, 
  MutationQueueItem, 
  SyncMeta 
} from './types';

export class SaathiDB extends Dexie {
  bookings!: Table<Booking, string>;
  ledgerEntries!: Table<LedgerEntry, string>;
  listings!: Table<Listing, string>;
  checklistItems!: Table<ChecklistItem, string>;
  mutationQueue!: Table<MutationQueueItem, string>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super('SaathiDB');
    this.version(1).stores({
      bookings: 'id, checkIn, checkOut, syncStatus, updatedAt',
      ledgerEntries: 'id, type, sourceBookingId, status, createdAt',
      listings: 'id, updatedAt',
      checklistItems: 'id, stage',
      mutationQueue: 'operationId, entityId, syncStatus, clientTimestamp',
      syncMeta: 'id',
    });
  }
}

export const db = new SaathiDB();

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateSyncMeta(): Promise<SyncMeta> {
  let meta = await db.syncMeta.get('singleton');
  if (!meta) {
    const newDeviceId = `device_${generateUUID().substring(0, 8)}`;
    meta = {
      id: 'singleton',
      deviceId: newDeviceId,
      lastSyncedAt: null,
      authState: 'anonymous',
      hostName: '',
      homestayName: '',
      location: '',
      rooms: 2,
      defaultPrice: 1800,
      preferredLanguage: 'en',
      profileCompleted: false, // Flag for onboarding wizard
    };
    await db.syncMeta.put(meta);
  }
  return meta;
}
