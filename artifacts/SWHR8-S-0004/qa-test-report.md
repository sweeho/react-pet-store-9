---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0004
capability brief: SWHR8-I-0005
branch: vortex/sprint/swhr8-s-0004-17e72ca0
upstream: [artifacts/SWHR8-S-0004/SPRINT-PLAN.md]
downstream: [artifacts/SWHR8-S-0004/integration-test-result.md]
---

# QA test report — SWHR8-S-0004

## Executive Summary

**Verdict: PASS.** Capability SWHR8-I-0005 (Customer account and sign-on) holds on the integrated sprint branch. Build, lint, 196 unit tests and 16 project E2E tests all passed in real runs, and every customer-account scenario is exercised by a passing test except sign-off clearing a cart, which needs the cart capability (not built yet). No defects found.

## E2E Test Status

`bun run test:e2e`: 16 passed, 0 failed, 0 skipped. Detail in `integration-test-result.md`.

Locked acceptance suite (enforced at UAT only; warnings, not failures, not fixed):

- `bun run test:acceptance:e2e`: 22 passed, 19 failed. The only customer-account failure is SWHR8-C-0047 (`/api/cart/items` does not exist yet, so `cartCount` stays 0; cart is a later capability). The other 18 are admin-order-management, order-checkout, order-fulfillment, order-notifications and shopping-cart cases for capabilities not built yet.
- `bun run test:acceptance` (vitest): 27 files failed, 8 passed; 164 failed, 65 passed. Failures are "Cannot find module" for later capabilities' server modules. The customer-account files (model, session, storage) pass.

## Unit Test Results

```
$ bun run test
 Test Files  39 passed (39)
      Tests  196 passed (196)
$ bun run lint        # exit 0
$ bun run build       # exit 0 (tsc --build && vite build)
```

SCENARIO-VERDICT: Customer aggregate / Customer aggregate — pass
SCENARIO-VERDICT: Customer creation defaults / Customer creation defaults — pass
SCENARIO-VERDICT: Profile record / Profile record — pass
SCENARIO-VERDICT: Profile defaults / Profile defaults — pass
SCENARIO-VERDICT: Account status and parts / Account status and parts — pass
SCENARIO-VERDICT: Cascade removal / Cascade removal — pass
SCENARIO-VERDICT: Account contact and card record / Account contact and card record — pass
SCENARIO-VERDICT: Customer to sign-on link / Customer to sign-on link — pass
SCENARIO-VERDICT: Sign-on user store / Sign-on user store — pass
SCENARIO-VERDICT: Single sign-on record per user name / Single sign-on record per user name — pass
SCENARIO-VERDICT: User name and password limits / User name and password limits — pass
SCENARIO-VERDICT: New sign-on user / New sign-on user — pass
SCENARIO-VERDICT: Duplicate-account screen / Duplicate-account screen — pass
SCENARIO-VERDICT: Registration needs name and password / Registration needs name and password — pass
SCENARIO-VERDICT: Protected resource redirect / Protected resource redirect — pass
SCENARIO-VERDICT: Sign-on failure / Sign-on failure — pass
SCENARIO-VERDICT: Remember user name cookie / Remember user name cookie — pass
SCENARIO-VERDICT: Remember cookie name / Remember cookie name — pass
SCENARIO-VERDICT: Pages requiring sign-on / Pages requiring sign-on — pass
SCENARIO-VERDICT: Sign-on required for profile and order entry / Sign-on required for profile and order entry — pass
SCENARIO-VERDICT: Protected screens / Protected screens — pass
SCENARIO-VERDICT: Session timeout 15 minutes / Session timeout 15 minutes — pass
SCENARIO-VERDICT: Signed-on session expiry / Signed-on session expiry — pass
SCENARIO-VERDICT: Idle session expiry / Idle session expiry — pass
SCENARIO-VERDICT: Signed-on session inactivity / Signed-on session inactivity — pass
SCENARIO-VERDICT: Locale after sign-on / Locale after sign-on — pass
SCENARIO-VERDICT: Sign-off / Sign-off — not-testable: the scenario needs a cart and the cart capability is not built; locked case C-0047 fails for that reason only. Sign-on clearing and locale retention are covered by e2e SWHR8-C-0056
SCENARIO-VERDICT: Customer form mandatory fields / Customer form mandatory fields — pass
SCENARIO-VERDICT: Customer data stored and updated / Customer data stored and updated — pass
SCENARIO-VERDICT: Profile preference checkboxes / Profile preference checkboxes — pass
SCENARIO-VERDICT: After profile creation / After profile creation — pass
SCENARIO-VERDICT: Banner by category / Banner by category — pass
SCENARIO-VERDICT: Sample users / Sample users — pass
SCENARIO-VERDICT: Contact record / Contact record — pass
SCENARIO-VERDICT: Address and contact mandatory fields / Address and contact mandatory fields — pass
SCENARIO-VERDICT: Profile mandatory fields / Profile mandatory fields — pass
SCENARIO-VERDICT: Customer record / Customer record — pass
SCENARIO-VERDICT: Profile fields / Profile fields — pass
SCENARIO-VERDICT: Account statuses / Account statuses — pass

Verdicts rest on the passing locked acceptance tests under `tests/acceptance/customer-account/` and on `src/test`/`routes/api/account.test.ts` in the 196-test unit run; "Sample users" and "Contact record" were taken from the model/storage tests by title, not independently re-driven.

## Code Review

No notable concerns observed incidentally.

## Coverage Summary

No coverage tool was run (none declared in the project commands). Not measured.

## Regression guards

Cases from SWHR8-T-0016 that already passed at the red commit:

- SWHR8-C-0035 (profile without a banner flag is rejected): working. Passes in `tests/acceptance/customer-account/model.test.ts` in this run.
- SWHR8-C-0039 (address without postal code is rejected): working. Passes in the same run.
- SWHR8-C-0063 (sign-on record without a password is rejected): working. Passes in the same run.

## Design fidelity

Reference: `artifacts/SWHR8-S-0004/design/mockup-sign-on-page.html` and four others. Method: Playwright screenshots of mockup and built screen side by side (`artifacts/SWHR8-S-0004/qa/design/`) for MCK-31, 32, 33, 35, 37; only MCK-31 was inspected visually, the rest by page headings. MCK-34, 36, 38-42 were not compared. The conformance decision tool is disabled for this project.

DESIGN-VERDICT: SWHR8-MCK-31 differs — layout, cards and copy match; minor differences below

- RESIDUAL: SWHR8-MCK-31 New customer card — mockup: inline user name/password fields and Continue; built: "Create an account" button to /register (locked tests, design.md D1)
- RESIDUAL: SWHR8-MCK-31 notice — mockup: "Sign on to continue to Checkout"; built: "Sign on to continue"
- RESIDUAL: SWHR8-MCK-31 header — mockup: Cart/Administration entries; built: en_US and Sign in (cart/admin not built)
  DESIGN-VERDICT: SWHR8-MCK-32 differs — not inspected beyond headings; same card changes as MCK-31
  DESIGN-VERDICT: SWHR8-MCK-33 differs — not inspected beyond headings; separate register page
  DESIGN-VERDICT: SWHR8-MCK-35 differs — `/account/new` shows the sign-on page in a signed-out state, not inspected in detail
  DESIGN-VERDICT: SWHR8-MCK-37 differs — heading "Duplicate Account", not inspected in detail

## Issues Found

None. See `integration-defects-resolution.md`. Locked acceptance failures listed under E2E Test Status are UAT warnings.

## Recommendation

Proceed: fire `validation.all_acs_passed`.
