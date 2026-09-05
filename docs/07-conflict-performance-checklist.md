# 07 — Conflict Resolution & Performance Checklist

## Conflict-Resolution Policy Summary
(Full detail in `04-data-sync-protocol.md`.)
- Default: Last-Write-Wins by `clientTimestamp`.
- Deletes always win over concurrent updates.
- Field-level merge for bookings; whole-record for listings; append-only for ledger; per-item for checklist.
- All conflicts logged to a visible, plain-language "Sync issues" panel — never resolved silently without a trace.

## Client/Server Precedence Rules
| Situation | Precedence |
|---|---|
| Client mutation vs. no server record yet | Client creates |
| Client update vs. newer server update (different fields) | Merge both |
| Client update vs. newer server update (same field) | Newer `clientTimestamp` wins, older kept in `conflictHistory` |
| Client delete vs. server update | Delete wins |
| Two client devices, same field, simultaneous | Tie-break by `deviceId` string comparison (deterministic, arbitrary but consistent) |

## Entity-Specific Conflict Handling
- **Booking:** field-level merge; overlapping-field conflicts surfaced to host.
- **Ledger entry:** immutable + append-only adjustments; no true conflicts.
- **Listing:** whole-record LWW; never merge partial AI text across two edits.
- **Checklist:** per-item boolean LWW; conflicts here are low-stakes and auto-resolved without prompting the host.

## Performance Budgets

| Budget | Target | Rationale |
|---|---|---|
| JS bundle (initial route, gzipped) | ≤ 180 KB | Keeps first parse/execute fast on low-end CPUs |
| Total precached shell | ≤ 2 MB (excluding AI model) | Reasonable one-time download on a shared/borrowed connection |
| Initial load (Time to Interactive) | ≤ 4s on simulated Slow 3G / low-end CPU throttle | Matches Lighthouse mobile defaults |
| Image budget per screen | ≤ 150 KB total, WebP/AVIF | Screens are icon/illustration-light by design |
| IndexedDB footprint (typical host, 6 months use) | ≤ 20 MB excluding AI model | Bookings/ledger/listings are text-only records |
| AI model size | Document actual size in README; target a quantized build under ~500 MB if feasible on chosen model | Must fit low-end device free storage |
| Memory during AI inference | Must not crash on 2GB RAM class device | Validated in `11-testing-strategy.md` |

## Battery Considerations
- AI inference is on-demand only (user-triggered), never background/periodic.
- No polling loops for connectivity beyond a low-frequency reachability check (≥30s interval).
- Background Sync deferred to the browser's own scheduling, not a custom wake-lock/interval.

## Lighthouse Targets
- Performance ≥ 80 (mobile, throttled)
- PWA installability checks: pass
- Accessibility ≥ 90
- Best Practices ≥ 90

## Low-End Android Testing Checklist
- [ ] App installs on a device with ≤2GB RAM
- [ ] App remains responsive (no ANR) during AI inference
- [ ] Cold start from home-screen icon completes within budget
- [ ] IndexedDB writes succeed under storage pressure (test with device near-full)

## Airplane-Mode Testing Checklist
- [ ] Enable airplane mode → all 7 core features remain fully usable
- [ ] Create/edit/delete a booking → persists across app kill and relaunch, still offline
- [ ] AI listing generation works with model already downloaded
- [ ] Translation works with model already downloaded
- [ ] Disable airplane mode → queued mutations sync automatically without user action
- [ ] Re-enable airplane mode mid-sync → sync pauses cleanly, resumes without duplication (verified via `operationId` idempotency)

## Assumptions Requiring Validation
- Actual Lighthouse scores must be measured against the real chosen minimum test device, not desktop Chrome emulation alone.
- AI model size/performance numbers are placeholders until `09-ai-architecture.md`'s model selection is benchmarked on-device.
