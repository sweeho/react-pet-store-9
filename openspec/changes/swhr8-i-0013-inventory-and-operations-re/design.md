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
