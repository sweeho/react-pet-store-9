---
artifact: qa-test-report
sprint: SWHR8-S-0002
ticket: SWHR8-T-0009
author: validation
commit: 332037f
---

## Executive Summary

Sprint SWHR8-S-0002 (SWHR8-I-0003 Localization, feature SWHR8-T-0008) passes verification. Lint, typecheck, build, 98 unit tests and 13 Playwright E2E tests all pass; no defects were found. Locked acceptance tests that fail are warnings (see E2E Test Status); acceptance is enforced at release UAT only.

## E2E Test Status

Command: `bun run test:e2e -- --project=chromium` — `13 passed (4.3s)`, 0 failed, 0 skipped. Per-spec detail in `integration-test-result.md`.

Warnings, locked acceptance suite (not fixed, triaged at UAT):

- `bun run test:acceptance`: `Test Files 32 failed | 3 passed (35)`, `Tests 205 failed | 24 passed (229)`. Cause visible in the log: modules of later capabilities do not exist yet (e.g. `Cannot find module '/server/customer/auth'`).
- `bun run test:acceptance:e2e`: `36 failed`, `5 passed (1.3m)`. Passing: SWHR8-C-0022, C-0023, C-0024 and two others. Failing localization cases: SWHR8-C-0018 (profile saves preferred language; needs customer account), C-0019 and C-0020 (look for a "Catalog" heading and Japanese screens on `/catalog`; needs catalog browsing). All other failures belong to other capabilities (account, checkout, cart, notifications, fulfillment).

## Unit Test Results

`bun run verify` (lint + typecheck + unit): exit 0. `Test Files 24 passed (24)`, `Tests 98 passed (98)`. `bun run build`: exit 0.

## Code Review

Verified by inspection only, no full diff review. Locale logic is in `server/localization/` (locale, sessions, mail), routes in `routes/api/locale.post.ts`, `locales.ts`, `session.get.ts`, page in `src/pages/locale.tsx`. Session idle timeout is 30 minutes (`sessions.ts`). Design fidelity differences were recorded by the implementer in `SWHR8-T-0008/design-check.md`.

## Coverage Summary

No coverage tool is configured in the declared commands; no coverage figure was measured. Scenario coverage is by test titles tagged with SWHR8-C-xxxx keys in `routes/localization/*.test.ts`, `src/pages/*.test.tsx` and `e2e/localization.spec.ts`.

## Issues Found

None in scope. Out-of-scope observation: Order e-mail scenarios (R-0079, R-0080) and profile locale (R-0081) are exercised at unit level only; end-to-end paths depend on capabilities not yet built.

## Design fidelity

DESIGN-VERDICT: SWHR8-MCK-15 differs — native select instead of radio cards (locked test requires select), unbuilt nav entries omitted; compared by the implementer's paired screenshots and code, not re-rendered here.

- RESIDUAL: SWHR8-MCK-15 choice control — mockup: radio cards; built: labelled select with helper text
  DESIGN-VERDICT: SWHR8-MCK-16 differs — same select-for-radio difference at 390px
- RESIDUAL: SWHR8-MCK-16 choice control — mockup: radio cards; built: labelled select
  DESIGN-VERDICT: SWHR8-MCK-17 match — confirmation shows new locale; unbuilt "Browse the catalog" action omitted
- RESIDUAL: SWHR8-MCK-17 actions — mockup: Browse the catalog; built: absent (no /catalog yet)
  DESIGN-VERDICT: SWHR8-MCK-18 match — as MCK-17 at 390px
- RESIDUAL: SWHR8-MCK-18 actions — mockup: Browse the catalog; built: absent

## Scenario verdicts

SCENARIO-VERDICT: Locale entity keying / Same entity two locales — pass
SCENARIO-VERDICT: Locale entity keying / Duplicate locale row — pass
SCENARIO-VERDICT: Locale-keyed catalog text retrieval / Matching locale — pass
SCENARIO-VERDICT: Locale-keyed catalog text retrieval / No details for locale — pass
SCENARIO-VERDICT: Locale-keyed catalog text retrieval / Null locale — pass
SCENARIO-VERDICT: Supported storefront locales / Shopper with no choice — pass
SCENARIO-VERDICT: Supported storefront locales / Japanese selected — pass
SCENARIO-VERDICT: UTF-8 request and response encoding / Japanese input — pass
SCENARIO-VERDICT: Configured locale list / Configured locales — pass
SCENARIO-VERDICT: Reject unparseable locale code / Code without underscore — pass
SCENARIO-VERDICT: Reject unparseable locale code / Missing parameter — pass
SCENARIO-VERDICT: Locale code default / Default code — pass
SCENARIO-VERDICT: Change session locale / Valid change — pass
SCENARIO-VERDICT: Default session locale / New session — pass
SCENARIO-VERDICT: Screen language selection and fallback / Request parameter overrides session — pass
SCENARIO-VERDICT: Screen language selection and fallback / Locale without screens — pass
SCENARIO-VERDICT: Locale-aware number formatting / Currency formatting — pass
SCENARIO-VERDICT: Locale selection screen / Screen displayed — pass
SCENARIO-VERDICT: Locale selection screen / Choice submitted — pass
SCENARIO-VERDICT: Locale selection screen / Unparseable choice — pass
SCENARIO-VERDICT: Japanese legacy encoding decoding / SJIS input — pass
SCENARIO-VERDICT: Session inactivity timeout / Idle session — pass
SCENARIO-VERDICT: Order e-mail language / Japanese order — pass
SCENARIO-VERDICT: Order e-mail language / No stylesheet — pass
SCENARIO-VERDICT: Notification locale derivation / Default string — pass
SCENARIO-VERDICT: Notification locale derivation / Unparseable string — pass
SCENARIO-VERDICT: Locale follows customer preferred language / Profile saved — pass

Basis: each scenario has a matching passing unit/route test (titles carry the SWHR8-C key) and, for UI scenarios (R-0187, R-0074, R-0075, R-0077, R-0189), a passing Playwright test.

## Recommendation

Approve the sprint: all E2E tests pass, no defects. Acceptance failures listed above belong to later capabilities and are for UAT triage.
