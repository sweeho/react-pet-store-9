---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0011
capability_brief: SWHR8-I-0012
branch: vortex/sprint/swhr8-s-0011-bc341f3d
upstream: [artifacts/SWHR8-S-0011/qa-test-report.md]
---

# Release notes — SWHR8-S-0011

## Added

- **Daily order extract for Finance** (`bun run batch:extract`; nightly at 01:30). It writes `orders_YYYYMMDD.csv` for the previous day, from 00:00 yesterday up to but not including 00:00 today.
  - Rows are in order-number order with no header row. Each row has the order number, user, order time (epoch ms), locale, value, line count and status.
  - The file ends with `TRAILER,YYYYMMDD,<rows>`.
  - If the extract fails, the job exits 8 and mails the finance mailbox. (SWHR8-T-0048)
- **Stuck-order aging report** (`bun run batch:aging`; nightly at 01:45). It writes `order_aging_YYYYMMDD.txt`.
  - The report lists, oldest first, every PENDING or APPROVED order older than 24 hours, then a `MISMATCH` line for every order whose supplier order is COMPLETED but the order is not, then counts per status.
  - When anything is listed, the job exits 4 and mails the ops mailbox. (SWHR8-T-0048)
- **Weekly purge** (`bun run batch:purge`; Sundays at 02:00). It deletes COMPLETED and DENIED orders placed before local midnight 180 days ago.
  - Each order's lines, status, supplier order, supplier lines and supplier contact go with it, as do its billing and shipping contacts (including the address) and its payment card. All of it is deleted in one transaction.
  - Open orders are never purged. (SWHR8-T-0048)
- **Nightly chain** (`bun run batch:nightly`; PM2 app `order-batch-nightly` at 01:00). The extract runs only after the backup succeeds. The aging report, the inventory report and, on Sundays, the purge run only after the extract succeeds. Exit codes: 0 ok, 4 problem found, 8 failure. (SWHR8-T-0048)
- **Order lookup by date range**, with the begin and end times both included. This is server-side only. (SWHR8-T-0048)

## Changed

- `ecosystem.config.js` now starts a second PM2 app, `order-batch-nightly`, next to the web server.

## Upgrade notes

- No database migration and no new dependency.
- New optional environment variables:
  - `BATCH_RETENTION_DAYS` (default 180) and `BATCH_STUCK_HOURS` (default 24).
  - `BATCH_OUT_DIR` (default `./batch-out`, git-ignored).
  - `BATCH_MAIL_FINANCE` (default `ps-finance`) and `BATCH_MAIL_OPS` (default `ps-ops`).
- Batch mail uses the existing `MAIL_SMTP_URL` and `MAIL_SENDER`. Without a mail server, the mail is logged and dropped.
- Times are in the process time zone (`TZ`).
- **Known issue (SWHR8-T-0052).** `pm2 start` also runs the chain once immediately. Until it is fixed, deploy outside Sunday daytime, or start the app with PM2 at night only.

## Not included

- The database backup and the inventory report belong to SWHR8-I-0013. Until then the chain logs them as "not installed" and treats them as succeeded.
- No mail is sent to ops when the backup fails (SWHR8-T-0051). This only matters once the real backup exists.
- There is no screen to view, rerun or configure jobs, and no delivery of the extract to Finance.

## Verification

Verified at integration QA: all 18 scenarios pass, the unit suite passes 426 of 426, and E2E passes 28 of 28. QA found no defects. See `artifacts/SWHR8-S-0011/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0011/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0011/qa-test-report.md` | Satisfied | —         |
