---
artifact: qa-test-report
sprint: SWHR8-S-0008
ticket: SWHR8-T-0035
author: validation
---

# QA test report — SWHR8-S-0008

## Executive Summary

Sprint goal "SWHR8-I-0009: Customer notifications" verified on the integrated sprint branch. `bun install`, `bun run build` and `bun run verify` exited 0; Playwright ran 24 passed, 0 failed, 0 skipped. All 10 scenarios of the customer-notifications delta spec are covered by passing automated tests. No defects found. Locked acceptance failures belong to other capabilities and are warnings only.

## E2E Test Status

Command: `bun run test:e2e -- --project=chromium` → `24 passed (6.8s)`. Details in `integration-test-result.md`. This sprint adds no screens or routes, so no browser spec targets notifications.

Locked acceptance suite (`bun run test:acceptance`): `Test Files 19 failed | 16 passed (35)`, `Tests 89 failed | 140 passed (229)`. Warning only (enforced at UAT, not fixed here). Failing files: admin-order-management (order-listing, request-processing, sales-totals); inventory-reporting (backup, diagnostics, health-check, inventory-report, populate-endpoint, revenue-report); order-fulfillment (documents, fulfillment, messaging, order-center, storage); order-reporting-batch (aging-report, nightly-chain, order-extract, order-purge, order-retrieval). Of these, three failing cases touch mail from other capabilities' code (SWHR8-C-0127 aging report mail, SWHR8-C-0126 extract failure mail, SWHR8-C-0195 completed-order notification on partial invoice) and depend on later capabilities. `tests/acceptance/order-notifications/*` is not among the failures. The T-0034 summary records that the locked e2e test for SWHR8-C-0108 was disputed (it needs `POST /api/orders`); I did not re-adjudicate it.

## Unit Test Results

`bun run verify` (lint, typecheck, unit): exit 0. `Test Files 57 passed (57)`, `Tests 311 passed (311)`.

## Code Review

By inspection of the T-0034 summary and scope (`server/notifications/{mailer,order-mail,templates,transport,queue}.ts`, change to `server/approval/queue.ts`). No blocking issues found. Noted: the circular import between approval/queue and notifications/queue (function-level use only, disclosed by the implementer). No independent sub-agent review was run.

## Coverage Summary

Not measured: `@vitest/coverage-v8` is not installed. No coverage number is claimed.

## Issues Found

None. No DEFECT tickets filed.

SCENARIO-VERDICT: Bill-to e-mail recorded on the order / Order placed with a bill-to e-mail — pass
SCENARIO-VERDICT: Failed delivery is discarded / No mail server configured — pass
SCENARIO-VERDICT: Malformed mail request is an error / Request fails validation — pass
SCENARIO-VERDICT: Notifications disabled by default / Notification not enabled — pass
SCENARIO-VERDICT: Mail request queue contract / Valid request consumed — pass
SCENARIO-VERDICT: Mail document structure / Elements out of order — pass
SCENARIO-VERDICT: HTML mail delivery / Multiple recipients — pass
SCENARIO-VERDICT: Order-status mail gated by setting / Completed-order setting disabled — pass
SCENARIO-VERDICT: Order-status mail subjects and templates / Order approved — pass
SCENARIO-VERDICT: Default configuration sends no order mail / Default configuration — pass

## Regression guards

- SWHR8-C-0108: the locked e2e test was disputed by the implementer (needs `POST /api/orders`); no browser test exercises it in this run, and the unit and acceptance tests for notifications pass. Not shown working by Playwright.
- SWHR8-C-0109: shown working indirectly: the notification unit tests and `tests/acceptance/order-notifications` pass in this run. I did not map this case key to a specific test line.

## Recommendation

Pass the sprint. All notification scenarios pass, the gate and E2E are green, and no defects were found. Acceptance failures in other capabilities are deferred to UAT.
