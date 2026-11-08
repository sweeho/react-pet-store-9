## ADDED Requirements

### Requirement: Administrator-only access

ID: SWHR8-R-0019
Recovered from: ADM-REQ-0001
The system SHALL restrict the administration order-management entry point to authenticated users holding the administrator role, using a form-based login.

#### Scenario: Non-administrator denied

- **GIVEN** a user without the administrator role
- **WHEN** the user requests the administration entry point
- **THEN** access is refused and a login form is offered

### Requirement: Administrator session expiry

ID: SWHR8-R-0162
Recovered from: ADM-REQ-0002
The system SHALL expire an administrator session after 54 minutes of inactivity.

#### Scenario: Idle session

- **GIVEN** an administrator session idle for 54 minutes
- **WHEN** the administrator makes another request
- **THEN** the session is treated as expired

### Requirement: Administration launcher

ID: SWHR8-R-0027
Recovered from: ADM-WF-0003
WHEN an administrator chooses to manage orders, the system SHALL return a launch descriptor for the rich admin client pointing at the serving host and port and carrying the session identifier; WHEN the administrator chooses logout, the system SHALL show the logout page.

#### Scenario: Manage orders chosen

- **GIVEN** a signed-in administrator
- **WHEN** the manage-orders action is chosen
- **THEN** a launch descriptor naming the serving host, port and session identifier is returned

#### Scenario: Logout chosen

- **GIVEN** a signed-in administrator
- **WHEN** logout is chosen
- **THEN** the logout page is shown

#### Scenario: No action given

- **GIVEN** a request with no action parameter
- **WHEN** it is received
- **THEN** an empty response is returned

### Requirement: Admin request error replies

ID: SWHR8-R-0026
Recovered from: ADM-REQ-0008
GIVEN an order-service request whose type is not GETORDERS, UPDATESTATUS, REVENUE or ORDERS, WHEN it is received, the system SHALL reply with an error naming the unknown type; GIVEN no session exists, the system SHALL reply that the session timed out and the administrator must log in again.

#### Scenario: Unknown request type

- **GIVEN** a request of type "FOO"
- **WHEN** it is received
- **THEN** the reply is an error stating "Unknown request type - FOO"

#### Scenario: No session

- **GIVEN** a request with no session
- **WHEN** it is received
- **THEN** the reply says the session timed out and to log in again

### Requirement: Find orders by status

ID: SWHR8-R-0004
Recovered from: OAPP-REQ-0003
The system SHALL return all orders having a given status so the administrator can list them (for example pending orders).

#### Scenario: Pending orders listed

- **GIVEN** orders with statuses PENDING and APPROVED
- **WHEN** orders with status PENDING are requested
- **THEN** only the PENDING orders are returned

#### Scenario: Case-sensitive match

- **GIVEN** an order with status PENDING
- **WHEN** orders with status "pending" are requested
- **THEN** that order is not returned

### Requirement: Order listing with details

ID: SWHR8-R-0003
Recovered from: ADMIN-REQ-0001
The system SHALL provide the admin client with the list of orders in a requested status, each with order id, user id, order date (month/day/year), order value and status.

#### Scenario: Orders with details

- **GIVEN** an approved order placed on 3 January 2005
- **WHEN** approved orders are requested
- **THEN** the order is returned with id, user id, date 1/3/2005, value and status APPROVED

#### Scenario: Missing order

- **GIVEN** a status record whose purchase order cannot be found
- **WHEN** orders for that status are requested
- **THEN** an admin facade error is raised

### Requirement: Order lists by the four statuses

ID: SWHR8-R-0144
Recovered from: ADM-REQ-0004
The system SHALL list orders by a requested status (PENDING, APPROVED, DENIED or COMPLETED), returning for each order its id, user id, order date, order amount and status, together with the total count.

#### Scenario: Count returned

- **GIVEN** three DENIED orders
- **WHEN** DENIED orders are requested
- **THEN** three orders and a total count of 3 are returned

