---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0009
ticket: SWHR8-T-0039
capability_brief: SWHR8-I-0010
branch: vortex/test/SWHR8-T-0039-integration-qa-report-swhr8-s-0009-73c8ff4d
---

# QA test report — SWHR8-S-0009

## Executive Summary

Sprint goal "SWHR8-I-0010: Order fulfillment and inventory" verified on the integrated sprint branch. `bun install`, `bun run build` and `bun run verify` exited 0; Playwright ran 26 passed, 0 failed, 0 skipped. All 47 scenarios of the order-fulfillment delta spec are backed by passing automated tests. No defects found. Locked acceptance failures (other capabilities) are warnings only.

## E2E Test Status

`bun run test:e2e -- --project=chromium` → `26 passed (9.0s)`, including `e2e/admin-inventory-update.spec.ts` (administrator signs in, sets a quantity, sees it saved) and `e2e/admin-inventory.spec.ts` (SWHR8-C-0229, non-administrator refused). Details in `integration-test-result.md`.

Locked acceptance suite, warnings only (enforced at UAT, not fixed here):

- `bun run test:acceptance`: `Test Files 14 failed | 21 passed (35)`, `Tests 46 failed | 183 passed (229)`. Failing files: admin-order-management (order-listing, request-processing, sales-totals); inventory-reporting (backup, diagnostics, health-check, inventory-report, populate-endpoint, revenue-report); order-reporting-batch (aging-report, nightly-chain, order-extract, order-purge, order-retrieval). All `tests/acceptance/order-fulfillment/*` unit files pass.
- `bun run test:acceptance:e2e`: `8 failed, 33 passed`. Failing: SWHR8-C-0252, 0256, 0259, 0260, 0265, 0266 (admin-order-management UI), SWHR8-C-0034 (customer-account), SWHR8-C-0108 (order-notifications). None is in order-fulfillment; `tests/acceptance/order-fulfillment/inventory-admin.spec.ts` passes.

## Unit Test Results

`bun run verify` (lint, typecheck, unit): exit 0. `Test Files 68 passed (68)`, `Tests 374 passed (374)`.

## Code Review

By inspection of the T-0038 summary and its design-check; no independent review of the code was run by me beyond that. The summary records a sub-agent review with fixes applied. No blocking issue found. Noted deviation: the `order-decision` drain is polled once a second because the approval drain has no hook (disclosed by the implementer).

## Coverage Summary

Not measured: no coverage tool is installed. No coverage number is claimed.

## Issues Found

None. No DEFECT tickets filed.

## Recommendation

Pass the sprint. The gate, E2E and all order-fulfillment acceptance tests are green and no defects were found. Acceptance failures in other capabilities are deferred to UAT.

## Scenario verdicts

Basis: the whole `tests/acceptance/order-fulfillment/` suite and the copies under `src/test/server/fulfillment/` pass in the runs above; I did not map every scenario to an individual test line. UI scenarios R-0009 and R-0215 are additionally shown by the passing Playwright specs.

