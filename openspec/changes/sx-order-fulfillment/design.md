# Design notes: legacy implementation of order fulfillment

## User interface

No `kind: screen` records were extracted for this capability; its user interface is unspecified. The inventory update is described only as behaviour (`order-fulfillment-REQ-0002`, `ORDER-FULFILLMENT-WORKFLOW-0007`, `ORDER-FULFILLMENT-BUSINESS-RULE-0008/0009`). Screen count: 0.

## How the legacy system implements it

- Supplier application: a message-driven bean reads the supplier purchase-order queue and calls `OrderFulfillmentFacadeEJB` (container transactions). `processAnOrder` skips lines where quantity equals quantity shipped; `checkInventory` compares inventory to the line quantity and swallows the not-found exception for unstocked items.
- Invoices are published as text messages on the order center invoice topic (`jms/opc/InvoiceTopic`), new connection per message.
- The inventory update page is protected by the administrator role with form login (no transport encryption). One transaction sets quantities, re-attempts PENDING orders and publishes invoices.
- Order center (`apps/opc`): on invoice receipt, shipped quantities are added per item; status becomes COMPLETED or SHIPPED_PART; only COMPLETED triggers the completed-order mail message.
- Components: `supplierpo` (CMP entity SupplierOrder, ContactInfo, LineItem with cascade delete), `purchaseorder`, `lineitem`, `processmanager` (one status record per order, pluggable transition delegates), `xmldocuments` (DTD-based documents, UTF-8, indentation), `servicelocator` (web variant caches resources; EJB variant does not; environment entries never cached).
- Schema (`petstore_oracle.sql`): `supplier_order` (po_status free text, no CHECK in the exported DDL), `supplier_line_item` (composite key, no FK to item), `inventory` (key item_id), named counters. The db pass records a PENDING/COMPLETED-only constraint; the DDL exports do not show it. Treat as disputed until the DDL is rechecked.

## Known issues and ambiguities

- Key collisions: the IR passes reuse some record keys for different behaviour in different modules (for example `ORDER-FULFILLMENT-BR-0002`, `-BR-0003`, `-BR-0004`, `-ENTITY-0001`, `ORDF-BR-0003`, `ORDF-ENT-0001`, `ORDF-INT-0001`, `ORDER-FULFILLMENT-BUSINESS-RULE-0001/0002/0003`, `ORDER-FULFILLMENT-REQUIREMENT-0001`, `ORDER-FULFILLMENT-WORKFLOW-0001`, `ORDER-FULFILLMENT-INTEGRATION-0001`). The spec states one variant per key; the recommendations file flags them for splitting. For the approved keys `ORDER-FULFILLMENT-BUSINESS-RULE-0002/0003` the supplier-application variant is used; the supplier purchase-order status/cascade-delete variants (status progression, cascade delete) are covered by `ORDER-FULFILLMENT-BR-0003/0004`. `ORDF-ENT-0001/0002` use the DDL (supplier order and line) variant; the purchase-order and process-status variants share the key.
- Order statuses differ by module: supplier order PENDING/COMPLETED (db), purchase order PENDING/APPROVED/DENIED/COMPLETED, order center COMPLETED/SHIPPED_PART. Transitions are constants only and not enforced in code.
- Suspected defect: `SupplierOrderEJB.getData` builds shipping info from an empty new object and omits status.
- Two XML validation notes disagree in places (structural check versus schema/catalog validation); see `ORDER-FULFILLMENT-BUSINESS-RULE-0001` and `ORDFUL-REQ-0008`.
