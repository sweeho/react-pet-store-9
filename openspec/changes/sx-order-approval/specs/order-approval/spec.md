## ADDED Requirements

### Requirement: Order status listing

ID: SWHR8-R-0008
Recovered from: ORDC-REQ-0001
The system SHALL expose an order status listing joining each purchase order (id, user, date, value) with its current status from the order manager, listing only orders that have a status record.

#### Scenario: Order without status record

- **GIVEN** a purchase order with no status record
- **WHEN** the listing is read
- **THEN** that order does not appear

#### Scenario: Order with status record

- **GIVEN** a purchase order with a status record
- **WHEN** the listing is read
- **THEN** its id, user, date, value and current status are shown

### Requirement: Automatic approval by locale and total

Recovered from: ORDAPP-RULE-0001
The system SHALL, on receipt of a purchase order, store it, start its workflow in PENDING, and mark it APPROVED when the locale is US and the total is strictly below 500, or the locale is Japan and the total is strictly below 50000. The order total and locale MUST be carried in the order message.

#### Scenario: US order under limit

- **GIVEN** a US order with total 499.99
- **WHEN** it is received
- **THEN** it is APPROVED

#### Scenario: Order at the limit

- **GIVEN** a US order with total 500 or a Japan order with total 50000
- **WHEN** it is received
- **THEN** it remains PENDING

### Requirement: Other locales held pending

Recovered from: ORDAPP-RULE-0002
The system SHALL leave an order whose locale is neither US nor Japan PENDING for administrator decision regardless of total.

#### Scenario: Locale without limit

- **GIVEN** an order in the zh_CN locale
- **WHEN** it is received
- **THEN** it remains PENDING

### Requirement: Administrator hold

Recovered from: ADM-BR-0009
The system SHALL hold orders over the regional limit as PENDING until an administrator approves or denies them; the admin module itself SHALL NOT apply a limit.

#### Scenario: Over-limit order

- **GIVEN** a US order with total 900
- **WHEN** it is received
- **THEN** it stays PENDING until an administrator approves or denies it

### Requirement: Decisions apply only to pending orders

Recovered from: ORDAPP-RULE-0003
The system SHALL apply an approval or denial only to orders whose status is PENDING, and SHALL ignore it, with no status change, supplier order or customer notification, for orders already approved, denied or completed.

#### Scenario: Decision on completed order

- **GIVEN** an order in status COMPLETED
- **WHEN** an approval message arrives for it
- **THEN** nothing changes and nothing is sent

### Requirement: Approval workflow messaging

Recovered from: ORDAPP-WF-0001
The system SHALL, for each pending order whose new status is APPROVED, update the status, send a supplier purchase order (id, date, shipping contact and address, line items) to the supplier queue, and send the list of changed orders to customer relations for notification.

#### Scenario: Order approved

- **GIVEN** a PENDING order
- **WHEN** an approval for it is processed
- **THEN** its status becomes APPROVED, a supplier purchase order is sent and customer relations receives the changed order

### Requirement: Per-order status record

Recovered from: ORDER-APPROVAL-ENTITY-0001
The system SHALL keep exactly one workflow status record per order, keyed by order id.

#### Scenario: Order has one status

- **GIVEN** an order
- **WHEN** its status record is read
- **THEN** exactly one record exists, identified by the order id

### Requirement: Status record operations

Recovered from: ORDER-APPROVAL-REQ-0001
The system SHALL allow a status record to be created with a caller-supplied initial status when a purchase order is received, and its status to be updated and read by order id, and SHALL fail with a not-found error when no record exists for the id.

#### Scenario: Unknown order

- **GIVEN** an order id with no status record
- **WHEN** its status is read or updated
- **THEN** a not-found error is raised

### Requirement: Order status vocabulary

Recovered from: APPR-ENT-0001
The system SHALL track each order's state as one of PENDING, APPROVED, DENIED or COMPLETED and SHALL refuse any other value in the data store; the application code additionally names SHIPPED_PART, a conflict to be settled.

#### Scenario: Invalid status

- **GIVEN** an order
- **WHEN** a status outside the permitted set is stored
- **THEN** it is refused

