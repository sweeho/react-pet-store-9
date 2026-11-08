<!-- anchor: p1 -->

Java™ Pet Store 1.3.2
Operations Runbook
DocumentPS-RB-01
Version1.3.2
AudienceOperations and Control-M schedulers
SchedulerControl-M, data center DC_PS_PRD, node ps-app01
1. System overview
ComponentDetail
Application
server
J2EE 1.3.1 Reference Implementation on Java 1.4, port 8000. Four applications: /petstore (Storefront),
/opc (Order Processing Center), /supplier, /admin.
MessagingJMS queues and topics inside the J2EE server: jms/opc/OrderQueue, jms/opc/OrderApprovalQueue,
jms/supplier/PurchaseOrderQueue, jms/opc/InvoiceTopic, mail queues
DatabaseCloudscape (Apache Derby), database PetStoreDB in /var/petstore/db, schema ESTOREUSER. Batch
jobs connect through the network server on port 1527.
Batch home/opt/petstore: batch/ scripts, db/batch/ SQL, conf/ settings
Output folders/var/petstore/backup, /var/petstore/extract, /var/petstore/log, /var/petstore/tmp
Job log/var/petstore/log/batch.log, one line per job start and end
1.1 Order flow
Storefront --OrderQueue--> OPC PurchaseOrderMDB
   total under limit (US 500, JP 50000)  --> APPROVED automatically
   otherwise                              --> PENDING until the Admin client approves or denies
APPROVED --> Supplier (PurchaseOrderQueue) --> ships from INVENTORY --> InvoiceTopic --> OPC
OPC marks the order COMPLETED when every line is shipped

2. Batch schedule
The schedule is defined in scheduler/control-m/PS_PETSTORE.xml (two folders).
JobFolderWhenWaits forScript
PS_DB_BACKUPPS_PETSTORE_DAILYDaily
01:00
-ps_db_backup.sh
PS_ORDER_EXTRACTPS_PETSTORE_DAILYDaily
01:30
PS_DB_BACKUP-OKps_order_extract.sh
PS_ORDER_AGING_REPORTPS_PETSTORE_DAILYDaily
01:45
PS_ORDER_EXTRACT-
OK
ps_order_aging_report.sh
PS_INVENTORY_REPORTPS_PETSTORE_DAILYDaily
01:50
PS_ORDER_EXTRACT-
OK
ps_inventory_report.sh
PS_ORDER_PURGEPS_PETSTORE_DAILYSunday
02:00
PS_ORDER_EXTRACT-
OK
ps_order_purge.sh
PS_CATALOG_CHECKPS_PETSTORE_DAILYDaily
06:00
-ps_catalog_check.sh
PS_HEALTH_CHECKPS_PETSTORE_CYCLICEvery
10
minutes,
00:00-
23:59
-ps_health_check.sh
01:00 PS_DB_BACKUP --> 01:30 PS_ORDER_EXTRACT --+--> 01:45 PS_ORDER_AGING_REPORT
                                                 +--> 01:50 PS_INVENTORY_REPORT
                                                 +--> 02:00 PS_ORDER_PURGE (Sundays)
06:00 PS_CATALOG_CHECK            every 10 min  PS_HEALTH_CHECK

3. Job details
3.1 PS_DB_BACKUP
Online backup of PetStoreDB with SYSCS_UTIL.SYSCS_BACKUP_DATABASE (db/batch/db_backup.sql). The backup is
moved to /var/petstore/backup/PetStoreDB_YYYYMMDD. Backups older than 7 days are deleted. Critical job: up to 2
reruns 10 minutes apart. On failure Control-M mails ps-ops and PS_ORDER_EXTRACT stays waiting.
3.2 PS_ORDER_EXTRACT
Exports yesterday's purchase orders (00:00 to 24:00 server time) to /var/petstore/extract/orders_YYYYMMDD.csv
for Finance (db/batch/order_extract.sql).
ColumnContent
1 po_idOrder number, from the 1001 counter
2 po_user_idUser name of the customer
3 po_dateOrder time, epoch milliseconds
4 po_localeen_US, ja_JP or zh_CN. The order value is in the currency of the locale.
5 po_valueOrder total
6 linesNumber of order lines
7 statusPENDING, APPROVED, DENIED or COMPLETED
No header row. The last line is a trailer TRAILER,YYYYMMDD,<row count>. Failure mails ps-finance.
3.3 PS_ORDER_AGING_REPORT
Lists orders that are still PENDING or APPROVED after 24 hours, and orders the supplier has invoiced but the OPC
has not completed, in /var/petstore/extract/order_aging_YYYYMMDD.txt. Exit code 4 when any is listed; Control-
M mails ps-ops.
3.4 PS_INVENTORY_REPORT
Lists supplier items with stock below 500 units in /var/petstore/extract/inventory_YYYYMMDD.txt.
3.5 PS_ORDER_PURGE
Sundays only. Deletes COMPLETED and DENIED orders older than 180 days, with their order lines, supplier orders,
contact information, addresses and payment cards. It waits for that day's extract so no order is deleted before it is
extracted. PENDING and APPROVED orders are never purged.
3.6 PS_CATALOG_CHECK
Runs catalog checks C1 to C5 (db/batch/catalog_check.sql): category without product, product without item, item
priced below cost, item missing a description in a locale the store serves, item the supplier does not stock. If the
catalog tables do not exist it calls http://ps-app01:8000/petstore/Populate?forcefully=false to load the sample
data, then checks again. Exit code 4 means a check found rows; Control-M mails ps-catalog. Details are in
/var/petstore/log/catalog_check.log.

3.7 PS_HEALTH_CHECK
Every 10 minutes. Requests the Storefront main screen, the OPC EntityCatalog.jsp, and the Supplier and Admin
entry pages. Exit code 8 when any does not answer HTTP 200; Control-M mails ps-ops.

4. Exit codes and recovery
CodeMeaningAction
0OKNone
4A report or check found something: stuck orders
(PS_ORDER_AGING_REPORT) or bad catalog data
(PS_CATALOG_CHECK)
Read the report. For stuck PENDING orders ask
the order administrator to process them. For
catalog data, fix the data and rerun.
8SQL, file or HTTP errorRead batch.log and the job log. Check that the
J2EE server is up and that port 1527 answers.
Rerun.
4.1 Restore from backup
1. Stop the J2EE server and Cloudscape.
2. Move /var/petstore/db/PetStoreDB aside.
3. Copy /var/petstore/backup/PetStoreDB_YYYYMMDD to /var/petstore/db/PetStoreDB.
4. Start Cloudscape and the J2EE server, then open the Storefront home page.
4.2 Rerunning the extract
The extract always covers the day before the run date. To re-extract an older day, run the export query in
db/batch/order_extract.sql by hand with the two time limits changed.
4.3 Stuck APPROVED order
An order stays APPROVED when the supplier's invoice message never reaches the OPC (listed as MISMATCH in
the aging report). Resubmitting the supplier inventory in the Supplier client makes the OPC re-evaluate unfulfilled
orders.

5. Settings
conf/env.sh              PS_HOME, folders, PS_DB_URL, retention, thresholds, ps_ij and ps_log 
helpers
conf/petstore.properties database, storefront, OPC, JMS, supplier and batch settings
SettingValue
Order retention180 days
Backup retention7 days
Stuck order limit24 hours
Low stock limit500 units
Database URL for batchjdbc:derby://localhost:1527//var/petstore/db/PetStoreDB
