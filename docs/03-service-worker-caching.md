# 03 — Service Worker & Caching Strategy

Built on Workbox (`workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-background-sync`).

## Precache (App Shell)
Precached at build time via `workbox-webpack-plugin` / `injectManifest`:
- `/`, core route shells (`/bookings`, `/ledger`, `/listing`, `/translate`, `/checklist`)
- Compiled JS/CSS bundles
- App icons, fonts, manifest.json
- Static UI strings/translation dictionaries for the 4 UI languages (not guest-content translation model — see AI layer)

Precache ensures the app opens and navigates fully offline immediately after first install, before any runtime cache is populated.

## Runtime Caching Rules

| Resource type | Strategy | Cache name | Notes |
|---|---|---|---|
| App shell navigation requests | Cache-first, fallback to precache | `shell-cache-v{N}` | Never network-first — avoids blocking on flaky signal |
| Static assets (images, icons) | Cache-first | `static-assets-v{N}` | Long max-age, versioned filenames |
| Fonts | Cache-first | `fonts-v{N}` | Rarely change |
| On-device AI model files | Cache-first, explicit fetch+cache on first download | `ai-model-v{N}` | Large; downloaded once, never evicted opportunistically |
| Firestore/Firebase API calls | Network-only (handled by SDK, not SW) | n/a | SW does not intercept; Sync Engine handles retry |
| Any other same-origin GET | Stale-while-revalidate | `runtime-v{N}` | Non-critical UI polish assets |

There are no "network-first" resources in this app by design: no core UI content should ever wait on the network. Anything dynamic (bookings, ledger, listings) lives in IndexedDB, not behind a network-first SW route.

## Offline Fallback
- Navigation requests that miss all caches (e.g., a route not yet precached due to a bad deploy) fall back to a dedicated `/offline` shell page that still mounts the full app router — not a dead "you are offline" dead-end.
- Image requests that fail fall back to a local placeholder asset.

## Cache Versioning
- Single `CACHE_VERSION` constant bumped per release, suffixed onto every cache name (`shell-cache-v{N}`).
- On `activate`, SW iterates `caches.keys()` and deletes any cache not matching the current `CACHE_VERSION` prefix set — except `ai-model-v{N}`, which is versioned independently and only invalidated when the model itself changes (models are large; don't force re-download on every app update).

## Update Strategy
- Standard Workbox `skipWaiting` is **not** auto-invoked; instead the SW posts a `SW_UPDATE_AVAILABLE` message to the client, and the UI shows a non-blocking "Update available — refresh" affordance. Forcing an update mid-booking-entry would risk data loss in transit.
- On explicit user refresh, `self.skipWaiting()` + `clients.claim()` runs.

## Cache Invalidation
- Shell/static/fonts/runtime caches: invalidated wholesale on version bump (see above).
- AI model cache: invalidated only via explicit "Update AI model" action in settings, since re-downloading a multi-hundred-MB model on metered/no data is user-hostile.

## Storage Limits
- Before downloading the AI model, check `navigator.storage.estimate()` and warn if projected usage exceeds ~80% of quota.
- IndexedDB writes wrapped with quota-exceeded error handling; on failure, surface a clear "storage full" UI state rather than a silent write failure.

## Failure Handling
- All `fetch` handlers wrapped so a caching failure never throws unhandled — falls through to network, then to offline fallback page/asset.
- SW registration failures (unsupported browser) are caught at the app level; app still functions as a normal (non-installable, non-offline-persistent) web app rather than crashing.

## Assumptions Requiring Validation
- Actual on-disk size of the chosen Gemma/MediaPipe model build, to confirm it fits comfortably within typical low-end Android free storage.
- Whether target devices' Chrome versions support `workbox-background-sync`'s `BackgroundSyncPlugin` reliably, or whether a manual retry-on-visibilitychange fallback is required (see `04-data-sync-protocol.md`).
