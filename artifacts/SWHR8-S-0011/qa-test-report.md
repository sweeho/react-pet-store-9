---
artifact: qa-test-report
sprint: SWHR8-S-0011
ticket: SWHR8-T-0049
author: validation
---

# QA test report — SWHR8-S-0011

## Executive Summary

Order batch jobs (SWHR8-I-0012) pass verification. `bun run build`, `bun run lint`, `bun run typecheck`, `bun run test` and the project E2E suite (`bun run test:e2e`) all exit 0. All 18 scenarios of the change pass, backed by the locked acceptance tests for order-reporting-batch (18 passed) and the unit tests. No defects found. The sprint adds no screens, so the E2E run is a regression check only.

## E2E Test Status

`bun run test:e2e`: `28 passed (9.0s)`, 0 failed, 0 skipped. Details in `integration-test-result.md`.

Warnings (locked acceptance, enforced only at UAT, not fixed):

- `bun run test:acceptance` (vitest): 11 failed, 218 passed, 6 files failed, all in tests/acceptance/inventory-reporting (for example `Cannot find module '/server/jobs/backup'`, `/routes/api/populate`). That capability is SWHR8-I-0013, not built yet. None are in order-reporting-batch.
- `bun run test:acceptance:e2e`: 1 failed, 40 passed. Failure: order-notifications/bill-to-email.spec.ts [SWHR8-C-0108]. Outside this sprint's capability.
- order-reporting-batch alone: `Test Files  5 passed (5)`, `Tests  18 passed (18)`.

## Unit Test Results

`bun run test` (`NODE_ENV=test bun --bun vitest run`), exit 0: `Test Files  83 passed (83)`, `Tests  426 passed (426)`.
`bun run lint` exit 0 (max-warnings 0). `bun run typecheck` exit 0. `bun run build` exit 0.

## Code Review

Reviewed the sprint's diff by reading the T-0048 summary and its modules under `server/jobs/` and `scripts/`. No blocking findings. Observations, none a defect:

- Backup and inventory report are placeholders returning 0 (SWHR8-I-0013 builds them); chain gating on the backup is therefore exercised by tests, not by a real backup.
- Aging, inventory and purge run regardless of each other's exit codes; only backup and extract gate the chain, as the spec states.
- Spec tension: SWHR8-R-0222 describes the extract columns plainly, SWHR8-R-0225 says "quoted" CSV. The implementation quotes text fields; acceptance tests pass with it.

## Coverage Summary

No coverage tool is declared for this project and none was run. Test presence by inspection: each of the four jobs and `findOrdersBetween` has tests in `routes/jobs/` and in tests/acceptance/order-reporting-batch (5 files, 18 tests, all passing). Coverage percentage is not measured.

## Issues Found

None. No DEFECT tickets filed.

SPEC-GAP: none identified.

## Recommendation

Approve the sprint. Evidence: exit-0 build, lint, typecheck, 426 unit tests, 28 E2E tests, 18 locked acceptance tests for this capability. Remaining acceptance failures belong to inventory-reporting and order-notifications and are triaged at UAT.

### Scenario verdicts

SCENARIO-VERDICT: Daily order extract file / Previous day's orders exported — pass
SCENARIO-VERDICT: Order extract daily export for Finance / Window boundaries — pass
SCENARIO-VERDICT: Extract trailer line / Trailer written — pass
SCENARIO-VERDICT: Stuck-order aging report / Stuck order listed — pass
SCENARIO-VERDICT: Stuck-order aging report / Nothing stuck — pass
SCENARIO-VERDICT: Supplier-completed mismatch lines / Lost invoice message — pass
SCENARIO-VERDICT: Weekly purge of finished orders / Old completed order purged — pass
SCENARIO-VERDICT: Weekly purge of finished orders / Open order kept — pass
SCENARIO-VERDICT: Nightly batch chain and dependencies / Backup fails — pass
SCENARIO-VERDICT: Nightly batch chain and dependencies / Normal Sunday — pass
SCENARIO-VERDICT: Batch failure notifications / Extract fails — pass
SCENARIO-VERDICT: Batch failure notifications / Aging report finds stuck orders — pass
SCENARIO-VERDICT: Order retention period setting / Retention applied — pass
SCENARIO-VERDICT: Stuck-order threshold / Order just under threshold — pass
SCENARIO-VERDICT: Order retrieval by date range / Orders within range — pass
SCENARIO-VERDICT: Purge removes address of purged order / Address deleted — pass
SCENARIO-VERDICT: Purge removes contact information of purged order / Contact deleted — pass
SCENARIO-VERDICT: Purge removes payment card of purged order / Card deleted — pass
