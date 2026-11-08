# Design notes: order-approval (legacy implementation)

## User interface

No screen records were extracted for this capability; its user interface is unspecified. (The administrator approve/deny pages live in the admin module and were not recorded under this capability.)

## How the legacy application implements it

- `PurchaseOrderMDB` (opc) receives the purchase order, stores it, starts the workflow in PENDING and applies the auto-approval limits (US < 500, JP < 50000). Limits also appear in `conf/petstore.properties` lines 23-29; no limit exists for zh_CN.
- `OrderApprovalMDB` (opc) handles approval/denial messages, ignoring orders not PENDING; `OrderApprovalTD` builds the supplier purchase order.
- `ProcessManagerEJB` / `ManagerEJB` (processmanager) hold one CMP status record per order (primary key orderId). `OrderStatusNames` lists five statuses (PENDING, APPROVED, DENIED, SHIPPED_PART, COMPLETED).
- DDL constraint in `petstore_oracle.sql` (~173, ~234) allows only four values (no SHIPPED_PART): a code/schema conflict to resolve.
- `TransitionDelegateFactory` instantiates delegates by class name; reachability was not established.
- `AsyncSenderEJB` publishes one text message to a configured queue inside the caller's transaction (Required); failures are raised to the caller.
- `OrderApproval.dtd` / `Mail.dtd` define the XML documents; `XMLDocumentUtils` validates against them via an overridable catalog.
- The petstore web tier passes total and locale in the order message; the mail-on-order/approval/completion defaults are off in `petstore.properties`.
- Source disagreements: the admin module (ADM-BR-0009) is marked contradicts-docs; `ADMIN-REQ-0002` (sales totals) and `INVENTORY-REPORTING-BUSINESS-RULE-0001` appear to belong to other capabilities.