### Requirement: Find orders by status

Recovered from: APPR-ENT-0009
The system SHALL support finding orders by status.

#### Scenario: Lookup by status

- **GIVEN** orders in several statuses
- **WHEN** orders are requested for PENDING
- **THEN** only PENDING orders are returned

### Requirement: Pluggable transition delegates

Recovered from: ORDER-APPROVAL-WF-0001
The system SHOULD support transition delegates instantiated by configured class name that receive an XML message or batch and perform a workflow transition, and SHALL report a failure to load one as a transition error.

#### Scenario: Unknown delegate

- **GIVEN** a delegate class name that cannot be loaded
- **WHEN** a transition is requested
- **THEN** a transition error is raised

### Requirement: Shared asynchronous send

Recovered from: ORDER-APPROVAL-INTEGRATION-0001
The system SHALL provide a shared service that accepts a text message (order or approval XML) from any caller and publishes it as one text message to a single configured queue.

#### Scenario: Message published

- **GIVEN** a caller with an approval XML message
- **WHEN** it is sent
- **THEN** one text message is placed on the configured queue

### Requirement: Send failure reporting

Recovered from: ORDER-APPROVAL-BUSINESS-RULE-0002
The system SHALL raise an error to the caller when the queue or connection fails and SHALL NOT report the message as sent.

#### Scenario: Queue down

- **GIVEN** an unavailable queue
- **WHEN** a message is sent
- **THEN** the caller receives an error

### Requirement: Transactional send

Recovered from: ORDER-APPROVAL-BUSINESS-RULE-0003
The system SHALL perform the send within the caller's transaction, so the queued message is committed or discarded together with the caller's work.

#### Scenario: Caller rolls back

- **GIVEN** a message sent inside a transaction
- **WHEN** the transaction rolls back
- **THEN** the message is not delivered

### Requirement: OrderApproval document

Recovered from: ORDAPP-WORKFLOW-0001
The system SHALL exchange approval decisions as an OrderApproval document with one or more Order entries, each carrying an OrderId followed by an OrderStatus, and SHALL reject a document whose root is not OrderApproval or an entry that is not an Order.

#### Scenario: Wrong element

- **GIVEN** an OrderApproval document containing a non-Order entry
- **WHEN** it is read
- **THEN** it is rejected with an error stating an Order element is expected

### Requirement: Schema validation of incoming documents

Recovered from: ORDFUL-REQ-0008
The system SHALL validate incoming order documents against their published schema, resolved through a catalog overridable by a configured location, and SHALL reject a document of the wrong type.

#### Scenario: Invalid document

- **GIVEN** a document failing schema validation
- **WHEN** it is received
- **THEN** it is rejected with an error

### Requirement: Mail document

Recovered from: ORDER-NOTIFICATIONS-INTEGRATION-0005
The system SHALL represent a customer notification mail as a Mail document with an Address, a Subject and a Content, in that order.

#### Scenario: Notification built

- **GIVEN** a customer notification
- **WHEN** it is built
- **THEN** it carries Address, Subject and Content in that order

### Requirement: Mail notifications off by default

Recovered from: ORN-BR-0001
The system SHALL NOT send mail on order received, approved or completed under the default configuration.

#### Scenario: Default configuration

- **GIVEN** the default configuration
- **WHEN** an order is received, approved or completed
- **THEN** no mail is sent

### Requirement: Sales totals by date range

Recovered from: ADMIN-REQ-0002
The system SHALL provide revenue or quantity totals for orders placed between a start and end date, grouped by category, or by item when a category is given.

#### Scenario: Category given

- **GIVEN** a date range and a category
- **WHEN** totals are requested
- **THEN** totals are returned per item in that category

### Requirement: Backup retention and low-stock threshold

Recovered from: INVENTORY-REPORTING-BUSINESS-RULE-0001
The system SHALL keep database backups for 7 days and SHALL flag inventory as low stock at 500 units.

#### Scenario: Stock at threshold

- **GIVEN** an item with 500 units
- **WHEN** stock is evaluated
- **THEN** it is flagged low
