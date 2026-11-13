## Legacy implementation notes

- Jobs are shell scripts (`legacy-source/batch/ps_order_extract.sh`, `ps_order_aging_report.sh`, `ps_order_purge.sh`) binding parameters into Derby `ij` SQL under `legacy-source/db/batch/`; scheduled by Control-M (`legacy-source/scheduler/control-m/PS_PETSTORE.xml`) using INCOND/OUTCOND tokens (backup OK -> extract -> aging/inventory/purge).
- Constants live in `legacy-source/conf/env.sh` (retention 180 days, stuck 24 h, backup keep 7 days, low stock 500).
- Exit codes: 0 ok, 4 found something, 8 error. Extract failure mails ps-finance; aging code 4 mails ps-ops.
- Purge stages ids in a session temp table, deletes children first, one COMMIT.
- Date-range retrieval is the EJB finder findPOBetweenDates; its link to the batch extract is inferred, not read. Indexes ix_po_user and ix_po_date exist on purchase_order.

- ORB-REQ-0003: the aging script header comment says "not COMPLETED or DENIED", a different set from the SQL filter (PENDING, APPROVED); the SQL was followed.
- ORB-REQ-0007: purge and inventory report define no failure alert.
- Records ORB-BR-0001/0002 are the settings behind the purge cutoff and stuck-order cutoff.

## Suspected defects (for the defect register)

- Purge inner-joins contact_info, so orders without a contact row are never purged; address and card are deleted by id without checking sharing; supplier_order.contact_id rows may survive. Extract and purge are linked only by schedule, not per order.

## User interface

No screen records were extracted for this capability; its user interface is unspecified.

## Codebase findings (planning, SWHR8-S-0011)

- **Locked acceptance tests fix the module boundaries** (`tests/acceptance/order-reporting-batch/`). Every test drives a pure function over plain data with an injected `notify`, `outDir` and `now`:
  - `server/jobs/order-extract.ts` exports `runOrderExtract({ orders, outDir, now, notify })`. It resolves to `{ file, exitCode }`, and on failure it does not throw.
  - `server/jobs/order-aging-report.ts` exports `runAgingReport({ orders, supplierOrders, outDir, now, notify })`. It resolves to `{ file, exitCode }`.
  - `server/jobs/order-purge.ts` exports `selectPurgeable({ orders, now, retentionDays? })` and `runOrderPurge({ store, now, retentionDays? })`. The second resolves to `{ exitCode, purgedOrderIds, transactions }` and mutates the store arrays in place.
  - `server/jobs/schedule.ts` exports `runNightlyChain({ date, jobs })`. It resolves to `{ ran: { job, at }[] }`.
  - `server/lib/orders.ts` (new file) exports `findOrdersBetween({ orders, begin, end })`.
- **Precedent for jobs.** `server/jobs/catalog-check.ts` (pure) and `scripts/catalog-check.ts` (reads SQLite, prints the log, `process.exit(code)`) are the pattern; ARCHITECTURE.md §Jobs states it. No scheduler exists in the repo; `ecosystem.config.js` runs only the web server.
- **Order data.** Order data lives in five tables:
  - `purchase_order` has a text `order_id`, `user_id`, `order_date` (timestamp_ms), `locale` and `total`, plus `bill_contact_id`/`ship_contact_id` → `order_contact` and `credit_card_id` → `order_credit_card`.
  - `order_line_item` holds the order lines, and `order_status` is the legacy "order manager" row.
  - Address fields are inline on `order_contact`; there is no separate order address table.
  - `supplier_order.id` is the numeric purchase-order number, and it has `contact_id` → `supplier_contact` and lines in `supplier_line_item`.
  - All order access goes through `server/checkout/repository.ts`, which already has `findPurchaseOrdersByUser` and `findPurchaseOrdersByDate`; supplier access goes through `server/fulfillment/repository.ts` (ARCHITECTURE.md Key Decisions).
- **Mail exists.** `server/notifications/transport.ts` has `smtpTransport()` (`MAIL_SMTP_URL`, `MAIL_SENDER`); a send without a server rejects and is logged.
- **Backup and inventory report do not exist yet.** Both belong to change `swhr8-i-0013-inventory-and-operations-re`, which this sprint does not carry.

## Planning decisions (B1–B7)

- **B1 Pure job, thin CLI.** Each job is a pure function in `server/jobs/` that matches the locked test boundary. A thin CLI script in `scripts/` loads plain data through the repositories, calls the job with the real `smtpTransport`-backed `notify`, and exits the process with the job's code. Exit codes are literal, 0 / 4 / 8 (open question "exit code 4"), because the jobs run as separate programs, not inside the web server.
- **B2 Settings from the batch environment.** A single `server/jobs/batch-settings.ts` reads the following:
  - `BATCH_RETENTION_DAYS` (default 180), `BATCH_STUCK_HOURS` (default 24), and `BATCH_OUT_DIR` (default `./batch-out`).
  - `BATCH_MAIL_FINANCE` (default `ps-finance`) and `BATCH_MAIL_OPS` (default `ps-ops`).

  The pure functions also accept the values as arguments, with the same defaults.
