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
