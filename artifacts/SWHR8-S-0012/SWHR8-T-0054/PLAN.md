# PLAN — SWHR8-T-0054 Inventory and operations reporting

Change: `swhr8-i-0013-inventory-and-operations-re`. Read its `design.md` FIRST (sections "Codebase findings", "Planning decisions (I1–I9)", "Spec discrepancies"), then `specs/inventory-reporting/spec.md`, then the locked tests in `tests/acceptance/inventory-reporting/`.

## Objective

Deliver every task group of the change's `tasks.md`, in order: the low-stock report, the catalog check fixes, the sample-data endpoint, the nightly backup, the 10-minute health check, the admin report totals, the diagnostics helper and the thresholds as configuration. All 13 linked cases (SWHR8-C-0141…0153) must pass, and the two R-0069 scenarios that have no locked case must be covered by unit tests.

## Steps

1. **Settings (8.1).** Extend `server/jobs/batch-settings.ts` per design I2.
2. **Inventory report (1.1–1.3).** `server/jobs/inventory-report.ts` per I3; `scripts/inventory-report.ts` reads `inventory` left-joined to `en_US` `item_details`; wire `inventoryReport` in `scripts/nightly-chain.ts`.
3. **Catalog check (2.1–2.3).** Literal exit codes, optional `reload()` and re-run, log file, real populate request (I4). Update `src/test/server/catalog-check.test.ts` to literal codes.
4. **Sample data (3.1).** `db/sample-data.ts` `loadSampleData(db, { force })`, `db/client.ts` switched to it, `routes/api/populate.ts` (I5). Forced reload must not break FKs from orders. Order lines carry `item_id` text with no FK to `item`; verify against `db/schema.ts` before relying on it.
5. **Backup (4.1–4.3).** `server/jobs/backup.ts` with the default `VACUUM INTO` snapshot (I6), `scripts/backup.ts`, wire `backup` in the chain.
6. **Health check (5.1–5.2).** `server/jobs/health-check.ts` (I7), `scripts/health-check.ts`.
7. **Reports (6.1–6.2).** `server/lib/reports.ts`; `routes/api/admin/sales.get.ts` adds `total` (I8). Task 6.2 is already met by `server/lib/admin-requests.ts`; confirm and record that, with no new code (SD3).
8. **Diagnostics (7.1).** `server/lib/diagnostics.ts` (I9).
9. **Deployment.** `package.json` scripts `batch:backup`, `batch:inventory`, `batch:health`; `ecosystem.config.js` apps `catalog-check` (06:00) and `health-check` (every 10 min).
10. **Tests.** Unit tests in `src/test/server/` for each new module; route tests in `routes/api/` for `/api/populate` and the sales `total` (design Phase 7). CI unchanged (Phase 8).

## Gotchas

- The locked backup and inventory tests stamp the file names with `toISOString()` (UTC) at 01:00Z/01:50Z, while I3/I6 use the local stamp (B3). They agree when `TZ=UTC`, as in CI. Do not change a locked test.
- `db/client.ts` is in-memory under Vitest and seeded on import, so `/api/populate?forcefully=false` sees data as present.
- Anything importing `db/client.ts` must run in the `server` Vitest project or under the acceptance config (`// @vitest-environment node`), never jsdom. Keep `server/jobs/backup.ts`'s db import dynamic so its pure path stays importable anywhere.

## File/module ownership

Create: `server/jobs/inventory-report.ts`, `server/jobs/backup.ts`, `server/jobs/health-check.ts`, `server/lib/reports.ts`, `server/lib/diagnostics.ts`, `db/sample-data.ts`, `routes/api/populate.ts`, `routes/api/populate.test.ts`, `scripts/backup.ts`, `scripts/inventory-report.ts`, `scripts/health-check.ts`, `src/test/server/{inventory-report,backup,health-check,reports,diagnostics}.test.ts`.
Modify: `server/jobs/batch-settings.ts`, `server/jobs/catalog-check.ts`, `scripts/catalog-check.ts`, `scripts/nightly-chain.ts`, `db/client.ts`, `routes/api/admin/sales.get.ts` (+ its route test under `routes/api/admin/`), `src/test/server/catalog-check.test.ts`, `package.json` (scripts only), `ecosystem.config.js`, `.gitignore` (`backup/`).
Not owned: `tests/acceptance/**` (locked), `openspec/**`, root docs.

## Definition of Done

AC-1 … AC-15 on the ticket, one per scenario of the delta spec, all met; the locked suite `tests/acceptance/inventory-reporting/` passes unchanged, and the `catalog-browsing` and `admin-order-management` acceptance suites stay green.

## Design reference

None. The brief has no approved mockup and the capability has no screen.
