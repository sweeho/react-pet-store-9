---
artifact: qa-test-report
sprint: SWHR8-S-0006
ticket: SWHR8-T-0027
---

# QA test report — SWHR8-S-0006

## Executive Summary

Sprint goal "SWHR8-I-0007: Order checkout and payment details" is verified on the integrated sprint branch (head c3d66f3). Build, lint, typecheck, unit tests and the project E2E suite all pass, and every order-checkout acceptance test (vitest and Playwright) passes. No defects found. Acceptance failures in other capabilities are warnings (enforced at release UAT only).

## E2E Test Status

Command: `bun run test:e2e` (chromium project, 7 spec files). Result: `24 passed (8.1s)`, 0 failed, 0 skipped. Details in `integration-test-result.md`.

Locked acceptance suite (warnings only, not fixed, triaged at UAT):

- `bunx playwright test -c playwright.acceptance.config.ts`: 31 passed, 10 failed. None are in `tests/acceptance/order-checkout/`; all order-checkout browser tests pass (C-0182, C-0183, C-0185 and the rest of that file).
- `bun --bun vitest run --config vitest.acceptance.config.ts`: 108 passed, 121 failed. Zero failures under `tests/acceptance/order-checkout/`. Failures are in admin-order-management, inventory-reporting, order-approval, order-fulfillment, order-notifications, order-reporting-batch: capabilities not built by this sprint.

Playwright acceptance failures (warnings):

- tests/acceptance/admin-order-management/admin-ui.spec.ts:106:3 › admin order management UI › [SWHR8-C-0260] refresh with no changes reloads the lists without a warning
- tests/acceptance/admin-order-management/admin-ui.spec.ts:126:3 › admin order management UI › [SWHR8-C-0265] committing mixed decisions sends an approved request and a denied request, then reloads
- tests/acceptance/admin-order-management/admin-ui.spec.ts:148:3 › admin order management UI › [SWHR8-C-0266] committing with every order still PENDING sends no status-change request
- tests/acceptance/admin-order-management/admin-ui.spec.ts:40:3 › admin order management UI › [SWHR8-C-0252] a non-administrator is refused the admin entry point and offered a login form
- tests/acceptance/admin-order-management/admin-ui.spec.ts:51:3 › admin order management UI › [SWHR8-C-0256] choosing logout shows the logout page
- tests/acceptance/admin-order-management/admin-ui.spec.ts:78:3 › admin order management UI › [SWHR8-C-0259] refresh with an uncommitted change warns and reloads the lists only on OK
- tests/acceptance/customer-account/account.spec.ts:62:3 › customer account › [SWHR8-C-0034] registering after requesting the order page signs on and returns to the order page
- tests/acceptance/localization/localization.spec.ts:50:3 › localization › [SWHR8-C-0022] the locale selection screen offers en_US, de_DE, ja_JP and zh_CN with a submit control
- tests/acceptance/order-fulfillment/inventory-admin.spec.ts:10:3 › inventory update access › [SWHR8-C-0229] a signed-in user without the administrator role is refused the inventory update
- tests/acceptance/order-notifications/bill-to-email.spec.ts:10:1 › [SWHR8-C-0108] bill-to e-mail is stored on the order and shown in the confirmation

## Unit Test Results

Command: `bun run verify` (lint + typecheck + unit). Output: `Test Files 51 passed (51)`, `Tests 267 passed (267)`; eslint and `tsc --build` exit 0. `bun install && bun run build` exit 0.

## Code Review

Not a per-ticket re-review. The checkout change merged via SWHR8-T-0026 after its own code-review fixes. I read the T-0026 summary, design-check and tdd-test-result; no new code changed in this ticket.

## Coverage Summary

No coverage tool is configured in this project (no coverage command declared), so no coverage figure is reported.

## Issues Found

None in this sprint's scope. Warning only: out-of-scope acceptance failures listed under E2E Test Status.

## Design fidelity

Compared via the T-0026 paired screenshots (mockup vs built) at `artifacts/SWHR8-S-0006/SWHR8-T-0026/design-check/`; I re-viewed the MCK-43 pair myself. Layout, sections, copy and fixed card match; differences are sample data and the shell navigation, which this change does not own.

DESIGN-VERDICT: SWHR8-MCK-43 match — form, summary and payment card match; only sample data and shell nav differ

- RESIDUAL: none

Other mockups (MCK-44 to MCK-50) were not independently re-rendered by me; their built screenshots exist from T-0026.

## Recommendation

Pass the sprint. Evidence: the commands above, run on the integrated branch. Scenario verdicts (all order-checkout scenarios are covered by passing unit/acceptance tests and E2E):

SCENARIO-VERDICT: Purchase order record / An order references a missing card — pass
SCENARIO-VERDICT: Purchase order record / A complete order is stored — pass
SCENARIO-VERDICT: Order lines / Two lines on one order — pass
SCENARIO-VERDICT: Order line quantity limits / Zero quantity — pass
SCENARIO-VERDICT: Order line quantity limits / Over-shipped — pass
SCENARIO-VERDICT: Payment card record / Card missing expiry — pass
SCENARIO-VERDICT: Payment card record / Free-text expiry — pass
SCENARIO-VERDICT: Card creation without validation / Malformed card — pass
SCENARIO-VERDICT: Card expiry month and year / Expiry parsed — pass
SCENARIO-VERDICT: Card expiry fallback / No slash — pass
SCENARIO-VERDICT: Required contact data at checkout / Blank city — pass
SCENARIO-VERDICT: Required contact data at checkout / Optional fields blank — pass
SCENARIO-VERDICT: Fixed card on checkout / Account has its own card — pass
SCENARIO-VERDICT: Order total / Two lines — pass
SCENARIO-VERDICT: Order identification and stamping / Order placed — pass
SCENARIO-VERDICT: Asynchronous order submission / Order sent — pass
SCENARIO-VERDICT: Checkout form pre-fill / Signed-in customer — pass
SCENARIO-VERDICT: Order processing receipt / Order message received — pass
SCENARIO-VERDICT: Unique identifier generation / Second request — pass
SCENARIO-VERDICT: Identifier counter bootstrap / First request — pass
SCENARIO-VERDICT: Identifier counter failure / Lookup fails — pass
SCENARIO-VERDICT: Address XML input / Wrong root — pass
SCENARIO-VERDICT: Line item interchange / Line serialized — pass
SCENARIO-VERDICT: Credit card mandatory fields / Credit card mandatory fields case 1 — pass
SCENARIO-VERDICT: Credit card mandatory fields / Credit card mandatory fields case 2 — pass
SCENARIO-VERDICT: Order counter and order lookups / Order counter and order lookups case 1 — pass
SCENARIO-VERDICT: Order counter and order lookups / Order counter and order lookups case 2 — pass
SCENARIO-VERDICT: Billing and shipping contact data required / Billing and shipping contact data required case 1 — pass
SCENARIO-VERDICT: Billing and shipping contact data required / Billing and shipping contact data required case 2 — pass
SCENARIO-VERDICT: Payment card attributes / Payment card attributes case 1 — pass
SCENARIO-VERDICT: Line item transactions and access / Line item transactions and access case 1 — pass
SCENARIO-VERDICT: Identifier counter entity / Identifier counter entity case 1 — pass
SCENARIO-VERDICT: Order line item attributes / Order line item attributes case 1 — pass
SCENARIO-VERDICT: Order numbers from the 1001 counter / Order numbers from the 1001 counter case 1 — pass
