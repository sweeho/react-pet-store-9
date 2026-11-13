---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0012
capability_brief: SWHR8-I-0013
branch: vortex/sprint/swhr8-s-0012-45fb8d6d
upstream: [artifacts/SWHR8-S-0012/SPRINT-PLAN.md, artifacts/SWHR8-S-0012/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0012/release-notes.md]
---

# Sprint summary — SWHR8-S-0012

The sprint goal was met. The store now runs its own unattended operations jobs:

- a nightly online backup with 7-day retention;
- a low-stock inventory report;
- a catalog integrity check that loads the sample catalog when none exists;
- a health check of the four store areas every 10 minutes.

Operators and administrators also get a sample-data load endpoint, sales totals with a grand total, and a diagnostics helper that is off by default.

QA passed all 15 scenario verdicts with no defects. One latent defect was found at close and raised for a later sprint (SWHR8-T-0057).

## Tickets

| Ticket       | Type    | Title                                                                        | Outcome                                                    |
| ------------ | ------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| SWHR8-T-0053 | TASK    | Sprint plan — SWHR8-S-0012                                                   | DONE (commit 1d13284)                                      |
| SWHR8-T-0054 | FEATURE | Inventory and operations reporting                                           | DONE (commit f1189f7); detail in `SWHR8-T-0054/summary.md` |
| SWHR8-T-0055 | TASK    | Integration QA report — SWHR8-S-0012                                         | DONE (commit 5159e02)                                      |
| SWHR8-T-0056 | TASK    | Sprint close bundle — SWHR8-S-0012                                           | this ticket                                                |
| SWHR8-T-0057 | DEFECT  | Backup re-run on the same day fails (VACUUM INTO refuses the existing file) | BACKLOG, raised at close                                   |

## What shipped

This sprint delivered SWHR8-I-0013, change `swhr8-i-0013-inventory-and-operations-re`. SWHR8-T-0054 delivered all 16 tasks in one dispatch.

- **Jobs (pure modules in `server/jobs/`):**
  - `inventory-report`: the list is sorted by quantity, then item. Items without an English description are left out. Items-tracked and total-units cover every inventory row.
  - `backup`: SQLite `VACUUM INTO` writes `PetStoreDB_YYYYMMDD`, and folders older than the retention period are pruned by mtime.
  - `health-check`: four URLs with a 20 s timeout; exits 8 when any is down.
  - `catalog-check`: exit codes are now literal, 4 for any C1–C5 finding and 8 for a failed load. After a successful load the checks run again.
- **DB side:** `server/jobs/inventory-store.ts` mirrors `order-batch-store.ts`. The nightly chain now runs the real backup and inventory report in place of the placeholders.
- **Sample data:** `db/sample-data.ts` holds `loadSampleData(db, { force })` and is shared by start-up seeding and `GET /api/populate`. A forced reload in production requires an administrator.
- **Reports:** `server/lib/reports.ts` provides `revenueReport` and `orderQuantityReport`. `GET /api/admin/sales` now also returns `total`.
- **Diagnostics:** `server/lib/diagnostics.ts`, with `DEBUGGING_ON = false`.
- **Settings:** `BATCH_LOW_STOCK_QTY`, `BATCH_BACKUP_KEEP_DAYS`, `BATCH_BACKUP_DIR`, `BATCH_STORE_URL` and `BATCH_HEALTH_URL_*`.
- **Scheduling:** package scripts `batch:backup`, `batch:inventory` and `batch:health`, and PM2 apps `catalog-check` (06:00) and `health-check` (every 10 minutes).
- No schema change and no new dependency.

## Divergence from plan

- `server/jobs/inventory-store.ts` was added beyond the PLAN.md ownership map. It is the DB side for the backup and inventory jobs, following the `order-batch-store.ts` pattern.
- `db/customer-seed.ts` was split into `insertSampleCustomers` and `resetSampleCustomers` so the forced reload can reset the sample customers. This file was not in the map.
- `runHealthCheck` types `fetch` as `(url, init?) => Promise<Response>` so that plain stubs type-check.
- Task 6.2 needed no code: `server/lib/admin-requests.ts` already returns the error replies (SD3).

## Verification

PASS. See `qa-test-report.md`.

- All 15 scenario verdicts pass.
- `bun run test` passes 450 of 450 tests in 89 files.
- Lint, typecheck and build exit 0.
- E2E passes 28 of 28.
- The locked acceptance suite passes 229 of 229 tests across all capabilities. The 11 inventory-reporting failures carried as warnings from SWHR8-S-0011 are now green.
- QA found no defects. Coverage was not measured.

## Known findings carried forward

- **SWHR8-T-0057 (DEFECT, new).** `VACUUM INTO` refuses an existing file, so a second backup on the same day exits 8, and the backup gate then skips the order extract. Reproduced with bun:sqlite.
- **SWHR8-T-0051 (DEFECT, BACKLOG).** No ps-ops mail is sent when the backup fails. This is no longer latent: the backup is real now, so a failure skips the extract without telling anyone.
- **SWHR8-T-0052 (DEFECT, BACKLOG).** PM2 runs a `cron_restart` app once at `pm2 start`. This now also applies to `catalog-check` and `health-check`, where it is harmless: one extra check run.
- **Health check depth (SD5).** The store is a single-page app, so the four areas share one server. The check detects a down server, not a broken area that still serves the app shell.
- **Spec discrepancies SD1–SD8** are recorded in the change's design.md.

## Defects Raised

- SWHR8-T-0057: Backup re-run on the same day fails, because VACUUM INTO refuses the existing `PetStoreDB_YYYYMMDD/sqlite.db`.

It was raised at close from a review of the delivered code. QA raised none.

## Retrospective

- **Went well:** the locked tests fixed all seven module boundaries before planning, and the plan named them. The FEATURE went green on the first QA run with no test dispute.
- **Went well:** a lot was reused. The catalog check, sales totals, admin error replies and batch scaffolding already existed. The plan said so, which kept the FEATURE to extensions.
- **Went well:** the discrepancies (bitmask exit codes, no re-check after loading) were found at planning and fixed in the build, not at QA.
- **Could improve:** the locked tests run each job once on a fresh temp folder, so the same-day re-run failure (T-0057) went unnoticed until close. The plan should have listed operational cases such as reruns and existing output beside the scenarios.
- **Could improve:** the PLAN.md ownership map missed two files the work needed, `inventory-store.ts` and `customer-seed.ts`. Planning should trace where each new job's DB reads will live.
- **Could improve:** the deferred defects T-0051 and T-0052 are now live in production paths. They should be scheduled into the next bugfix sprint.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | ------------------------ |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | change `swhr8-i-0013-inventory-and-operations-re`, `artifacts/SWHR8-S-0012/SWHR8-T-0054/PLAN.md`              | Satisfied | —                        |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0012/qa-test-report.md`                                                                    | Satisfied | —                        |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0012/SWHR8-T-0054/tdd-test-result.md`, `artifacts/SWHR8-S-0012/integration-test-result.md` | Satisfied | —                        |
| Design conformance checked     | No screens, no approved mockups                   | n/a                                                                                                           | N/A       | —                        |
| Defects dispositioned          | 0 found in QA; 1 raised at close                  | `artifacts/SWHR8-S-0012/integration-defects-resolution.md`, SWHR8-T-0057                                      | Satisfied | Deferred to BACKLOG      |
| Spec discrepancies logged      | SD1–SD8 in change design                          | change `swhr8-i-0013-inventory-and-operations-re` design.md                                                   | Satisfied | —                        |
