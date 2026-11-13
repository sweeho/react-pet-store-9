---
artifact: qa-test-report
sprint: SWHR8-S-0010
ticket: SWHR8-T-0044
author: validation
---

# QA test report — SWHR8-S-0010

## Executive Summary

Admin order management (SWHR8-I-0011) passes verification. Build, lint, typecheck, unit tests and the project E2E suite all pass. All 23 scenarios pass. No functional defects. The login screen differs from its mockup in layout (residual, no verdict impact). Locked acceptance failures belong to other capabilities and are warnings for UAT.

## E2E Test Status

`bun run test:e2e`: `28 passed (9.7s)`, 0 failed, 0 skipped. Details in `integration-test-result.md`.

Warnings (locked acceptance, enforced only at UAT, not fixed):

- `bun run test:acceptance:e2e`: 1 failed, 40 passed. Failure: order-notifications/bill-to-email.spec.ts [SWHR8-C-0108] (response was HTML, not JSON).
- `bun run test:acceptance` (vitest): 29 failed, 200 passed, 11 files, all in inventory-reporting and order-reporting-batch (for example `Cannot find module '/routes/api/populate'`). None are in tests/acceptance/admin-order-management, which passes fully.

## Unit Test Results

`bun run verify` (eslint, `tsc --build`, `bun --bun vitest run`), exit 0: `Test Files  77 passed (77)`, `Tests  405 passed (405)`.

## Code Review

Reviewed by running the locked admin acceptance tests and the design-check evidence from SWHR8-T-0042; no source was changed by this ticket. No blocking issues found. The sign-in form reuses the shared `AdminSignOnForm`.

## Coverage Summary

No coverage command is declared for this project and none was run; no coverage figure is claimed. Scenario coverage: every scenario in the change maps to a passing test (below).

- Administrator-only access / Non-administrator denied: SWHR8-C-0252 (e2e, locked acceptance)
- Administrator session expiry / Idle session: SWHR8-C-0262
- Administration launcher / Manage orders chosen: SWHR8-C-0255
- Administration launcher / Logout chosen: SWHR8-C-0256 (e2e)
- Administration launcher / No action given: SWHR8-C-0257
- Admin request error replies / Unknown request type: SWHR8-C-0253
- Admin request error replies / No session: SWHR8-C-0254
- Find orders by status / Pending orders listed: SWHR8-C-0250
- Find orders by status / Case-sensitive match: SWHR8-C-0251
- Order listing with details / Orders with details: SWHR8-C-0248
- Order listing with details / Missing order: SWHR8-C-0249
- Order lists by the four statuses / Count returned: SWHR8-C-0261
- Approve or deny pending orders / Mixed decisions committed: SWHR8-C-0265 (e2e)
- Approve or deny pending orders / Nothing changed: SWHR8-C-0266 (e2e)
- Asynchronous publication of decisions / Decisions published: SWHR8-C-0263
- Asynchronous publication of decisions / Incomplete pair skipped: SWHR8-C-0264
- Sales totals by category or item / Revenue by category: SWHR8-C-0267
- Sales totals by category or item / Any other request is quantity: SWHR8-C-0268
- Order status view / View rows: SWHR8-C-0258
- Warn before refreshing unsaved decisions / Refresh with unsaved changes: SWHR8-C-0259 (e2e)
- Warn before refreshing unsaved decisions / Refresh with no changes: SWHR8-C-0260 (e2e)
- Update-status hand-off to order processing / Approvals committed: SWHR8-C-0269
- Update-status hand-off to order processing / Entry lacking id or status: SWHR8-C-0270

## Issues Found

No defects. Design findings:

### Design fidelity

DESIGN-VERDICT: SWHR8-MCK-57 differs — login: mockup has a centred heading, a separate alert banner and a footer-aligned layout; built is a single card headed "Administrator access required"; I compared the implementer's paired screenshots, not a fresh render.

- RESIDUAL: SWHR8-MCK-57 heading/alert — mockup: "Administrator sign in" heading with a red alert box above the form card, prefilled fields; built: single card with the "Administrator access required" heading and copy, empty fields, nav shows Administration as active.
  DESIGN-VERDICT: SWHR8-MCK-61 differs — see SWHR8-T-0042 design-check.md: Commit label, Log out button, tabs.
- RESIDUAL: SWHR8-MCK-61 primary button — mockup: "Commit changes"; built: "Commit" (locked tests).
  DESIGN-VERDICT: SWHR8-MCK-63 differs — native confirm dialog instead of the styled dialog (design SD6, locked test wins).
- RESIDUAL: SWHR8-MCK-63 dialog — mockup: in-page dialog; built: native confirm.
  DESIGN-VERDICT: SWHR8-MCK-65 differs — no Share column, bars or two-metric summary.
- RESIDUAL: SWHR8-MCK-65 result table — mockup: share column and bars; built: key and total only.
  Other mockups (MCK-58 to 60, 62, 64, 66 to 68): not independently compared; see SWHR8-T-0042 design-check.md for the implementer's recorded differences. Conformance proposals were not recorded.

## Recommendation

Pass the sprint. Every scenario passes and the project's E2E suite is green. Acceptance failures in other capabilities go to UAT. Design residuals above are for the design owner.

SCENARIO-VERDICT: Administrator-only access / Non-administrator denied — pass
SCENARIO-VERDICT: Administrator session expiry / Idle session — pass
SCENARIO-VERDICT: Administration launcher / Manage orders chosen — pass
SCENARIO-VERDICT: Administration launcher / Logout chosen — pass
SCENARIO-VERDICT: Administration launcher / No action given — pass
SCENARIO-VERDICT: Admin request error replies / Unknown request type — pass
SCENARIO-VERDICT: Admin request error replies / No session — pass
SCENARIO-VERDICT: Find orders by status / Pending orders listed — pass
SCENARIO-VERDICT: Find orders by status / Case-sensitive match — pass
SCENARIO-VERDICT: Order listing with details / Orders with details — pass
SCENARIO-VERDICT: Order listing with details / Missing order — pass
SCENARIO-VERDICT: Order lists by the four statuses / Count returned — pass
SCENARIO-VERDICT: Approve or deny pending orders / Mixed decisions committed — pass
SCENARIO-VERDICT: Approve or deny pending orders / Nothing changed — pass
SCENARIO-VERDICT: Asynchronous publication of decisions / Decisions published — pass
SCENARIO-VERDICT: Asynchronous publication of decisions / Incomplete pair skipped — pass
SCENARIO-VERDICT: Sales totals by category or item / Revenue by category — pass
SCENARIO-VERDICT: Sales totals by category or item / Any other request is quantity — pass
SCENARIO-VERDICT: Order status view / View rows — pass
SCENARIO-VERDICT: Warn before refreshing unsaved decisions / Refresh with unsaved changes — pass
SCENARIO-VERDICT: Warn before refreshing unsaved decisions / Refresh with no changes — pass
SCENARIO-VERDICT: Update-status hand-off to order processing / Approvals committed — pass
SCENARIO-VERDICT: Update-status hand-off to order processing / Entry lacking id or status — pass
