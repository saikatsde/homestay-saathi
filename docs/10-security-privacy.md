# 10 — Security & Privacy

## Local Data
- All host and guest data lives primarily in IndexedDB on the host's own device — this is by design the most private mode of operation (no server involved unless the host opts into sync).
- No data is transmitted anywhere unless (a) connectivity exists and (b) the host has enabled cloud sync via Firebase Auth.

## Sensitive Guest Information
- Guest phone number is explicitly optional (per brief: "if voluntarily provided") — form never requires it, and copy near the field clarifies it's optional and only used to help the host, not shared elsewhere.
- Guest names/notes are treated as sensitive personal data: never included in analytics, never logged to any external service, never sent to the on-device AI as anything other than local processing (which itself never leaves the device — see `09-ai-architecture.md`).

## Authentication
- Firebase Authentication is required only to enable cloud sync — the app is fully usable, including all P0 features, with zero authentication.
- Preferred method: phone-number OTP (most accessible for the target user, no email/password to forget) or a simple anonymous-auth-upgraded-to-linked-account pattern, so a host can start using the app before deciding to enable sync.

## Encryption Considerations
- IndexedDB itself is not encrypted at rest by the browser by default; the app relies on device-level protection (Android lock screen/disk encryption, standard on modern Android).
- Data in transit to Firebase uses standard TLS via the Firebase SDK — no custom transport is built.
- Explicitly **not** implementing client-side field encryption for the hackathon MVP (documented as a known limitation, not a silent gap) — flagged as a P2/post-hackathon hardening item given the low sensitivity of the data (booking logistics, not financial account numbers or IDs).

## Data Minimization
- Collect only what each of the 7 features needs: no email, no address beyond the homestay's own location, no ID documents, no guest ID numbers.
- Cash ledger stores amounts and status only — no bank/payment account details ever requested (payment happens outside the app, e.g., cash or a separate UPI transfer the host arranges).

## Firestore Security Rules (sketch)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
- Every document is scoped under the authenticated user's own `uid`; no cross-user reads are possible under this rule set.
- `processedOperations` writes are restricted to the idempotency-check path only (client cannot arbitrarily overwrite this collection outside the sync write pattern) — enforced via the same per-uid rule since it's nested identically.

## Local Storage Risks
- A lost/stolen/shared phone exposes IndexedDB contents to anyone with device access — this is the primary realistic risk for this user base (shared family phones are common).
- Mitigation for MVP: a simple app-level PIN/passcode lock (P1) gating app open, independent of device lock screen, since family members may share the device but shouldn't casually browse guest data or the ledger.

## Logout Behavior
- Logging out of Firebase Auth (if the host had enabled sync) does **not** delete local IndexedDB data — the app remains fully usable offline post-logout, since local data is the host's own regardless of cloud account state.
- Logout only clears the sync credential; a clear, separate "Clear all data from this phone" action (with strong confirmation) is offered independently for a host who wants to wipe local data, e.g., before selling/handing off the device.

## Device-Sharing Scenarios
- Given shared-phone likelihood in this community, the app avoids any silent auto-sync-on-open behavior that could push one family member's edits over another's without visibility — all sync activity is visible in the connectivity banner and sync queue (see `06-offline-ux-wireframes.md`), never invisible background behavior.
- No per-user profile switching is implemented for the MVP (single-host-per-install assumption) — documented as a known scope limit, not silently unhandled.

## Assumptions Requiring Validation
- Whether OTP-based phone auth is practical given the same intermittent-connectivity constraints the app is designed around (OTP delivery requires a moment of connectivity) — worth validating that this doesn't create a chicken-and-egg UX problem; anonymous-auth-first with optional later linking is the safer default.