SCENARIO-VERDICT: Stock clerk sets inventory quantity / Stock clerk sets inventory quantity — pass
SCENARIO-VERDICT: Forward invoices to the order center / Forward invoices to the order center — pass
SCENARIO-VERDICT: Supplier order table constraints / Supplier order table constraints — pass
SCENARIO-VERDICT: Supplier order lines belong to an order / Supplier order lines belong to an order — pass
SCENARIO-VERDICT: Ship a line in full or not at all / Ship a line in full or not at all — pass
SCENARIO-VERDICT: Unstocked item left unshipped without error / Unstocked item left unshipped without error — pass
SCENARIO-VERDICT: Accept supplier order document / Accept supplier order document — pass
SCENARIO-VERDICT: Completion on invoice receipt / Completion on invoice receipt — pass
SCENARIO-VERDICT: Send supplier purchase order for approved orders / Send supplier purchase order for approved orders — pass
SCENARIO-VERDICT: Generated identifiers from named counters / Generated identifiers from named counters — pass
SCENARIO-VERDICT: Inventory quantity per item / Inventory quantity per item — pass
SCENARIO-VERDICT: Unstocked line stays unshipped / Unstocked line stays unshipped — pass
SCENARIO-VERDICT: Purchase order intake and immediate fulfilment / Purchase order intake and immediate fulfilment — pass
SCENARIO-VERDICT: Shipped quantity accumulates per line / Shipped quantity accumulates per line — pass
SCENARIO-VERDICT: Purchase order fully fulfilled test / Purchase order fully fulfilled test — pass
SCENARIO-VERDICT: Default order date / Default order date — pass
SCENARIO-VERDICT: New supplier purchase order starts PENDING / New supplier purchase order starts PENDING — pass
SCENARIO-VERDICT: Inventory record per item / Inventory record per item — pass
SCENARIO-VERDICT: Supplier order document / Supplier order document — pass
SCENARIO-VERDICT: Line item creation / Line item creation — pass
SCENARIO-VERDICT: Line item shipped quantity update and snapshot / Line item shipped quantity update and snapshot — pass
SCENARIO-VERDICT: Purchase order deletion cascades / Purchase order deletion cascades — pass
SCENARIO-VERDICT: Supplier purchase orders found by status / Supplier purchase orders found by status — pass
SCENARIO-VERDICT: Purchase order document form / Purchase order document form — pass
SCENARIO-VERDICT: Supplier order assembled transactionally / Supplier order assembled transactionally — pass
SCENARIO-VERDICT: Invoice published on topic / Invoice published on topic — pass
SCENARIO-VERDICT: Line item from data object / Line item from data object — pass
SCENARIO-VERDICT: Shipped quantities reported by invoice / Shipped quantities reported by invoice — pass
SCENARIO-VERDICT: Order status values / Order status values — pass
SCENARIO-VERDICT: Order documents validated against schema / Order documents validated against schema — pass
SCENARIO-VERDICT: Fulfilment output document encoding / Fulfilment output document encoding — pass
SCENARIO-VERDICT: Fulfil only when stock suffices / Fulfil only when stock suffices — pass
SCENARIO-VERDICT: Skip shipped lines and complete order / Skip shipped lines and complete order — pass
SCENARIO-VERDICT: Supplier order and line storage / Supplier order and line storage — pass
SCENARIO-VERDICT: Reprocess pending orders after stock update / Reprocess pending orders after stock update — pass
SCENARIO-VERDICT: Supplier purchase order persistence / Supplier purchase order persistence — pass
SCENARIO-VERDICT: Resource lookup is cached on web tier / Resource lookup is cached on web tier — pass
SCENARIO-VERDICT: Named resource lookup / Named resource lookup — pass
SCENARIO-VERDICT: Pluggable transition delegates / Pluggable transition delegates — pass
SCENARIO-VERDICT: Supplier order document namespace / Supplier order document namespace — pass
SCENARIO-VERDICT: Order line record / Order line record — pass
SCENARIO-VERDICT: Ship line in full from stock / Ship line in full from stock — pass
SCENARIO-VERDICT: Inventory update restricted to administrators / Inventory update restricted to administrators — pass
SCENARIO-VERDICT: Invoice content / Invoice content — pass
SCENARIO-VERDICT: Line item fields in documents / Line item fields in documents — pass
SCENARIO-VERDICT: Supplier order completion and invoice / Supplier order completion and invoice — pass
SCENARIO-VERDICT: Invoice document / Invoice document — pass

## Design fidelity

No fresh paired renders were made in this run. Verdicts rest on the implementer's `SWHR8-T-0038/design-check.md` (rendered mockups beside the build at the same viewports) as an input I read, not a comparison I ran.

DESIGN-VERDICT: SWHR8-MCK-51 match — layout, hierarchy and states match per design-check; only sample data, shared header/footer differ

- RESIDUAL: SWHR8-MCK-51 page sign-out control — mockup: "Sign out"; built: "Log out" (locked test C-0229 requires it)
  DESIGN-VERDICT: SWHR8-MCK-52 match — rows stack as in the mockup at 390
- RESIDUAL: none
  DESIGN-VERDICT: SWHR8-MCK-53 match — sign-in with failed attempt matches except label "Username"
- RESIDUAL: SWHR8-MCK-53 field label — mockup: "User name"; built: "Username"
  DESIGN-VERDICT: SWHR8-MCK-54 match — mobile sign-in matches
- RESIDUAL: none
  DESIGN-VERDICT: SWHR8-MCK-55 differs — extra "Access denied" line and body wording differ from the mockup
- RESIDUAL: SWHR8-MCK-55 heading region — mockup: heading and "a customer account" body; built: extra "Access denied" line and "not an administrator account"
  DESIGN-VERDICT: SWHR8-MCK-56 differs — same wording differences as MCK-55
- RESIDUAL: SWHR8-MCK-56 heading region — mockup: heading and "a customer account" body; built: extra "Access denied" line and "not an administrator account"
