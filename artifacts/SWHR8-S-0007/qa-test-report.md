---
artifact: qa-test-report
sprint: SWHR8-S-0007
ticket: SWHR8-T-0031
author: validation
---

# QA test report — SWHR8-S-0007

## Executive Summary

Sprint goal "SWHR8-I-0008: Order approval" verified on the integrated sprint branch (head 7ed1fdf). `bun install`, `bun run build` and `bun run verify` all exited 0; Playwright ran 24 passed, 0 failed, 0 skipped. Every scenario of the order-approval delta spec is covered by a passing automated test. No defects found. Locked acceptance suite for other (later) capabilities fails; recorded as warnings only.

## E2E Test Status

Command: `bun run test:e2e -- --project=chromium` → `24 passed (7.0s)`. Details in `integration-test-result.md`. This sprint has no UI, so no spec targets order approval directly; approval is exercised by unit/acceptance tests.

Locked acceptance suite (`bun run test:acceptance`): `Test Files 21 failed | 14 passed (35)`, `Tests 98 failed | 131 passed (229)`. Warning only (enforced at UAT, not fixed here). Failing files, all for capabilities outside this sprint (missing modules such as `server/notifications/order-mail`): admin-order-management (order-listing, request-processing, sales-totals), inventory-reporting (backup, diagnostics, health-check, inventory-report, populate-endpoint, revenue-report), order-fulfillment (documents, fulfillment, messaging, order-center, storage), order-notifications (mailer, order-mail), order-reporting-batch (aging-report, nightly-chain, order-extract, order-purge, order-retrieval). `tests/acceptance/order-approval/approval.test.ts` is not among the failures.

## Unit Test Results

`bun run verify` (lint, typecheck, unit): exit 0. `Test Files 53 passed (53)`, `Tests 295 passed (295)`.

## Code Review

Reviewed by inspection of the T-0030 summary and diff scope (`server/approval/service.ts`, `queue.ts`, checkout repository/service changes, `queue_message` migration). No blocking issues found; the implementer's own review noted the synchronous drain deviation. No independent sub-agent review was run.

## Coverage Summary

Not measured: `@vitest/coverage-v8` is not installed (`MISSING DEPENDENCY` when run with `--coverage`). No coverage number is claimed.

## Issues Found

None. No DEFECT tickets filed.

SCENARIO-VERDICT: Administrator hold / Over-limit order — pass
SCENARIO-VERDICT: Order status vocabulary / Invalid status — pass
SCENARIO-VERDICT: Find orders by status / Lookup by status — pass
SCENARIO-VERDICT: Order message carries total and locale / Order message built — pass
SCENARIO-VERDICT: Order message carries total and locale / Total exactly at the limit — pass
SCENARIO-VERDICT: Recognised order statuses / Partly shipped status — pass
SCENARIO-VERDICT: Per-order status record / Order has one status — pass
SCENARIO-VERDICT: Create status record on order receipt / New order received — pass
SCENARIO-VERDICT: Update and read order status / Unknown order — pass
SCENARIO-VERDICT: Approval document validation / Wrong element — pass
SCENARIO-VERDICT: Approval document validation / Fields out of order — pass
SCENARIO-VERDICT: Automatic approval by locale and total / US order under limit — pass
SCENARIO-VERDICT: Automatic approval by locale and total / Order at the limit — pass
SCENARIO-VERDICT: Automatic approval by locale and total / Locale without limit — pass
SCENARIO-VERDICT: Decisions apply only to pending orders / Decision on completed order — pass
SCENARIO-VERDICT: Decisions apply only to pending orders / Decision on pending order — pass
SCENARIO-VERDICT: Order status listing / Order without status record — pass
SCENARIO-VERDICT: Order status listing / Order with status record — pass
SCENARIO-VERDICT: Automatic approval thresholds by locale / Japan order under limit — pass
SCENARIO-VERDICT: Automatic approval thresholds by locale / Order over limit — pass
SCENARIO-VERDICT: Send failure reporting / Queue down — pass
SCENARIO-VERDICT: Transactional send / Caller rolls back — pass
SCENARIO-VERDICT: Shared asynchronous send / Message published — pass

## Regression guards

- SWHR8-C-0092 (an Order with OrderStatus before OrderId is rejected): working; its test in `tests/acceptance/order-approval/approval.test.ts` and the unit suite pass in this run.
- SWHR8-C-0095 (sending to an unavailable queue raises an error to the caller): working; same evidence.

## Recommendation

Pass the sprint. All order-approval scenarios pass, the gate and E2E are green, and no defects were found. Acceptance failures in other capabilities are deferred to UAT.
