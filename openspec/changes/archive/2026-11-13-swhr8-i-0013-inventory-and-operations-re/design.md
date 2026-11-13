# Legacy implementation notes: inventory-reporting

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The admin sales/order-quantity reports feed charts in the admin client (pie and bar chart panels) but the chart screens were not extracted.

## How the legacy application implements it

- Low-stock report: `db/batch/inventory_report.sql`, run by `batch/ps_inventory_report.sh`; `:LOW_QTY` is bound from `PS_LOW_STOCK_QTY` (500) in `conf/env.sh`. Inner join to `item_details` with locale `en_US` silently omits items lacking an English description.
- Catalog check: `db/batch/catalog_check.sql` and `batch/ps_catalog_check.sh`. The script greps `^C[1-5] ` in ij output; Control-M mails ps-catalog on exit 4. C4 SQL comment names en_US, ja_JP, zh_CN but the query uses the locales present in `category_details`. Any "does not exist" in the output (not only missing catalog tables) triggers the populate call.
- Backup: `SYSCS_BACKUP_DATABASE` to `/var/petstore/backup`, renamed to `PetStoreDB_YYYYMMDD`; `find -mtime +7` retention, effectively about 8 backups kept. Critical job, up to 2 reruns 10 minutes apart.
- Health check: `curl -m 20` on four URLs from `env.sh`; Control-M cyclic every 10 minutes.
- Schedule: backup 01:00, inventory report 01:50, catalog check 06:00, health check every 10 minutes (Control-M `PS_PETSTORE.xml`).
- Populate endpoint: `PopulateServlet`, mapped to `/Populate`.
- Admin reports: `ApplRequestProcessor` in the admin web module; dates M/D/YYYY; amounts accumulated as float; the total element is named TotalSales even for order quantity; aggregation is in a facade outside the module.
- Diagnostic helper: `util/tracer` `Debug` class, `debuggingOn` compile-time constant false.

## Open issues

- Reachability and exact source of the catalog check requirement CATBR-REQ-0011 was seen only in the runbook by the catalog pass; the batch passes read the SQL.
- Threshold 500 and retention 7 appear in `env.sh`, `petstore.properties` and the runbook.

## Codebase findings (planning, SWHR8-S-0012)

- **Locked acceptance tests fix the module boundaries** (`tests/acceptance/inventory-reporting/`, all pure or handler-level, no running server):
  - `server/jobs/inventory-report.ts`: `runInventoryReport({ items, outDir, now, lowStockQty? })` resolves `{ file }`; items are `{ itemId, productId, description, quantity }[]`; file `inventory_YYYYMMDD.txt`.
  - `server/jobs/catalog-check.ts`: `runCatalogCheck({ catalog, populate })` resolves `{ exitCode, log }`; `catalog` is `null` when the tables are missing.
  - `server/jobs/backup.ts`: `runBackup({ backupRoot, now, retentionDays? })` resolves `{ exitCode }`.
  - `server/jobs/health-check.ts`: `runHealthCheck({ modules, fetch })` resolves `{ exitCode, down, log }`.
  - `routes/api/populate.ts`: default H3 handler for `GET /api/populate?forcefully=<bool>` returning `{ reloaded: boolean }`.
  - `server/lib/reports.ts`: `revenueReport({ orders, start, end, category? })` returns `{ entries: { key, amount }[], total }`; orders are `{ category, itemId, amount, quantity, date }[]`.
  - `server/lib/diagnostics.ts`: `createDiagnostics({ enabled, write })` returns `{ print, println, exception }`.
- **Already built, extended not rewritten.**
  - `server/jobs/catalog-check.ts` + `scripts/catalog-check.ts` (C1–C5) exist from SWHR8-I-0004. Exit codes are a bitmask today (C1=1, C2=2, C3=4, C4=16, C5=32); the populate path returns 0 on success without re-running the checks, and the CLI's `populate` is a stub returning `false`.
  - `server/lib/admin-sales.ts` `salesTotals()` and `routes/api/admin/sales.get.ts` serve per-category / per-item totals (SWHR8-I-0011), without a grand total.
  - `server/lib/admin-requests.ts` already returns the session-timeout and `Unknown request type - X` error replies (task 6.2), covered by `tests/acceptance/admin-order-management/request-processing.test.ts`.
  - `server/jobs/batch-settings.ts` (B2 of `swhr8-i-0012-order-batch-jobs`), `server/jobs/batch-types.ts` (exit-code constants, local `yyyymmdd` stamp) and `server/jobs/schedule.ts` (chain with `backup` 01:00 and `inventoryReport` 01:50 slots).
  - `scripts/nightly-chain.ts` wires `backup` and `inventoryReport` to placeholders that log "not installed (SWHR8-I-0013)".
  - `ecosystem.config.js` runs `nitro-server` and `order-batch-nightly` only.
