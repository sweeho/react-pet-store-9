---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0012
capability brief: SWHR8-I-0013
branch: vortex/sprint/swhr8-s-0012-45fb8d6d
upstream: [artifacts/SWHR8-S-0012/SPRINT-PLAN.md]
downstream: [artifacts/SWHR8-S-0012/sprint-summary.md]
---

# QA test report — SWHR8-S-0012

## Executive Summary

Verdict: pass. The integrated sprint branch (head 30087a1) builds, lints, type-checks, and passes 450 unit tests, 229 locked acceptance tests and 28 Playwright E2E tests with 0 failed and 0 skipped. All 15 scenarios of change swhr8-i-0013 are covered by passing acceptance and unit tests. No defects found.

This capability has no screen of its own, so the batch jobs, backup, health check and populate endpoint were verified through their acceptance tests (real route/job code, injected clocks and fetch stubs), not against a live scheduler.

## E2E Test Status

`bun run test:e2e`: 28 passed, 0 failed, 0 skipped (chromium). Details in `artifacts/SWHR8-S-0012/integration-test-result.md`. Locked acceptance suite `bun run test:acceptance`: 35 files, 229 tests passed; no acceptance warnings.

## Unit Test Results

Command: `bun run verify` (lint, typecheck, unit). Output: `Test Files  89 passed (89)`, `Tests  450 passed (450)`. Lint and `tsc --build` exit 0. `bun run build` exit 0.

SCENARIO-VERDICT: Daily low-stock inventory report / Items below the limit — pass
SCENARIO-VERDICT: Daily low-stock inventory report / Item without English description — pass
SCENARIO-VERDICT: Sample data load endpoint / Data already present — pass
SCENARIO-VERDICT: Sample data load endpoint / Forced reload — pass
SCENARIO-VERDICT: Admin revenue and order-quantity reports / No category given — pass
SCENARIO-VERDICT: Admin revenue and order-quantity reports / Category given — pass
SCENARIO-VERDICT: Diagnostic output switch / Switch off — pass
SCENARIO-VERDICT: Diagnostic output switch / Switch on and exception reported — pass
SCENARIO-VERDICT: Low-stock threshold in the daily extract / Threshold applied — pass
SCENARIO-VERDICT: Backup retention period / Old backup removed — pass
SCENARIO-VERDICT: Inventory extract file / Extract written — pass
SCENARIO-VERDICT: Catalog integrity exit code / Item priced below cost — pass
SCENARIO-VERDICT: Catalog check first load request / Populate request fails — pass
SCENARIO-VERDICT: Nightly online backup / Backup taken — pass
SCENARIO-VERDICT: Web module availability check / Module answers with an error — pass

Verdicts rest on `tests/acceptance/inventory-reporting/*.test.ts` (backup, catalog-check, diagnostics, health-check, inventory-report, populate-endpoint, revenue-report) passing, not on a live-scheduler run.

## Code Review

No notable concerns observed. The ticket summary notes the forced reload was checked for FK safety and that `inventory-store.ts` was added beyond PLAN.md, mirroring `order-batch-store.ts`.

## Coverage Summary

No coverage tool was run (none declared in the project commands). No coverage figure is claimed.

## Issues Found

None. See `integration-defects-resolution.md`.

## Recommendation

Proceed: fire `validation.all_acs_passed`.