### Requirement: Approve or deny pending orders

ID: SWHR8-R-0164
Recovered from: ADM-WF-0005
The system SHALL let an administrator change the status of pending orders only to APPROVED or DENIED, and WHEN committed SHALL send the approved set and the denied set as status-change requests, then reload the order lists.

#### Scenario: Mixed decisions committed

- **GIVEN** two pending orders set to APPROVED and one set to DENIED
- **WHEN** the changes are committed
- **THEN** one request with the two approved orders and one with the denied order are sent, and the lists are reloaded

#### Scenario: Nothing changed

- **GIVEN** all orders left PENDING
- **WHEN** the changes are committed
- **THEN** no status-change request is sent

### Requirement: Asynchronous publication of decisions

ID: SWHR8-R-0163
Recovered from: ADM-REQ-0006
The system SHALL apply an administrator's status changes by publishing one approval message containing every (order id, status) pair with both values present, asynchronously, and reply SUCCESS once the message is handed off.

#### Scenario: Decisions published

- **GIVEN** an update request with three complete (order id, status) pairs
- **WHEN** it is processed
- **THEN** one approval message with three orders is sent and SUCCESS is replied

#### Scenario: Incomplete pair skipped

- **GIVEN** an update request where one entry lacks a status
- **WHEN** it is processed
- **THEN** that entry is omitted from the message without an error

### Requirement: Order Approval document structure

Recovered from: ORDAPP-REQ-0001
The system SHALL represent a batch of order status decisions as an Order Approval document containing one or more orders, each carrying exactly an order identifier followed by an order status.

#### Scenario: Well-formed document

- **GIVEN** an Order Approval with two orders, each with an identifier then a status
- **WHEN** it is read
- **THEN** both orders are returned in order

### Requirement: Order Approval rejection rules

Recovered from: ORDAPP-RULE-0002
GIVEN an incoming Order Approval document, WHEN its root element is not OrderApproval, it has no Order child, or an Order lacks an order identifier or status with non-empty content, THEN the system SHALL reject the document with an error naming the expected element.

#### Scenario: Wrong root

- **GIVEN** a document whose root is not OrderApproval
- **WHEN** it is read
- **THEN** it is rejected with "OrderApproval element expected."

#### Scenario: Empty status

- **GIVEN** an Order with an empty status
- **WHEN** it is read
- **THEN** it is rejected with an error naming the element

### Requirement: Order Approval document type check

Recovered from: ORDAPP-REQ-0003
The system SHALL, by default, validate an incoming Order Approval document against the Order Approval DTD and reject a document whose declared document type is not the Order Approval 1.0 public identifier.

#### Scenario: Other document type

- **GIVEN** a document declaring a different public identifier
- **WHEN** it is read
- **THEN** it is rejected with "Document not of type" and the expected identifier

### Requirement: Sales totals by category or item

ID: SWHR8-R-0165
Recovered from: ADMIN-REQ-0002
The system SHALL provide revenue or quantity totals for orders placed between a start and end date, grouped by category, or by item when a category is given.

#### Scenario: Revenue by category

- **GIVEN** orders in a date range across two categories
- **WHEN** REVENUE totals are requested
- **THEN** per-category sums of quantity times unit price are returned

#### Scenario: Any other request is quantity

- **GIVEN** a category and a date range
- **WHEN** a request other than REVENUE is made
- **THEN** per-item quantity totals are returned

### Requirement: Order status view

ID: SWHR8-R-0028
Recovered from: ADMO-ENT-0001
The system SHALL provide an order status view giving, per order, its identifier, user, date, value and approval status.

#### Scenario: View rows

- **GIVEN** a purchase order with a status record
- **WHEN** the view is queried
- **THEN** one row shows the order id, user, date, value and status

### Requirement: Warn before refreshing unsaved decisions

ID: SWHR8-R-0029
Recovered from: AOM-REQ-0007
The system SHALL, WHEN an administrator who has unsaved status changes in the pending list chooses Refresh, warn them and continue only on confirmation.

