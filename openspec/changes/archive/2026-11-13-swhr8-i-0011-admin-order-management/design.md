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

## Rebuild decisions (sprint SWHR8-S-0010, ticket SWHR8-T-0042)

Planning read the code this change lands on. The legacy notes above say what the old system did; this section says how the rebuild does it. Every decision is fixed by existing code or by the locked acceptance tests in `tests/acceptance/admin-order-management/`.

### What already exists and is reused

- **Admin login and role check.** `server/admin/auth.ts` (`adminSignOn`, `adminSignOff`, `adminSession`, `requireAdministrator`), `routes/api/admin/signon.post.ts` / `signoff.post.ts`, the `user_role` table and the `/admin/login?next=` page (change swhr8-i-0010, F7). `GET /api/session` already reports `admin`.
- **Decision pipeline.** `server/approval/service.ts` builds and parses the OrderApproval document (`approvalDocument`, `parseApprovalDocument`) and applies a decision only to a PENDING order (`handleDecision`). `server/approval/queue.ts` has the `order-approval` outbox (`databaseQueue(APPROVAL_QUEUE)`) and `scheduleApprovalDrain()`; the drain fans each applied decision out to `order-decision` (fulfilment) and `order-status-mail`.
- **Order data.** `purchase_order` (order id, user id, order date, total), `order_status`, `order_line_item` (category id, item id, quantity, unit price) in `db/schema.ts`; reads go through `server/checkout/repository.ts` (`statusRecords`).
- **Shell.** `PRIMARY_AREAS` (`src/constants/primary-areas.ts`) drives nav; empty/error/loading frames in `src/components/shell/`.

### Decisions

- **M1 Module boundaries are the acceptance tests'.** Pure logic lives in `server/lib/admin-session.ts`, `admin-launcher.ts`, `admin-requests.ts`, `admin-orders.ts`, `admin-sales.ts`, with exactly the exported signatures the test files' header comments state. `server/lib/` is new; it holds only these five modules, and each delegates to the capability modules above rather than querying tables itself.
- **M2 Admin idle expiry is 54 minutes, on the admin sign-on only.** `server/admin/auth.ts` keeps `{ userName, lastUsed }` per session id (via `admin-session.ts`). `adminSession`/`requireAdministrator` treat a sign-on idle 54 minutes or more as signed off (drop it, answer 401) and otherwise touch `lastUsed`. Measure "now" through the existing per-session test clock (`server/customer/auth.ts` `advanceClock`, `POST /api/test/clock`) so browser tests need no sleeping. The customer 15-minute rule is unchanged.
- **M3 One request-type relay, REST routes on top.** `handleOrderServiceRequest({ type, session, orders?, publish? })` dispatches GETORDERS, UPDATESTATUS, REVENUE, ORDERS; anything else replies `{ kind: "error", message: "Unknown request type - <type>" }`; a null session replies an error saying the session timed out and to log in again. Routes: `GET /api/admin/orders?status=` -> `{ orders, count }`; `POST /api/admin/update-status` body `{ orders: [{ orderId, status }] }` -> `{ result: "SUCCESS" }`; `GET /api/admin/sales?type=&start=&end=&category=` -> `{ totals: [{ key, total }] }`; `POST /api/admin/launch` body `{ action }`. A route with no admin sign-on answers 401 with the session-timed-out message; a signed-on non-administrator answers 403 (existing rule).
- **M4 UPDATESTATUS publishes one OrderApproval document.** Entries lacking an order id or a status are dropped; statuses are not validated (spec). Production `publish` serialises the kept entries into one `<OrderApproval>` with one `<Order>` per entry, inserts it with `databaseQueue(APPROVAL_QUEUE)` and calls `scheduleApprovalDrain()`. SUCCESS means queued; the existing drain applies it later and ignores non-PENDING orders.
- **M5 Listing.** `listOrdersByStatus` joins status records to purchase orders by exact, case-sensitive status, formats the date `M/D/YYYY` from the local date parts, returns `{ orders, count }`, and throws an error named `AdminFacadeError` when a status record has no purchase order. `orderStatusView` is the same join without the status filter (the legacy `v_order_status` view; no SQL view is created). Value is `purchase_order.total`.
- **M6 Sales totals.** `salesTotals({ lines, type, start, end, category? })`: ISO dates, both ends inclusive. `type === "REVENUE"` sums quantity x unit price, anything else sums quantity. Grouped by category, or by item id within `category` when one is given. Arithmetic uses JS doubles (not the legacy single-precision float); the route rounds money to cents for display. Task 4.2's Business Owner confirmation is still owed; the double-precision default is recorded as discrepancy SD4.
- **M7 Launcher.** `handleAdminAction({ action?, session, host, port })`: `manageorders` -> `{ kind: "launch", descriptor }` where the descriptor is a JSON string naming host, port, session id and the `/admin/orders` path; `logout` -> `{ kind: "logout-page" }` (the route also signs the admin off); no action -> `{ kind: "empty" }`. The route sends `Cache-Control: no-store`.
- **M8 Pages.** `/admin` (launcher; renders the admin sign-on form in place when not signed on as an administrator — a password field and a "Log in" button, no "Manage orders"); `/admin/orders` (Pending/Approved/Denied/Completed tabs, counts, Commit and Refresh, a Logout control); `/admin/sales` (date range, category, Revenue/Quantity); `/admin/logout` (logged-out page, no logout control). `/admin/orders` decides access from the `/api/admin/orders` response (401 -> sign-on form, 403 -> access-refused frame), not from `/api/session`, because the locked browser tests stub only the orders and update-status APIs. Pending rows carry `data-order-id` and a `<select>` labelled "Status" offering PENDING, APPROVED and DENIED. Commit posts the APPROVED set and the DENIED set as two separate `update-status` requests (none when nothing changed), shows the "sent to order processing; new statuses can take a moment" notice, then reloads. Refresh with unsaved changes asks with `window.confirm` (OK/Cancel) and reloads only on OK.
- **M9 Navigation.** The `administration` primary area's `href` becomes `/admin`. Its label stays "Administration" (the mockups' nav label). The inventory page keeps its route and its login redirect.

