# 01 — Product Requirements

## Product Vision
Homestay Saathi ("saathi" = companion) is an offline-first PWA copilot for first-time homestay hosts in tea-garden villages of the Darjeeling Himalayan hills. It replaces the need for continuous connectivity, a laptop, or fluent English/typing skills with a phone-first toolkit that works the moment it's installed and keeps working in a dead zone.

## Problem
Tea-garden families — often women who already carry the bulk of tea-garden labor — are turning spare rooms into income via homestays, but they lack:
- A way to talk to guests who don't speak Nepali/Bengali/Hindi
- A simple, trustworthy way to track bookings and money without a notebook or a fragile spreadsheet
- Help writing an appealing listing in a second/third language
- A sense of what to charge
- A repeatable checklist so hosting feels less overwhelming the first time

Connectivity in these villages is patchy: 2G/no data is common, and any tool that assumes constant internet fails at the exact moment it's needed (mid check-in, mid-booking).

## Target Users
- **Primary:** First-time homestay host, tea-garden family member, using a low-end Android phone (2–3GB RAM class), often more comfortable with voice/local language than English typing.
- **Secondary:** Returning guests who send inquiries in English/Hindi/Bengali that the host needs translated and answered.

## User Journeys

### Journey A — First Launch (online, once)
Host installs the PWA from a shared link while at a spot with signal → app precaches shell, model assets download in background → host completes a short onboarding (name, homestay basics) → app is now installable/offline-capable.

### Journey B — Guest Inquiry (offline)
Guest message arrives via SMS/WhatsApp (read outside app) → host pastes/types it into Homestay Saathi → on-device translation shows meaning → host picks a scenario (pricing, directions, rules) → app suggests a polite reply in the guest's language → host copies reply back out.

### Journey C — Booking + Ledger (offline)
Host creates a booking with guest details, dates, amount → cash ledger updates automatically → host marks payment status during/after stay.

### Journey D — Listing Creation (offline)
Host fills a structured form (rooms, amenities, food, attractions, rules, price) → on-device model drafts headline + short + detailed listing → host edits/approves → listing saved locally, shareable via Web Share once online.

### Journey E — Connectivity Returns
Banner shifts from "Offline" to "Syncing" → queued mutations sync to Firestore → banner shows "Synced" with timestamp → app remains fully usable throughout.

## Feature Requirements
1. Guest Communication (translation + reply generation, 4 languages, 8 scenarios)
2. Listing Assistant (structured input → generated listing variants)
3. Pricing Assistant (local-factor estimate, clearly labeled as estimate)
4. Booking Ledger (CRUD, offline)
5. Cash Ledger (derived from bookings + manual expenses)
6. Hosting Checklist (before/during/after, persisted state)
7. Offline Mode (default, not fallback)

## Functional Requirements
- All 7 core features must be creatable/viewable/editable fully offline after first load.
- AI features must detect model availability and degrade to deterministic templates when unavailable.
- Sync must be queue-based, idempotent, and resumable.
- UI must show connectivity + sync state at all times.

## Non-Functional Requirements
- Installable PWA, single online load required.
- Works on low-end Android (Chrome, ~2–3GB RAM), degraded gracefully on unsupported devices.
- JS bundle and asset budgets per `07-conflict-performance-checklist.md`.
- No core flow may silently depend on a network call.
- Data minimization: only store what's needed; guest phone numbers are optional.

## Offline / Online Feature Matrix

| Feature | Offline | Online-only enhancement |
|---|---|---|
| View/create/edit bookings | ✅ Full | — |
| Cash ledger | ✅ Full | — |
| Hosting checklist | ✅ Full | — |
| View saved listings | ✅ Full | — |
| Generate listing (on-device model loaded) | ✅ Full | Chrome Prompt API as extra option |
| Translation (model loaded) | ✅ Full | — |
| Pricing assistant | ✅ Full (local factors only) | — |
| Cloud backup / sync | ❌ | ✅ |
| Web Share to external apps | ❌ (queued) | ✅ |
| Remote model/app updates | ❌ | ✅ |
| Analytics | ❌ | ✅ |

## MVP Scope (P0)
Booking ledger, cash ledger, hosting checklist, offline shell, connectivity/sync banner, listing assistant with deterministic template fallback, translation for the 4 languages with graceful "model unavailable" state.

## Stretch Scope (P1/P2)
Chrome Prompt API enhancement, Firebase sync/auth, Web Share posting, richer pricing heuristics, multi-homestay support, voice input.

## Acceptance Criteria
- App installs and reloads fully in airplane mode after one online visit.
- A booking created offline persists across app restarts and syncs once online.
- Listing generation produces output even with the AI model absent (template fallback), clearly labeled as such.
- Offline banner is visible within 1 second of connectivity loss.

## Hackathon Judging Alignment

| Criterion | Weight | How this PRD addresses it |
|---|---|---|
| Works offline | 25% | Offline is the default state for all 7 features; matrix above defines exact behavior |
| Usefulness to the hills | 25% | Journeys built around real host workflows: SMS-pasted guest messages, cash-based ledger, first-time-host checklist |
| On-device AI done well | 20% | Listing + translation run on-device with explicit availability detection and non-hallucinated fallback |
| Craft | 15% | Consistent offline/sync UX states, honest labeling of AI vs. host-entered data |
| Belonging | 15% | Nepali/Bengali/Hindi/English first-class, low-literacy-friendly UI, designed for a woman running a tea-garden homestay, not a generic PWA demo |
