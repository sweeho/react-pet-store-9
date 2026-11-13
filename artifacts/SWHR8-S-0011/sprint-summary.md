---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0011
capability_brief: SWHR8-I-0012
branch: vortex/sprint/swhr8-s-0011-bc341f3d
upstream: [artifacts/SWHR8-S-0011/SPRINT-PLAN.md, artifacts/SWHR8-S-0011/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0011/release-notes.md]
---

# Sprint summary — SWHR8-S-0011

The sprint goal was met. The store now has unattended order batch jobs:

- a daily Finance extract with a trailer line and a failure mail;
- a stuck-order aging report with MISMATCH lines, counts per status and a mail to ops;
- a weekly purge of old COMPLETED/DENIED orders and their personal data, in one transaction;
- a nightly chain that runs them with 0/4/8 exit codes and settings from the environment.

QA passed all 18 scenario verdicts with no defects. Two latent defects were found at close and raised for a later sprint (see Known findings).

## Tickets

| Ticket       | Type    | Title                                                                                | Outcome                                                    |
| ------------ | ------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| SWHR8-T-0047 | TASK    | Sprint plan — SWHR8-S-0011                                                           | DONE (commit b94367e)                                      |
| SWHR8-T-0048 | FEATURE | Order batch jobs — nightly extract, aging report, weekly purge and the batch chain   | DONE (commit e75e99b); detail in `SWHR8-T-0048/summary.md` |
| SWHR8-T-0049 | TASK    | Integration QA report — SWHR8-S-0011                                                 | DONE (commit 5bd5519)                                      |
| SWHR8-T-0050 | TASK    | Sprint close bundle — SWHR8-S-0011                                                   | this ticket                                                |
| SWHR8-T-0051 | DEFECT  | Nightly chain sends no ps-ops mail when the backup fails                             | BACKLOG, raised at close                                   |
| SWHR8-T-0052 | DEFECT  | PM2 order-batch-nightly runs the whole chain immediately on pm2 start                | BACKLOG, raised at close                                   |

## What shipped

This sprint delivered SWHR8-I-0012, change `swhr8-i-0012-order-batch-jobs`. SWHR8-T-0048 delivered all 14 tasks in one dispatch, about 1,050 lines including tests:

- **Jobs (pure modules in `server/jobs/`).** `order-extract`, `order-aging-report`, `order-purge` and `schedule`, with the signatures the locked tests fix (design B1). The settings module is `batch-settings`; the DB adapter is `order-batch-store`, which purges in one `db.transaction` (B2, B6).
- **Retrieval.** `server/lib/orders.ts` adds `findOrdersBetween`, with begin and end both included.
- **Repositories.** New batch reads and deletes are `listBatchOrders` and `deleteOrderRows` in the checkout repository, and `listSupplierOrderStatuses` and `deleteSupplierOrderRows` in the fulfillment repository. Jobs never query tables directly.
- **CLIs and scheduling.**
  - CLIs: `scripts/order-extract.ts`, `order-aging-report.ts`, `order-purge.ts` and `nightly-chain.ts`.
  - Package scripts: `batch:extract`, `batch:aging`, `batch:purge` and `batch:nightly`.
  - PM2 app: `order-batch-nightly`, started at 01:00.
- No schema change and no new dependency.

## Divergence from plan

- **Test location.** Unit and integration tests are in `routes/jobs/`, not beside the modules. Only paths under `routes/**` run in vitest's server project.
- **Out-of-map edit.** `e2e/account.spec.ts` changed one locator to `exact: true`. This fixes an ambiguous "Sign in" match and is outside the ownership map.
- **What the counts cover.** The aging report's "counts per status" count the listed stuck orders, not all orders (SD2). An order with no status row is reported as `UNKNOWN`.
- **Chain gating.** Only the backup and the extract gate the chain. The aging report, inventory report and purge do not gate each other, as the spec states.

## Verification

PASS. See `qa-test-report.md`.

