# SWHR8-T-0048 summary

Built the four order batch jobs as pure modules plus thin CLIs, and inclusive date-range retrieval.

- `server/jobs/`: `batch-settings` (env, defaults 180 d / 24 h / ps-finance / ps-ops), `batch-types`, `order-extract` (orders_YYYYMMDD.csv, quoted text, trailer, code 8 + finance mail on failure), `order-aging-report` (stuck PENDING/APPROVED > 24 h, MISMATCH, counts, code 4 + ops mail), `order-purge` (pure `selectPurgeable`/`runOrderPurge`), `schedule` (chain: backup, extract, aging, inventory, Sunday purge, slot stamps, `waitUntil`), `order-batch-store` (DB adapter; one `db.transaction`, supplier rows then order rows).
- `server/lib/orders.ts`: `findOrdersBetween`, inclusive.
- Repositories: `deleteOrderRows`, `listBatchOrders` (checkout), `listSupplierOrderStatuses`, `deleteSupplierOrderRows` (fulfillment); `deletePurchaseOrder` now reuses `deleteOrderRows`.
- CLIs `scripts/{order-extract,order-aging-report,order-purge,nightly-chain}.ts`, package scripts `batch:*`, PM2 `order-batch-nightly` (cron 01:00), `.gitignore` `batch-out/`.

Deviations: tests are in `routes/jobs/` (the project's test glob), not beside the modules. Backup and inventory report are placeholders returning 0 (SWHR8-I-0013). The aging "counts per status" lines count the listed stuck orders. An order with no status row reads as "UNKNOWN". Aging/inventory/purge run regardless of each other's exit codes (only backup and extract gate the chain).

AC coverage: AC-1…AC-18 map to cases C-0118…C-0135, all green (red/green runs in tdd-test-result.md). No schema change.

Verification: `bun run lint`, `bun run typecheck`, `bun run test` (83 files, 426 tests) all passed. E2E not run: no screen.

CODE-REVIEW: self-review — sub-agent not used (small diff, cost); checked transaction scope, exit codes, notify never throwing, local-time windows; no findings rejected.
