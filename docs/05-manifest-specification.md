# 05 — Web App Manifest Specification

## manifest.json

```json
{
  "name": "Homestay Saathi",
  "short_name": "Saathi",
  "description": "Offline copilot for first-time homestay hosts — bookings, ledger, listings, and guest translation, no data plan needed.",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#2E5339",
  "background_color": "#FDF6EC",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/dashboard.png", "sizes": "720x1280", "type": "image/png", "form_factor": "narrow", "label": "Offline dashboard with today's bookings" },
    { "src": "/screenshots/listing.png", "sizes": "720x1280", "type": "image/png", "form_factor": "narrow", "label": "AI-assisted listing generation" }
  ],
  "shortcuts": [
    { "name": "New Booking", "short_name": "Booking", "url": "/bookings/new", "icons": [{ "src": "/icons/shortcut-booking.png", "sizes": "96x96" }] },
    { "name": "Translate Message", "short_name": "Translate", "url": "/translate", "icons": [{ "src": "/icons/shortcut-translate.png", "sizes": "96x96" }] },
    { "name": "Cash Ledger", "short_name": "Ledger", "url": "/ledger", "icons": [{ "src": "/icons/shortcut-ledger.png", "sizes": "96x96" }] }
  ]
}
```

## Field Rationale

| Field | Choice | Why |
|---|---|---|
| `name` / `short_name` | "Homestay Saathi" / "Saathi" | Full name for install prompt, short name fits under a home-screen icon on small displays |
| `start_url` | `/?source=pwa` | Query param lets analytics (when online) distinguish installed launches from browser visits, without affecting offline routing |
| `scope` | `/` | Entire app is one scope — no sub-app boundaries needed |
| `display` | `standalone` | Removes browser chrome, maximizes usable screen on small devices, reinforces "this is an app not a website" for low digital-literacy users |
| `orientation` | `portrait-primary` | All flows (forms, ledger, checklist) are designed single-column portrait; locking avoids awkward landscape layouts on cheap phones |
| `theme_color` | Deep tea-green (`#2E5339`) | Matches tea-garden visual identity, sets Android status bar color |
| `background_color` | Warm off-white (`#FDF6EC`) | Splash screen background while app boots — reduces perceived flash/jank |
| `icons` | 192/512 any + maskable variants | Maskable icons required for Android adaptive icon shapes to render correctly without clipping |
| `screenshots` | Dashboard + listing generator | Improves the install prompt / app store-style preview on browsers that support rich install UI |
| `shortcuts` | New Booking, Translate, Ledger | Long-press home-screen icon jumps straight to the 3 most time-sensitive actions during a live guest interaction |

## Installation Behavior
- Chrome on Android fires `beforeinstallprompt`; app captures this event and shows a custom "Add Homestay Saathi to your phone" prompt at a contextually sensible moment (after first successful booking or listing generation, not on first load) rather than an intrusive immediate popup.
- After install, the app opens in `standalone` mode with no browser URL bar — critical for the target user's mental model of "an app," not "a website."
- First install must occur online (per hackathon requirement: "installs and works after one online load"); the SW precache (see `03-service-worker-caching.md`) completes during this first load, after which `start_url` resolves entirely from cache.
- Maskable icon safe zone (icon content within the inner 80% circle) must be validated with Maskable.app or equivalent before submission.

## Assumptions Requiring Validation
- Whether target low-end devices' Android/Chrome versions support maskable icons and the rich install screenshot UI (older Chrome falls back to a simpler prompt — non-blocking, cosmetic only).