- **Seeding.** `db/client.ts` migrates and seeds on import: demo `users`, the catalog from `db/seed/catalog.json` via `replaceCatalog` when `category` is empty, and `seedCustomers` (j2ee/shopper + administration). Under Vitest the db is in-memory and seeded at import, so the sample data is "already present" in every test.
- **Areas for the health check.** One SPA serves every area: storefront `/`, administration `/admin`, order management `/admin/orders`, stock clerk (supplier) `/admin/inventory`.

## Planning decisions (I1–I9)

- **I1 Same job pattern as B1.** Each job is a pure function in `server/jobs/` behind the locked boundary, with a thin CLI in `scripts/` that reads SQLite, calls it and `process.exit`s with its code (0 / 4 / 8). New CLIs: `scripts/backup.ts`, `scripts/inventory-report.ts`, `scripts/health-check.ts`; `scripts/catalog-check.ts` is extended. `package.json` gains `batch:backup`, `batch:inventory`, `batch:health`.
- **I2 Settings.** `batchSettings()` gains `lowStockQty` (`BATCH_LOW_STOCK_QTY`, default 500), `backupKeepDays` (`BATCH_BACKUP_KEEP_DAYS`, default 7), `backupDir` (`BATCH_BACKUP_DIR`, default `./backup`), `storeUrl` (`BATCH_STORE_URL`, default `http://127.0.0.1:3000`) and `healthUrls` (four URLs, each overridable by `BATCH_HEALTH_URL_STOREFRONT|ORDERCENTER|SUPPLIER|ADMIN`, defaulting to the area paths above on `storeUrl`). Pure functions keep their own defaults (500, 7).
- **I3 Inventory report.** Lists items with `quantity < lowStockQty` and a non-empty `description`, sorted by quantity then item id. One line per item: `itemId productId "description" quantity`. Then a blank line, `ITEMS TRACKED <n>` and `TOTAL UNITS <sum>`, both over **every** item passed in (including those over the limit and those without an English description). The CLI passes every `inventory` row left-joined to its `en_US` `item_details` description (empty when missing). The output dir (`BATCH_OUT_DIR`) is created when missing; a write failure resolves `{ file, exitCode: 8 }` rather than throwing. Date stamp uses the shared local `yyyymmdd` helper (B3).
- **I4 Catalog check exit codes are literal.** Any C1–C5 finding ends with 4 (spec R-0064), replacing the bitmask; populate failure ends with 8. After a successful populate the check re-reads the catalog through an optional `reload()` input and runs C1–C5 on it (R-0065 "re-run the checks"); when `reload` is absent it returns 0. The CLI's snapshot returns `null` on a "no such table" error, `populate` issues `GET {storeUrl}/api/populate?forcefully=false` and resolves `true` only on HTTP 200, and every log line plus a dated header is appended to `{BATCH_OUT_DIR}/catalog_check.log` as well as printed.
- **I5 Populate endpoint.** `routes/api/populate.ts` (unauthenticated, as the legacy servlet). A new `db/sample-data.ts` exports `loadSampleData(db, { force })`, returning whether it (re)loaded:
  - not forced: when the catalog, the sample sign-on users and the demo users are all present, it does nothing and returns `false`; otherwise it loads only what is missing and returns `true`;
  - forced: `replaceCatalog` from `db/seed/catalog.json`, then resets the sample sign-on users, customers and demo users to their sample values (upsert; other customers and all orders untouched), returns `true`.
  `db/client.ts` calls `loadSampleData(db, { force: false })` instead of its inline seeding, so start-up and the endpoint share one path. In production (`NODE_ENV=production`) a forced reload requires an administrator session (`requireAdministrator`); the unforced request, which is what the catalog check sends, stays open.
