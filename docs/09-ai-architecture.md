# 09 — AI Architecture

## On-Device AI Strategy
AI is used for two things only: (1) drafting listing text from structured host input, and (2) translating guest messages + suggesting scenario replies. Both must work fully offline once the model is downloaded, and both must degrade to deterministic, non-AI behavior when the model isn't available — never a hung spinner, never a hallucinated claim of connectivity.

## Model Selection
- **Primary:** MediaPipe LLM Inference API running a quantized Gemma variant (e.g., Gemma 2B/Gemma 3 nano-class, whichever quantized `.task` build is confirmed to run acceptably on the minimum test device — to be pinned in the README once benchmarked).
- **Progressive enhancement only:** Chrome's built-in Prompt API (Gemini Nano), used opportunistically *if* `window.ai` / `LanguageModel` is present and ready — never required, never blocking.
- **Translation:** on-device translation via the model above using prompt-based translation, or the browser's native Translator API where available (`translation` origin trial / stable API depending on Chrome version) — whichever is confirmed present is preferred for translation specifically, since a purpose-built translation model is typically smaller/faster than prompting a general LLM for translation.
- No cloud LLM fallback is used for the core flow, per the architectural principle of never silently depending on a cloud service the user expects to be offline.

## Model Loading
- Model file is fetched and cached by the Service Worker's `ai-model-v{N}` cache on first online session (see `03-service-worker-caching.md`), with a visible progress indicator ("Setting up offline AI — 120MB, do this once while you have Wi-Fi").
- Loading is deferred until after the app shell is interactive — the host can use bookings/ledger/checklist immediately without waiting on the model.
- Model initialization (`FilesetResolver` + `LlmInference.createFromOptions`) happens lazily, on first navigation to Listing Assistant or Translator, not eagerly on app boot, to avoid unnecessary memory pressure for hosts who only use the ledger.

## Model Availability Detection
```
checkModelAvailability():
  1. Is the model file present in the SW cache / OPFS? 
     no → status = "not-downloaded"
  2. Can it initialize (WASM + backend) without throwing/timing out (budget: 10s)?
     no → status = "unavailable"
  3. status = "available"
```
- Result cached for the session in a small reactive store; re-checked on app foreground in case of an interrupted download.
- UI badge reflects this status directly (`🤖 On-device` / `⚠️ AI offline` / `⬇️ Downloading…`) — see `06-offline-ux-wireframes.md`.

## Fallback Behavior
| Feature | Model available | Model unavailable |
|---|---|---|
| Listing generation | AI-composed headline/short/detailed/amenities/local-experience text | Deterministic template: fills sentence templates directly from structured form fields (e.g., "{homestayName} is a {rooms}-room homestay in {location} offering {amenities}.") |
| Translation | Model-based translation | Static phrasebook lookup for the 8 supported scenarios only; free-text translation shows "AI offline — try again when the model is ready" rather than guessing |
| Reply suggestion | AI-generated contextual reply | Pre-written template reply per scenario/language, filled with host's stored homestay name/price |

Every fallback output is generated from real, host-provided data — never fabricated content, whether AI or template-based.

## Prompts (Listing Generation)
System framing (paraphrased, not verbatim in-app string): instruct the model to write only from the supplied structured fields, in the target language, at a specified length tier, without inventing amenities, prices, or claims not present in the input. Output requested as structured JSON (`headline`, `shortListing`, `detailedListing`, `amenitiesSummary`, `localExperienceText`) to simplify parsing and avoid free-form text needing regex extraction.

## Structured Outputs
- MediaPipe LLM Inference doesn't guarantee JSON-mode the way a hosted API might — the app requests JSON explicitly in the prompt and applies a tolerant parser (strip code fences, attempt `JSON.parse`, fall back to a single "detailedListing"-only field if parsing fails) rather than crashing the feature on a malformed response.

## Translation Pipeline
1. Host pastes/types guest message.
2. Language auto-detected (heuristic: script/character-range detection for Nepali/Bengali/Hindi vs. Latin script for English — cheap, no model call needed for detection).
3. Translated to host's chosen display language.
4. Host optionally picks a scenario → scenario-specific reply generated/templated in the guest's detected language.

## Listing-Generation Pipeline
Form submit → validate required fields → build prompt from fields → run inference (or template fallback) → parse structured result → write to `listings` store as a draft → host reviews/edits → host saves (marks `generatedBy: 'ai' | 'template'` for transparency, per architectural principle #9 — never blur AI vs. real data).

## Pricing-Assistance Logic
- Deterministic, not AI: takes host-entered factors (rooms, amenities, food included, location tier, season if provided) and applies a simple locally-defined heuristic/lookup table to suggest a price range.
- Explicitly labeled "AI estimate, not live market data" in the UI per the source brief's requirement — this is intentionally rule-based, not model-based, since the risk of the model hallucinating a market rate while offline is unacceptable.
- Clearly separates in the UI: host-entered inputs / any stored historical booking prices from this host's own past bookings / the computed estimate.

## Privacy Considerations
- No guest message content or listing data ever leaves the device for AI processing — inference is 100% on-device, so there is no cloud AI privacy surface for this feature at all.
- Model files themselves contain no user data (general-purpose pretrained weights).
- See `10-security-privacy.md` for broader data handling.

## Do-Not-Invent Guardrails
- Do not claim Chrome Prompt API availability as guaranteed — it is Chrome-version- and flag-dependent, and the app must treat it strictly as optional enhancement detected at runtime, never assumed.
- Do not claim on-device translation coverage beyond the 4 specified languages and 8 scenarios without further validation.
- Do not represent template-based fallback output as "AI-generated" anywhere in the UI or README.

## Assumptions Requiring Validation
- Confirm actual MediaPipe LLM Inference + chosen Gemma build inference latency and memory footprint on the minimum tested device (target: single listing generation completes in a tolerable time, e.g., under ~20–30s, to be measured, not assumed).
- Confirm which Chrome version(s) on target devices expose a stable Translator/Prompt API, if any, versus none at all — README must state this precisely rather than optimistically.
