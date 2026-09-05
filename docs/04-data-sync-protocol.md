# 04 — Data Sync Protocol

## Goals
- Every offline write is captured exactly once and eventually reaches Firestore, even across app restarts, crashes, or long offline periods.
- Sync is never a precondition for using the app.
- Conflicts are resolved predictably without silently discarding a host's or guest's data.

## IndexedDB Stores (sync-relevant)
- `bookings`, `ledgerEntries`, `listings`, `checklistState` — entity stores, each record carries sync metadata (see `08-data-model.md`).
- `mutationQueue` — append-only log of pending operations.
- `syncMeta` — singleton record: `lastSyncedAt`, `deviceId`, `authState`.

## Mutation Format
```json
{
  "operationId": "uuid-v4",
  "entity": "booking",
  "entityId": "uuid-v4",
  "operation": "create|update|delete",
  "payload": {},
  "clientTimestamp": "ISO-8601",
  "syncStatus": "pending|syncing|synced|failed",
  "retryCount": 0,
  "lastAttemptAt": null,
  "deviceId": "uuid-v4"
}
```
- `operationId` is generated client-side and is the idempotency key — the same mutation replayed twice (e.g., after a retry) is a no-op server-side if `operationId` already applied.
- `deviceId` persists per install (stored in `syncMeta`), used for conflict attribution and debugging, not for authentication.

## Local Mutation Flow
1. Domain service writes directly to the entity store (source of truth for the UI).
2. Same transaction appends a row to `mutationQueue` with `syncStatus: "pending"`.
3. Dexie transaction ensures both writes succeed or fail together (no orphaned queue entries).

## Connectivity Detection
- `ConnectivityDetector` combines `navigator.onLine` + periodic lightweight reachability check (see `02-pwa-architecture.md`).
- On transition to online: emits `connectivity:online`, which the Sync Engine subscribes to.

## Sync Trigger Points
- `connectivity:online` event
- Service Worker `sync` event (Background Sync API), tag `sync-mutations`, registered whenever a mutation is queued while offline
- Manual "Sync now" button (always visible, always safe to press)
- App foreground/visibility change, throttled to once per 30s

## Retry Policy
- Exponential backoff per mutation: `delay = min(baseDelay * 2^retryCount, maxDelay)`, `baseDelay = 2s`, `maxDelay = 5min`.
- `retryCount` increments on failure; after 8 failed attempts, mutation is marked `syncStatus: "failed"` and surfaced in a "Sync issues" UI panel rather than retried silently forever.
- Background Sync API is used where supported as the primary retry trigger (browser-managed backoff); the app-level exponential backoff is the fallback for browsers without reliable Background Sync support.

## Idempotency & Server Acknowledgement
- Firestore write path (Cloud Function or client SDK with a transaction) checks a `processedOperations` collection keyed by `operationId` before applying; duplicate `operationId` is acknowledged as success without reapplying.
- On acknowledgement, client sets `syncStatus: "synced"` and records server-assigned `serverUpdatedAt` on the entity for conflict comparisons.

## Partial Failure
- Mutations sync individually, not as an all-or-nothing batch — one failing booking sync must not block ledger or listing sync.
- Sync Engine processes the queue in `clientTimestamp` order per entity to preserve causal order (e.g., create before its own update).

## Conflict Resolution
Conflicts arise mainly from the same record being edited on two devices (e.g., host's phone + a family member's phone) before either synced.

**Default rule: Last-Write-Wins by `clientTimestamp`, with field-level merge for non-overlapping fields where cheap to compute.**

| Entity | Rule |
|---|---|
| Booking | Field-level merge (dates, guest count, amount, notes are independent fields); if the *same field* was changed on both sides, later `clientTimestamp` wins; the losing value is retained in a `conflictHistory` array for host review |
| Ledger entry | Immutable once synced — edits create a new `adjustment` entry rather than mutating history, so there's no real conflict case |
| Listing | Whole-record LWW (listings are edited as a unit; merging partial AI-generated text is not safe) |
| Checklist state | Per-item boolean, LWW per item (cheap, low conflict risk) |

- All conflict outcomes are logged locally and, if the host opens "Sync issues," shown in plain language ("Booking for Ramesh was updated on two devices — kept the newer change").
- Deletes always win over concurrent updates to the same entity (a delete is assumed intentional and final).

## Assumptions Requiring Validation
- Background Sync API reliability across the actual Android Chrome versions on target test devices — confirm during `11-testing-strategy.md` execution.
- Firestore transaction cost/latency for the `processedOperations` idempotency check at expected scale (trivial for a hackathon demo, noted for completeness).