- All 18 scenario verdicts pass.
- `bun run test` passes 426 of 426 tests in 83 files.
- Lint, typecheck and build exit 0.
- E2E passes 28 of 28.
- The locked `tests/acceptance/order-reporting-batch/` suite passes 18 of 18.
- No defects were found during QA. Coverage was not measured.

## Known findings carried forward

- **SWHR8-T-0051 (DEFECT).** R-0135 requires a mail to ps-ops when the backup fails, and the chain sends none. It is latent until SWHR8-I-0013 replaces the backup placeholder.
- **SWHR8-T-0052 (DEFECT).** PM2 starts `order-batch-nightly` once at `pm2 start`. Slots already past do not wait, so a daytime deploy runs the extract and the aging report, and on a Sunday the purge too.
- **Backup and inventory report are placeholders** that log "not installed (SWHR8-I-0013)" and return 0. The chain's backup gate is therefore exercised only by tests until I-0013 lands.
- **Open product questions from the brief.** Each has an interim answer:
  - The real ps-ops and ps-finance addresses: configurable, defaulting to those labels.
  - Where Finance collects the files: `BATCH_OUT_DIR`, default `./batch-out`.
  - Which time zone counts as local: the process `TZ`.
  - Whether the "Order batch jobs" nav entry stays: unchanged.
- **Spec discrepancies SD1–SD8** are recorded in the change's design.md. They include quoted versus plain CSV (SD1) and tasks 2.3 and 5.2 having no requirement (SD2).
- **Locked acceptance failures in other capabilities** (UAT warnings):
  - Vitest: 11 failures, all in inventory-reporting (SWHR8-I-0013, not yet built).
  - Browser: C-0108 (order-notifications).
- **Carried from earlier sprints:** SWHR8-T-0043 and SWHR8-T-0024 are still in BACKLOG, and the C-0108 dispute is open.

## Defects Raised

- SWHR8-T-0051: Nightly chain sends no ps-ops mail when the backup fails.
- SWHR8-T-0052: PM2 order-batch-nightly runs the whole chain immediately on pm2 start.

Both were raised at close from a review of the delivered code. QA raised none.

## Retrospective

- **Went well:** the locked tests fixed every module boundary before planning, and the plan named them. The FEATURE went green on the first QA run with no test dispute.
- **Went well:** a lot was reused. The `server/jobs` and `scripts` pattern came from the catalog check, and SMTP mail came from I-0009. Plan to QA took about 15 minutes.
- **Went well:** the planning DB-adapter note (B6) kept order and supplier deletes inside their repositories. Last sprint's direct table reads did not recur.
- **Could improve:** the locked tests drive pure functions only. Neither the PM2 start-time behaviour nor the backup-fail mail (a requirement without a scenario) was covered, and both reached close unnoticed. The plan should have listed every SHALL clause that has no scenario.
- **Could improve:** QA again reviewed the code by inspection only, and coverage is still unmeasured.
- **Could improve:** this capability depends on SWHR8-I-0013, which is not built. Sequencing I-0013 first would have let the chain run against the real backup.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                    |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | change `swhr8-i-0012-order-batch-jobs`, `artifacts/SWHR8-S-0011/SWHR8-T-0048/PLAN.md`                         | Satisfied | —                                            |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0011/qa-test-report.md`                                                                    | Satisfied | Out-of-scope acceptance failures as warnings |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0011/SWHR8-T-0048/tdd-test-result.md`, `artifacts/SWHR8-S-0011/integration-test-result.md` | Satisfied | —                                            |
| Design conformance checked     | No screens, no approved mockups                   | n/a                                                                                                           | N/A       | —                                            |
| Defects dispositioned          | 0 found in QA; 2 raised at close                  | `artifacts/SWHR8-S-0011/integration-defects-resolution.md`, SWHR8-T-0051, SWHR8-T-0052                        | Satisfied | Both deferred to BACKLOG                     |
| Spec discrepancies logged      | SD1–SD8 in change design                          | change `swhr8-i-0012-order-batch-jobs` design.md                                                              | Satisfied | —                                            |
