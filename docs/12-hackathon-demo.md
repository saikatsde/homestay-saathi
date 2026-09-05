# 12 — Hackathon Demo Script (2 minutes)

## Design Principle
Airplane mode must be **visibly enabled on camera** before any offline claim is demonstrated, and stay enabled through every offline beat — no cuts that could be accused of hiding a network call.

## Timeline

| Time | Beat | On-screen action | What it proves |
|---|---|---|---|
| 0:00–0:15 | Install/load online | Show phone connected to Wi-Fi/data, open install link, tap "Add to Home Screen," open from home screen icon | Real PWA install, one online load, as required |
| 0:15–0:25 | Enable airplane mode | Pull down OS quick settings, tap airplane mode, camera holds on it toggling ON, icon visible in status bar for remainder of demo | Judged requirement: airplane mode visibly enabled |
| 0:25–0:45 | Create a booking | Tap New Booking, fill guest name/dates/amount, save | Offline booking creation, full feature not degraded |
| 0:45–0:55 | Add payment / ledger update | Show ledger auto-updated with the new booking's pending amount | Ledger tied to bookings works offline |
| 0:55–1:20 | Generate/edit a listing with on-device AI | Open Listing Assistant, show `🤖 On-device` badge (proving no cloud call), tap Generate, show result appear, make a small edit | On-device AI functioning with connectivity off — core judged criterion |
| 1:20–1:35 | Translate a guest message | Paste a pre-written English guest inquiry, show Nepali translation + suggested reply appear | Multilingual on-device translation offline |
| 1:35–1:40 | Show offline status | Quick cut to the persistent orange "Offline · N changes waiting" banner, visible throughout — call it out verbally | Reinforces offline-by-default UX, not an afterthought |
| 1:40–1:48 | Turn connectivity back on | Disable airplane mode on camera | Sets up the sync payoff |
| 1:48–1:55 | Show synchronization | Banner transitions Offline → Syncing → Synced, queued items shown draining | Sync Engine works end-to-end |
| 1:55–2:00 | Final dashboard | Return to dashboard showing the new booking, updated ledger, and synced status all in place | Clean close, everything persisted and consistent |

## Narration Notes (spoken over the above, not scripted verbatim)
- Name the real problem in one sentence at 0:00 ("First-time tea-garden homestay hosts, patchy connectivity, this has to work with zero signal").
- At the airplane-mode toggle, say explicitly "airplane mode, on, right now" — make the claim unmissable and simultaneous with the visual.
- At the AI beat, name the on-device model briefly ("this listing was written on-device, no internet, no cloud API") to satisfy the "on-device AI done well" judging criterion verbally as well as visually.

## Pre-Demo Checklist
- [ ] AI model already downloaded on the demo device before recording (not shown as a first-time multi-minute download, which would blow the 2-minute budget — note in README that first-run download is separate from this steady-state demo)
- [ ] Demo device is the pinned minimum-spec test device, or a note explains otherwise
- [ ] Booking/ledger/listing data reset to a clean demo state before recording
- [ ] Screen recording captures the OS status bar (so the airplane icon is visible, not just the in-app banner)
- [ ] Backup take recorded in case of a UI glitch — hackathon submissions are unforgiving of a single flawed take

## Assumptions Requiring Validation
- Exact screen-recording method on the target Android device (built-in recorder vs. external capture) should be tested once, ahead of the real recording session, to avoid a wasted take due to tooling issues.
