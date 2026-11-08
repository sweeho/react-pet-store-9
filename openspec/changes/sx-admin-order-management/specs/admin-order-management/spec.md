## ADDED Requirements

### Requirement: Administrator-only access

Recovered from: ADM-REQ-0001
The system SHALL restrict the administration order-management entry point to authenticated users holding the administrator role, using a form-based login.

#### Scenario: Non-administrator denied

- **GIVEN** a user without the administrator role
- **WHEN** the user requests the administration entry point
- **THEN** access is refused and a login form is offered

### Requirement: Administrator session expiry

Recovered from: ADM-REQ-0002
The system SHALL expire an administrator session after 54 minutes of inactivity.

#### Scenario: Idle session

- **GIVEN** an administrator session idle for 54 minutes
- **WHEN** the administrator makes another request
- **THEN** the session is treated as expired

### Requirement: Administration launcher

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

Recovered from: ADM-REQ-0004
The system SHALL list orders by a requested status (PENDING, APPROVED, DENIED or COMPLETED), returning for each order its id, user id, order date, order amount and status, together with the total count.

#### Scenario: Count returned

- **GIVEN** three DENIED orders
- **WHEN** DENIED orders are requested
- **THEN** three orders and a total count of 3 are returned

### Requirement: Approve or deny pending orders

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

Recovered from: ADMO-ENT-0001
The system SHALL provide an order status view giving, per order, its identifier, user, date, value and approval status.

#### Scenario: View rows

- **GIVEN** a purchase order with a status record
- **WHEN** the view is queried
- **THEN** one row shows the order id, user, date, value and status