### Phases

1. Access control (tasks 1.x): admin-session expiry in `server/admin/auth.ts`, launcher module + route, relay error replies.
2. Order listing (2.x): admin-orders module, `GET /api/admin/orders`, order lists page.
3. Approval workflow (3.x): admin-requests UPDATESTATUS + OrderApproval publish, `POST /api/admin/update-status`, Commit/Refresh UI.
4. Sales totals (4.x): admin-sales module, `GET /api/admin/sales`, sales page.
5. **Test harness.** Unit tests beside each `server/lib/admin-*.ts`; route tests under `routes/api/admin/` (server project, real `H3Event`); page tests for `/admin`, `/admin/orders`, `/admin/sales`, `/admin/logout`; one `e2e/admin-orders.spec.ts` that signs on as the seeded administrator, decides a seeded PENDING order and sees it leave the Pending list after reload. The locked acceptance tests (unit and Playwright) must pass unchanged.
6. **CI.** No workflow change: the existing CI already runs lint, typecheck, unit, acceptance and E2E on pushes and pull requests to `vortex/**`. The phase is a green CI run on the ticket's pull request.

## Spec discrepancies

Recorded, not edited into the delta spec.

- **SD1 Duplicate requirement.** "Find orders by status" (SWHR8-R-0004, recovered from OAPP-REQ-0003) is ADDED here but `openspec/specs/order-approval/spec.md` already has a requirement of that name. After archive two capabilities state the same rule. The rebuild implements it once (`findOrdersByStatus` in `server/lib/admin-orders.ts`, matching `server/approval/service.ts`).
- **SD2 No requirement for the Order Approval document.** Tasks 3.3 and 3.4 and the brief's "Order Approval rejection rules" have no requirement in this delta; the rule already lives in `openspec/specs/order-approval/` ("Approval document validation") and is implemented by `parseApprovalDocument`. Those task lines are traced to SWHR8-R-0163/SWHR8-R-0166, which produce the document.
- **SD3 Unvalidated statuses can stall a queued decision.** The spec (SWHR8-R-0166.02) forbids validating statuses on hand-off, but the existing approval drain rejects any status other than APPROVED/DENIED and leaves the whole message queued, retried on every drain. The UI offers only APPROVED/DENIED, so this is reachable only through the API.
- **SD4 Totals precision.** The legacy summed single-precision floats (suspected rounding defect); task 4.2 asks the Business Owner to decide. The rebuild uses doubles pending that decision.
- **SD5 Launch descriptor exposes the session id.** The legacy JNLP carried the session id to the rich client. The rebuild has no rich client, but SWHR8-R-0027.01 requires the descriptor; returning the HTTP-only cookie's value in a body weakens that cookie against script access. Mitigated by returning it only to a signed-on administrator of that same session, with `no-store`.
- **SD6 Refresh warning style.** Mockups SWHR8-MCK-63/64 draw a styled in-page dialog; the locked browser test (SWHR8-C-0259) asserts a native `confirm` dialog. The rebuild follows the test.
- **SD7 Nav label.** The brief calls the nav entry "Admin order management"; the mockups and the existing shell label it "Administration". The rebuild keeps "Administration" and points it at `/admin`.
- **SD8 Unprotected data servlet.** The legacy constrained only the launcher servlet to the administrator role. The rebuild protects every admin API with `requireAdministrator` (ARCHITECTURE Key Decision "Administration is one role behind one form login"); the legacy gap is not reproduced.