#### Scenario: Refresh with unsaved changes

- **GIVEN** a pending order whose status has been changed from PENDING and not yet committed
- **WHEN** the administrator chooses Refresh
- **THEN** an OK/Cancel warning is shown and the lists are reloaded only if the administrator confirms

#### Scenario: Refresh with no changes

- **GIVEN** all pending orders still have status PENDING
- **WHEN** the administrator chooses Refresh
- **THEN** the lists are reloaded without a warning

### Requirement: Update-status hand-off to order processing

ID: SWHR8-R-0166
Recovered from: AOM-INT-0008
The system SHALL, for an update-status request, convert each order id and new status into an order-approval message, send it asynchronously to the order processing center, and reply SUCCESS once the message is handed off, where SUCCESS means queued and not applied.

#### Scenario: Approvals committed

- **GIVEN** an update-status request carrying two orders with ids and statuses
- **WHEN** it is processed
- **THEN** one order-approval message with both orders is sent asynchronously and SUCCESS is replied

#### Scenario: Entry lacking id or status

- **GIVEN** an update-status entry without an order id or without a status
- **WHEN** it is processed
- **THEN** that entry is silently omitted and statuses are not otherwise validated

### Requirement: Administrator role and form sign-in for order administration

Recovered from: AOM-REQ-0001
The system SHALL restrict the admin order-management entry point to users holding the administrator role, using a form-based sign-in page, and SHALL expose a logout screen.

#### Scenario: Unauthenticated request

- **GIVEN** a user who has not signed in as an administrator
- **WHEN** the user requests the order-management entry point
- **THEN** the sign-in form is presented instead of the tool

#### Scenario: No transport protection

- **GIVEN** the legacy deployment descriptor declares no transport guarantee
- **WHEN** credentials are submitted
- **THEN** TLS is not required (confidence medium; flagged for a rebuild decision)

### Requirement: Order list by status with count and fields

Recovered from: AOM-REQ-0001
The system SHALL return, for a requested order status, the count of matching orders and for each order its id, user id, date, amount and status.

#### Scenario: Orders listed by status

- **GIVEN** orders exist in the requested status
- **WHEN** an administrator requests that status
- **THEN** the count and each order's id, user id, date, amount and status are returned

### Requirement: Admin inactivity timeout of 54 minutes

Recovered from: AOM-REQ-0002
The system SHALL expire an admin session after 54 minutes of inactivity.

#### Scenario: Session idle past limit

- **GIVEN** an administrator session idle for 54 minutes
- **WHEN** the administrator makes a request
- **THEN** the session is expired (the value is a bare literal with no stated reason; confidence low)

### Requirement: Bulk status change published for asynchronous processing

Recovered from: AOM-REQ-0002
The system SHALL let an administrator change the status of one or more orders (approved or denied) in a single request, passing each order id and new status, by publishing an order-approval message asynchronously for processing.

#### Scenario: Several orders decided at once

- **GIVEN** a request carrying three order ids with new statuses
- **WHEN** it is processed
- **THEN** one order-approval message is published asynchronously

#### Scenario: Incomplete entry

- **GIVEN** an entry lacking an order id or status
- **WHEN** the request is processed
- **THEN** that entry is silently skipped

### Requirement: Only pending orders may be decided

Recovered from: AOM-BR-0003
The system SHALL allow only orders in PENDING status to be set to APPROVED or DENIED from the admin client, and SHALL present APPROVED, COMPLETED and DENIED orders read-only.

#### Scenario: Decided order is read-only

- **GIVEN** an order in APPROVED status
- **WHEN** the administrator views it
- **THEN** its status cannot be edited

#### Scenario: Server does not re-check

- **GIVEN** a status-change request for an order not in PENDING
- **WHEN** it reaches the server
- **THEN** no prior-status check is applied (the rule is enforced only in the client; flagged as a suspected defect)

### Requirement: Sales reports by revenue or order quantity