- **I6 Backup.** `runBackup` takes `{ backupRoot, now, retentionDays = 7, snapshot? }`. It creates `PetStoreDB_YYYYMMDD` under `backupRoot` (local stamp, B3) and calls `snapshot(dir)`. The default snapshot runs SQLite `VACUUM INTO '<dir>/sqlite.db'` on the live connection from `db/client.ts` (loaded by dynamic import), which is an online, consistent copy. Then it deletes every `PetStoreDB_*` directory under `backupRoot` whose mtime is more than `retentionDays` days before `now`, never today's. Snapshot or prune failure resolves `{ exitCode: 8 }`. The chain wires `backup` to it, so the order extract runs only after a good backup (R-0134).
- **I7 Health check.** `runHealthCheck({ modules, fetch, timeoutMs = 20000 })` requests every URL concurrently with `AbortSignal.timeout`. A module is down on a non-200 status, a timeout or a network error. It logs `<module> DOWN <reason>` per failure and `<module> UP` otherwise, returns `down` in module order, and exits 8 when any module is down (0 otherwise). PM2 app `health-check` runs `scripts/health-check.ts` with `cron_restart: "*/10 * * * *"`, `autorestart: false`.
- **I8 Reports.** `server/lib/reports.ts` exports `revenueReport` (sum of `amount`) and `orderQuantityReport` (sum of `quantity`), the same shape, inclusive ISO date range, grouped by category, or by item within the given category, with a `total`. `routes/api/admin/sales.get.ts` keeps its `totals` array (the admin sales page reads it) and adds `total`, the grand total, computed through `reports.ts`. `salesTotals` stays.
- **I9 Diagnostics.** `server/lib/diagnostics.ts` exports `createDiagnostics({ enabled, write })`, plus a `DEBUGGING_ON = false` constant and a default `diagnostics` instance built from it that writes to stderr. `print` writes the message, `println` the message plus `\n`, and `exception(error, message?)` writes `error.message`, then `message` when given, then `error.stack`. With `enabled: false` nothing is written.
- **Scheduling.** `scripts/nightly-chain.ts` replaces both placeholders with the real backup and inventory jobs. `ecosystem.config.js` adds `catalog-check` (`cron_restart: "0 6 * * *"`) and `health-check` (every 10 minutes), both Bun, `autorestart: false`.

## Phases

1. Settings (8.1) and inventory report (1.x): pure function, CLI, chain wiring.
2. Catalog check (2.x): literal exit codes, re-run after populate, log file, real populate request.
3. Sample data (3.1): `db/sample-data.ts`, `db/client.ts` switched over, `routes/api/populate.ts`.
4. Backup (4.x): pure function with default snapshot, CLI, chain wiring.
5. Health check (5.x): pure function, CLI, PM2 app.
6. Reports (6.x) and diagnostics (7.1).
7. **Test harness.** Unit tests for each new `server/jobs/` and `server/lib/` module go under `src/test/server/` (as `catalog-check.test.ts` does), covering the two R-0069 scenarios that have no locked case: order 12 then 499 with 500 excluded, and an item without an English description omitted. Route tests for `/api/populate` and the sales `total` go under `routes/api/` (server project, real `H3Event`, in-memory db). The backup default snapshot is exercised against the in-memory db. `src/test/server/catalog-check.test.ts` is updated for literal codes. The locked suite `tests/acceptance/inventory-reporting/` and the existing `tests/acceptance/catalog-browsing/` and `admin-order-management/` suites must pass unchanged.
8. **CI.** `.github/workflows/ci.yml` already runs lint, typecheck, unit, build, E2E and the acceptance suite on `vortex/**` pushes and PRs. Nothing is added; the FEATURE leaves every job green. There is no screen, so no E2E spec.

## Spec discrepancies

Recorded here; the delta spec is unchanged.

- **SD1** The existing catalog check (SWHR8-I-0004) uses bitmask exit codes; R-0064 says code 4 for any finding. The plan follows the spec (I4).
- **SD2** R-0065 says re-run the checks after a successful populate; the existing code returns 0 without re-running. Fixed (I4).
- **SD3** Task 6.2 (session-timeout and unknown-request errors) and the brief's "Admin data request error handling" criterion have no requirement or scenario in this delta. The behaviour already exists in `server/lib/admin-requests.ts` (SWHR8-I-0011). The task line is tagged to R-0186 as the nearest requirement; no new code.
- **SD4** R-0069 and R-0063 do not say whether "items tracked" and "total units" cover all inventory rows or only the listed ones. The locked case C-0142 (2 tracked, 712 units, one listed) requires all rows (I3).
- **SD5** The legacy has four separately deployed web modules; this repository has one SPA. The health check probes four area entry pages on one host (I2, I7), which detects a down server but not a broken area that still serves the SPA shell.
- **SD6** The legacy populate servlet is unauthenticated. A forced reload is destructive, so in production it requires an administrator session (I5); the unforced load the catalog check sends is unchanged.
- **SD7** The brief says diagnostics are "switched off in the delivered build"; TypeScript has no compile-time constant, so a module constant `DEBUGGING_ON = false` stands in for it (I9).
- **SD8** The legacy notes say C4 names en_US, ja_JP, zh_CN but checks the locales of `category_details`; the existing code and this plan check the category's locales.