- **B3 Local time is the process time zone (`TZ`).** All windows and cutoffs are built with `new Date(y, m, d)`, as the locked helpers do.
- **B4 Scheduling.** `runNightlyChain` is pure: it decides which jobs start and stamps each with its slot time (01:00, 01:30, 01:45, 01:50, 02:00). An injectable `waitUntil` lets the CLI `scripts/nightly-chain.ts` wait for each slot, and the tests pass a no-op. The host starts that CLI once a night at 01:00 (cron, or a PM2 app with `cron_restart` and `autorestart: false` in `ecosystem.config.js`). The purge runs only when the date is a Sunday.
- **B5 Backup and inventory report are injected.** Until SWHR8-I-0013 lands, the CLI wires `backup` and `inventoryReport` to placeholders. Each placeholder logs "not installed (SWHR8-I-0013)" and returns 0, so the chain still runs the order jobs. I-0013 replaces the placeholders without touching the chain.
- **B6 Purge in one transaction.** The DB adapter collects the purgeable ids and deletes in one `db.transaction`, children first, in this order:
  1. supplier line items, then supplier orders, then supplier contacts;
  2. order lines, then the `order_status` row, then the `purchase_order` row;
  3. the order's bill and ship `order_contact` rows, which also remove the address, then its `order_credit_card` row.

  Deletes go through new functions in the checkout and fulfillment repositories that take the transaction handle. Unlike the legacy inner join, an order with no contact row is still purged.
- **B7 File formats.**
  - The extract writes one data line per order, with fields in the spec's order. Text fields are double-quoted (R-0225 "quoted"), numbers are unquoted, order time is epoch milliseconds, and the value is `String(number)`.
  - Lines are sorted by order number, numerically when both ids are numeric. There is no header row.
  - The extract ends with `TRAILER,YYYYMMDD,<rows>`, unquoted. The output directory is created when missing; failure to create or write it ends the job with code 8 and mails finance.
  - The aging report lists one line per stuck order, oldest first, then `MISMATCH` lines, then a `COUNT <status> <n>` summary per status (task 2.3). The summary never changes the exit code.

## Phases

1. Order extract (tasks 1.x) and `findOrdersBetween` plus settings (tasks 5.x, 4.2).
2. Aging report (tasks 2.x).
3. Purge, pure function and DB adapter (tasks 3.x).
4. Chain and CLIs (tasks 1.3, 3.3, 4.1).
5. **Test harness.** Unit tests sit beside each new module under `server/jobs/`. DB adapters are tested under `routes/**`, or under a `server` vitest project path, because `bun:sqlite` cannot load in jsdom. Follow the path rule in AGENTS.md and extend the `server` project include in `vitest.config.ts` if adapters are tested outside `routes/`. The locked acceptance suite `tests/acceptance/order-reporting-batch/` must pass unchanged.
6. **CI.** The existing workflow already runs lint, typecheck, unit, build, E2E and the acceptance suite on `vortex/**` pushes and PRs. Nothing is added; the FEATURE leaves every job green. No E2E spec is needed, because there is no screen.

## Spec discrepancies

Recorded here; the delta spec is unchanged.

- **SD1** R-0222 says comma-separated with no quoting rule; R-0225 says "quoted comma-separated UTF-8". The locked test accepts both. B7 quotes text fields.
- **SD2** Tasks 2.3 ("counts per status") and 5.2 have no requirement or scenario in the delta spec. 2.3 is implemented as an informational summary; 5.2 duplicates 4.2.
- **SD3** The proposal lists "user/date order retrieval"; no requirement covers it, and `server/checkout/repository.ts` already has `findPurchaseOrdersByUser` and `findPurchaseOrdersByDate`. Nothing is added.
- **SD4** R-0134 makes the chain depend on the backup and the inventory report, which do not exist in this repository (SWHR8-I-0013). They are injected (B5).
- **SD5** The brief's open question says "the store has no mail sending today". It does since SWHR8-I-0009 (`server/notifications/transport.ts`).
- **SD6** R-0219/R-0220 speak of a separate address and contact. Here the address is inline on `order_contact`, and an order has two contacts (bill, ship) plus a supplier contact. All of them are deleted (B6).
- **SD7** The legacy notes say the aging script header comment names a different status set ("not COMPLETED or DENIED") from its SQL. The spec follows the SQL (PENDING, APPROVED), and so does this plan; SHIPPED_PART orders are not listed as stuck.
- **SD8** The brief says the jobs "run inside the web server, so they have no exit code". This plan runs them as CLI programs with literal exit codes (B1), following `scripts/catalog-check.ts`.
