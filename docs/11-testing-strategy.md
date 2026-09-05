# 11 — Testing Strategy

## Test Matrix

| Scenario | What's verified | Method |
|---|---|---|
| Online, fresh install | Precache completes, all routes load, AI model download starts | Manual + Lighthouse PWA audit |
| Offline (airplane mode), post-install | All 7 core features fully usable: view/create/edit bookings, ledger, checklist, saved listings, AI generation, translation | Manual, airplane mode toggled in OS settings, matches demo script in `12-hackathon-demo.md` |
| Intermittent connectivity | App doesn't crash/hang on connection flap; banner state updates correctly without flicker-spam | Manual using Chrome DevTools network throttling + toggling "Offline" repeatedly |
| Airplane mode specifically | Explicit pass/fail per `07-conflict-performance-checklist.md` airplane-mode checklist | Manual, device airplane toggle (not just DevTools, since real radio state can differ) |
| Sync recovery | Queued mutations from an offline session sync fully and correctly once online, in original causal order | Manual: create 3+ mutations offline, go online, verify Firestore state matches |
| Duplicate mutations | Replaying a mutation with the same `operationId` (simulated retry) does not create duplicate records | Automated unit test against the sync/idempotency function |
| Conflicts | Two simulated devices edit the same booking field offline; verify merge/LWW/conflictHistory behavior matches `04-data-sync-protocol.md` | Automated unit test + manual two-device test |
| Service-worker update | New deploy triggers `SW_UPDATE_AVAILABLE` message, not a forced silent reload; user-triggered update swaps caches cleanly | Manual: deploy a version bump, verify prompt appears, verify old caches purged post-update |
| IndexedDB corruption | Simulate a malformed record (manual DB edit via DevTools) and verify the app surfaces a recoverable error rather than crashing the whole app | Manual |
| AI unavailable | Model deliberately not downloaded / initialization forced to fail; verify template fallback activates with correct labeling, no hung UI | Manual + automated unit test on `checkModelAvailability` branch logic |
| Low memory | App behavior when device is under memory pressure during inference (backgrounding other apps to simulate) | Manual on minimum test device |
| Low-end Android | Full feature pass on the pinned minimum-spec device from README | Manual, dedicated device |
| Multilingual content | All 4 languages render correctly (no tofu/missing glyphs) in UI chrome, listings, and translated guest replies; RTL not needed (all 4 are LTR) but script-mixing (e.g., Devanagari + Latin) doesn't break layout | Manual visual pass per language |

## Automated Test Coverage (unit/integration)
- Sync Engine: mutation queue creation, idempotency, retry/backoff calculation, conflict resolution logic per entity type.
- Domain services: booking/ledger/checklist CRUD operations write correct IndexedDB records via Dexie's in-memory/fake-indexeddb test adapter.
- AI availability detection: state machine transitions (`checking → available/unavailable/downloading`) under mocked success/failure/timeout conditions.
- Template fallback generators: deterministic output given fixed input, snapshot-tested.

## Manual Test Sessions
- One full pass per core user journey (`01-product-requirements.md` Journeys A–E) on the minimum tested device with airplane mode as the primary test condition, not an afterthought.
- Two-device conflict test performed at least once before submission, since this is easy to skip and is a judged "on-device AI/offline done well" signal.

## Minimum Tested Device
- To be pinned explicitly in the README once selected (target: a real ~2–3GB RAM Android device, Chrome stable channel) — never left as "should work on most phones" without a named, tested baseline, per hackathon README requirement.

## Assumptions Requiring Validation
- Exact `fake-indexeddb`/Dexie test tooling compatibility with the Next.js test runner chosen (Vitest/Jest) — a quick spike before committing to full unit-test coverage is worthwhile given solo-developer time constraints.
