# 08 — Data Model

## IndexedDB Schema (Dexie)

```ts
// db.ts
import Dexie, { Table } from 'dexie';

export interface Booking {
  id: string;              // uuid
  guestName: string;
  guestPhone?: string;
  checkIn: string;         // ISO date
  checkOut: string;        // ISO date
  guests: number;
  amount: number;
  paymentStatus: 'pending' | 'partial' | 'settled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  serverUpdatedAt?: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  conflictHistory?: Array<{ field: string; previousValue: unknown; resolvedAt: string }>;
}

export interface LedgerEntry {
  id: string;
  type: 'income' | 'expense' | 'adjustment';
  sourceBookingId?: string;   // links income entries to a booking
  amount: number;
  description: string;
  status: 'pending' | 'settled';
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface Listing {
  id: string;
  homestayName: string;
  location: string;
  rooms: number;
  amenities: string[];
  food: string;
  attractions: string[];
  houseRules: string[];
  price: number;
  headline?: string;
  shortListing?: string;
  detailedListing?: string;
  amenitiesSummary?: string;
  localExperienceText?: string;
  generatedBy: 'ai' | 'template';
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface ChecklistItem {
  id: string;               // e.g. "before-room-prepared"
  stage: 'before' | 'during' | 'after';
  label: string;
  done: boolean;
  updatedAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
}

export interface MutationQueueItem {
  operationId: string;
  entity: 'booking' | 'ledgerEntry' | 'listing' | 'checklistItem';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  clientTimestamp: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastAttemptAt: string | null;
  deviceId: string;
}

export interface SyncMeta {
  id: 'singleton';
  deviceId: string;
  lastSyncedAt: string | null;
  authState: 'anonymous' | 'authenticated';
}

class SaathiDB extends Dexie {
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
```

## Firestore Schema (mirror, sync target)

```
/users/{uid}/bookings/{bookingId}
/users/{uid}/ledgerEntries/{entryId}
/users/{uid}/listings/{listingId}
/users/{uid}/checklistItems/{itemId}
/users/{uid}/processedOperations/{operationId}   // idempotency ledger, { appliedAt }
```
- Scoped under `/users/{uid}` so security rules can restrict access per-host with a single rule (see `10-security-privacy.md`).
- `processedOperations` is a lightweight existence-check collection; documents can be TTL-pruned after e.g. 90 days.

## Indexes
- IndexedDB: `checkIn`/`checkOut` on `bookings` for dashboard "today" queries; `syncStatus` on all syncable stores for the Sync Engine's pending-item queries; `clientTimestamp` on `mutationQueue` for ordered draining.
- Firestore: composite index on `bookings` (`checkIn` ascending) per user for the same dashboard query when synced data is read back (e.g., new device restore).

## Relationships
- `LedgerEntry.sourceBookingId → Booking.id` (nullable — manual expenses have no booking link).
- `MutationQueueItem.entityId → {Booking|LedgerEntry|Listing|ChecklistItem}.id`.
- No relational joins are performed in IndexedDB queries beyond simple key lookups — kept intentionally flat for a solo-developer build.

## Sync Metadata (per-record)
- `syncStatus`, `updatedAt` (client), `serverUpdatedAt` (set only after acknowledgement) live directly on each entity — avoids a separate metadata table requiring joins on every read.

## Migrations
- Dexie's `version(n).stores()` + `upgrade()` callback handles schema migrations.
- Migration principle: additive first (new optional fields), destructive changes only behind a major version bump with an explicit data-transform step and a pre-migration backup export to Firestore where possible.
- v1 is the hackathon submission baseline; no migrations expected within the hackathon window, but the pattern is established for post-hackathon iteration.

## Assumptions Requiring Validation
- None beyond standard Dexie/IndexedDB behavior — this schema is intentionally conservative and framework-idiomatic.
