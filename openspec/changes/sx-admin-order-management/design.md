# Legacy implementation notes: admin-order-management

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The legacy tool was a Swing rich client launched via Java Web Start from a small servlet/JSP home page. The user guide (sections 3.1-3.3) mentions an editable "pending orders" pane and a read-only "View Non-Pending Orders" pane, but no screen-level record captured their fields or controls. Do not invent them.

## How the legacy application implements it

- Access: `web.xml` constrains `/AdminRequestProcessor` (GET, POST) to role `administrator` with FORM login; session timeout is 54 minutes (bare literal, no stated intent); no TLS requirement. Only one of the two servlets is constrained (the data servlet `ApplRequestProcessor` checks only for an existing session) - suspected defect, to be confirmed.
- Launcher: `AdminRequestProcessor.doPost` dispatches on `currentScreen` (`manageorders` -> JNLP with session id as argument; `logout` -> logout page; missing parameter yields an empty response).
- Data relay: `ApplRequestProcessor` handles XML requests GETORDERS, UPDATESTATUS, REVENUE, ORDERS; replies are XML Response/Error documents. Unknown type and missing session produce error replies.
- Listing: `AdminRequestBD` -> remote `OPCAdminFacadeEJB.getOrdersByStatus` -> `ProcessManagerEJB.getOrdersByStatus` -> CMP finder `findOrdersByStatus` (exact, case-sensitive match on status). Date formatted manually M/D/YYYY.
- Decisions: rich client `DataSource.commit` sends approved and denied sets separately via UPDATESTATUS; the web relay skips entries lacking id or status and sends one Order Approval XML through the `AsyncSender` EJB; status values are not validated against the four known statuses. SUCCESS means handed off, not applied.
- Order Approval document: DTD `OrderApproval (Order+)`, `Order (OrderId, OrderStatus)`; public id `-//Sun Microsystems, Inc. - J2EE Blueprints Group//DTD Order Approval 1.0//EN`; validating by default. Siblings iteration stops silently at the first foreign element.
- Sales totals: `OPCAdminFacadeEJB.getChartInfo`; anything other than "REVENUE" is treated as quantity; totals use single-precision Float (suspected rounding defect).
- Database: view `v_order_status` joins purchase_order and order_manager.

## Open points

- `ORDER-APPROVAL-REQ-0002` (processmanager pass C) duplicates `OAPP-REQ-0003` and is covered by that requirement.
- Pass-B/C records for this capability (AOM-\*) restate the above; AOM-REQ-0005 (editable pending pane vs read-only non-pending pane) and AOM-REQ-0007 (refresh warns on unsaved edits) describe UI behaviour that is captured only in prose here, not as screen records.