Recovered from: AOM-REQ-0004
The system SHALL provide sales reports by REVENUE (total amount) or ORDERS (quantity), for a date range and optional category, with a grand total, grouped by category or by item when a category is given.

#### Scenario: Item drill-down

- **GIVEN** a category and a date range
- **WHEN** a REVENUE report is requested
- **THEN** per-item amounts and a grand total are returned

### Requirement: Order list request returns orders for a status

Recovered from: AOM-REQ-0004
The system SHALL return, for a GETORDERS request carrying a status, the orders in that status with order id, user id, order date, order amount and status, plus the total count.

#### Scenario: Pending requested

- **GIVEN** pending and approved orders
- **WHEN** GETORDERS with status PENDING is received
- **THEN** only pending orders and their count are returned

### Requirement: Pending orders editable, handled orders read-only panels

Recovered from: AOM-REQ-0005
The system SHALL present pending orders in an editable panel and approved, denied and completed orders in a read-only panel.

#### Scenario: Panel split

- **GIVEN** orders in all four statuses
- **WHEN** the admin client loads
- **THEN** pending orders appear in the editable panel and the others in the read-only panel

### Requirement: Admin servlet role restriction and session-timeout error

Recovered from: AOM-REQ-0005
The system SHALL restrict the admin application's request servlet to authenticated users in the administrator role using form-based login, and SHALL reject data requests that arrive without an established session with a "Session Timed Out" error. (This record is filed under customer-account in one extraction pass and admin-order-management in another; classification is disputed.)

#### Scenario: No session

- **GIVEN** a data request with no established session
- **WHEN** it is received
- **THEN** a "Session Timed Out" error is returned

### Requirement: Admin client delivered as a launch descriptor

Recovered from: AOM-REQ-0006
The system SHALL deliver the admin client to administrators as a Java Web Start launch descriptor generated when the user chooses manageorders, and SHALL forward to a logout page when the user chooses logout.

#### Scenario: Manage orders

- **GIVEN** a signed-in administrator
- **WHEN** manageorders is chosen
- **THEN** a launch descriptor with server name, port and session id is returned

### Requirement: Approve or deny one or many orders with explicit commit

Recovered from: AOM-WFL-0006
The system SHALL let an administrator mark one or many selected pending orders as approved or denied (via per-row status choice or mass Approve/Deny buttons) and SHALL only send them to the server when Commit is pressed; Commit with no approved or denied rows sends nothing.

#### Scenario: Mass approve then commit

- **GIVEN** three selected pending orders
- **WHEN** Approve is pressed and then Commit
- **THEN** the three approvals are sent to the server

#### Scenario: Empty commit

- **GIVEN** no rows marked approved or denied
- **WHEN** Commit is pressed
- **THEN** nothing is sent

### Requirement: Manage-orders and logout actions on admin page

Recovered from: AOM-WFL-0003
The system SHALL, on the admin page, offer a "manage orders" action that launches the rich admin client, handing it the server host, port and the current session identifier, and a "logout" action that shows the logout screen.

#### Scenario: Any other action value

- **GIVEN** a currentScreen value other than manageorders or logout, or none
- **WHEN** the request is processed
- **THEN** no response body is produced

### Requirement: Session-timeout and unknown-request errors

Recovered from: AOM-REQ-0010
GIVEN an admin data request arrives with no existing session WHEN it is processed THEN the system SHALL answer with an error telling the user the session timed out and to log in again; GIVEN an unknown request type THEN it SHALL answer with an "Unknown request type" error.

#### Scenario: Unknown type

- **GIVEN** a request of type "FOO"
- **WHEN** it is processed
- **THEN** an error "Unknown request type - FOO" is returned with HTTP 200

### Requirement: Orders by status finder

Recovered from: ORDER-APPROVAL-REQ-0002
The system SHALL return all orders whose status equals a given value.

#### Scenario: Exact match

- **GIVEN** orders with status PENDING
- **WHEN** orders with status PENDING are requested
- **THEN** all of them are returned, matching case-sensitively
