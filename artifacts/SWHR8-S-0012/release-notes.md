---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0012
capability_brief: SWHR8-I-0013
branch: vortex/sprint/swhr8-s-0012-45fb8d6d
upstream: [artifacts/SWHR8-S-0012/qa-test-report.md]
---

# Release notes — SWHR8-S-0012

## Added

- **Nightly online backup** (`bun run batch:backup`; 01:00 in the nightly chain).
  - It copies the database to `PetStoreDB_YYYYMMDD/sqlite.db` under `BATCH_BACKUP_DIR` while the store stays online.
  - Backup folders older than 7 days are deleted.
  - On failure the job exits 8, and the nightly chain then skips the order extract. (SWHR8-T-0054)
- **Low-stock inventory report** (`bun run batch:inventory`; 01:50 in the nightly chain).
  - It writes `inventory_YYYYMMDD.txt`, listing every item below the low-stock limit (default 500): item, product, English description and quantity, lowest quantity first.
  - Items with no English description are left out.
  - The file ends with the number of items tracked and the total units in stock. (SWHR8-T-0054)
- **Health check** (`bun run batch:health`; PM2 app `health-check`, every 10 minutes).
  - It requests the storefront, order management, stock clerk and administration pages.
  - Any that do not answer HTTP 200 within 20 seconds are logged as down, and the job exits 8. (SWHR8-T-0054)
- **Sample data load**: `GET /api/populate?forcefully=false` loads the sample catalog, customers and users only when they are missing. `forcefully=true` reloads them all; in production this needs an administrator sign-on. (SWHR8-T-0054)
- **Sales grand total**: `GET /api/admin/sales` now also returns `total` next to the per-category or per-item totals. (SWHR8-T-0054)
- **Diagnostics helper**, switched off in the delivered build. (SWHR8-T-0054)

## Changed

- **Catalog check** (`bun run catalog:check`; PM2 app `catalog-check` at 06:00).
  - It now exits 4 for any finding (C1–C5), replacing the earlier combined codes.
  - When the catalog has never been loaded, it asks the store to load it, then checks again; it exits 8 if the load fails.
  - Results are also appended to `catalog_check.log` in `BATCH_OUT_DIR`. (SWHR8-T-0054)
- The nightly chain now runs the real backup and inventory report instead of the "not installed" placeholders.
- `ecosystem.config.js` starts two more PM2 apps, `catalog-check` and `health-check`.

## Upgrade notes

- No database migration and no new dependency.
- New optional environment variables:
  - `BATCH_LOW_STOCK_QTY` (default 500) and `BATCH_BACKUP_KEEP_DAYS` (default 7).
  - `BATCH_BACKUP_DIR` (default `./backup`, git-ignored).
  - `BATCH_STORE_URL` (default `http://127.0.0.1:3000`).
  - `BATCH_HEALTH_URL_STOREFRONT`, `_ORDERCENTER`, `_SUPPLIER` and `_ADMIN`, to override single areas.
- Anything that reads the catalog check's exit code must treat 4 as "findings" and 8 as "load failed".
- Backups are on the server's local disk. Copy them off the host if you need off-site recovery.
- **Known issue (SWHR8-T-0057).** Running the backup a second time on the same day fails. Delete that day's `PetStoreDB_YYYYMMDD` folder before rerunning it.
- **Known issues carried over.** No ops mail is sent when the backup fails (SWHR8-T-0051). `pm2 start` runs each scheduled app once immediately (SWHR8-T-0052).

## Not included

- No screen to view job results; the jobs report through files, logs and exit codes.
- No off-site copy of backups and no restore tooling.

## Verification

Verified at integration QA:

- All 15 scenarios pass.
- The unit suite passes 450 of 450, E2E passes 28 of 28, and the acceptance suite passes 229 of 229.
- QA found no defects.

See `artifacts/SWHR8-S-0012/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0012/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0012/qa-test-report.md` | Satisfied | —         |
