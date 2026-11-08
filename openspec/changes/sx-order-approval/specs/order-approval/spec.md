## ADDED Requirements

### Requirement: Administrator hold

ID: SWHR8-R-0194
Recovered from: ADM-BR-0009
The system SHALL hold orders over the regional limit as PENDING until an administrator approves or denies them; the admin module itself applies no limit.

#### Scenario: Over-limit order

- **GIVEN** a US order with total 900
- **WHEN** it is received
- **THEN** it stays PENDING until an administrator approves or denies it

### Requirement: Order status vocabulary

ID: SWHR8-R-0148
Recovered from: APPR-ENT-0001
The system SHALL track each order's processing state as exactly one of PENDING, APPROVED, DENIED or COMPLETED, and SHALL refuse any other value.

#### Scenario: Invalid status

- **GIVEN** an order
- **WHEN** a status outside PENDING, APPROVED, DENIED and COMPLETED is stored
- **THEN** it is refused

### Requirement: Find orders by status

ID: SWHR8-R-0082
Recovered from: APPR-ENT-0009
The system SHALL keep one status per order in the order manager, and SHALL support finding orders by status.

#### Scenario: Lookup by status

- **GIVEN** orders in several statuses
- **WHEN** orders are requested for PENDING
- **THEN** only PENDING orders are returned

### Requirement: Order message carries total and locale

ID: SWHR8-R-0193
Recovered from: OA-REQ-0001
The system SHALL pass each order's total and locale in the order message so that the order processing center can compare the total with the locale's limit, 500 for US and 50000 for JP, approving automatically below the limit and holding the order as pending otherwise.

#### Scenario: Order message built

- **GIVEN** a placed order with a total and a locale
- **WHEN** the order message is created
- **THEN** it carries the total and the locale

#### Scenario: Total exactly at the limit

- **GIVEN** a US order with total exactly 500
- **WHEN** it is evaluated
- **THEN** it is held as pending

### Requirement: Recognised order statuses

ID: SWHR8-R-0083
Recovered from: OAPP-BR-0001
The system SHALL recognise the order statuses PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED; the manager does not enforce them or the allowed transitions.

#### Scenario: Partly shipped status

- **GIVEN** an order that is partly shipped
- **WHEN** its status is set to SHIPPED_PART
- **THEN** the application accepts the status name

### Requirement: Per-order status record

ID: SWHR8-R-0149
Recovered from: OAPP-ENT-0001
The system SHALL keep exactly one workflow-status record per order, keyed by order id, holding the current order status.

#### Scenario: Order has one status

- **GIVEN** an order
- **WHEN** its status record is read
- **THEN** exactly one record exists, identified by the order id

### Requirement: Create status record on order receipt

ID: SWHR8-R-0084
Recovered from: OAPP-REQ-0001
The system SHALL create a status record for an order, with a caller-supplied initial status, when a new purchase order is received to start order fulfilment.

#### Scenario: New order received

- **GIVEN** a newly received purchase order
- **WHEN** its status record is created with initial status PENDING
- **THEN** the record exists with status PENDING

### Requirement: Update and read order status

ID: SWHR8-R-0085
Recovered from: OAPP-REQ-0002
The system SHALL allow the status of an existing order to be updated and read by order id, and SHALL fail with a not-found error when no status record exists for the id.

#### Scenario: Unknown order

- **GIVEN** an order id with no status record
- **WHEN** its status is read or updated
- **THEN** a not-found error is raised

### Requirement: Approval document validation

ID: SWHR8-R-0086
Recovered from: ORDAPP-REQ-0002
The system SHALL reject an order-approval document element that is not an Order with an error stating an Order element is expected, and SHALL require OrderId followed by OrderStatus in that order.

#### Scenario: Wrong element

- **GIVEN** an approval document containing a non-Order element
- **WHEN** it is read
- **THEN** it is rejected with an error stating an Order element is expected

#### Scenario: Fields out of order

- **GIVEN** an Order entry with OrderStatus before OrderId
- **WHEN** it is read
- **THEN** it is rejected with an error

### Requirement: Automatic approval by locale and total

ID: SWHR8-R-0195
Recovered from: ORDAPP-RULE-0001
The system SHALL automatically approve a newly received order when its locale is US and its total price is below 500, or its locale is Japan and its total price is below 50000; every other order, including exactly 500 US, exactly 50000 Japan and any other locale, SHALL remain PENDING.

#### Scenario: US order under limit

- **GIVEN** a US order with total 499.99
- **WHEN** it is received
- **THEN** it is APPROVED

#### Scenario: Order at the limit

- **GIVEN** a US order with total 500 or a Japan order with total 50000
- **WHEN** it is received
- **THEN** it remains PENDING

#### Scenario: Locale without limit

- **GIVEN** an order in the zh_CN locale with a small total
- **WHEN** it is received
- **THEN** it remains PENDING

### Requirement: Decisions apply only to pending orders

ID: SWHR8-R-0087
Recovered from: ORDAPP-RULE-0002
The system SHALL, on an approval or denial message for an order whose current status is not PENDING, ignore that order with no status change, supplier order or customer notification, and otherwise SHALL record the new status.

#### Scenario: Decision on completed order

- **GIVEN** an order in status COMPLETED
- **WHEN** an approval message arrives for it
- **THEN** nothing changes and nothing is sent

#### Scenario: Decision on pending order

- **GIVEN** a PENDING order
- **WHEN** a denial message arrives for it
- **THEN** its status becomes DENIED

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

### Requirement: Automatic approval thresholds by locale

ID: SWHR8-R-0196
Recovered from: ORDER-APPROVAL-BUSINESS-RULE-0001
The system SHALL automatically approve an order whose total is under 500 (en_US locale) or under 50000 (ja_JP locale); other orders SHALL remain pending until an administrator decides.

#### Scenario: Japan order under limit

- **GIVEN** a ja_JP order with total 49999
- **WHEN** it is received
- **THEN** it is approved automatically

#### Scenario: Order over limit

- **GIVEN** an en_US order with total 800
- **WHEN** it is received
- **THEN** it remains pending until an administrator decides

### Requirement: Send failure reporting

ID: SWHR8-R-0088
Recovered from: ORDER-APPROVAL-BUSINESS-RULE-0002
The system SHALL, when the queue or connection fails while a message is being sent, raise an error to the caller and SHALL NOT report the message as sent.

#### Scenario: Queue down

- **GIVEN** an unavailable queue
- **WHEN** a message is sent
- **THEN** the caller receives an error

### Requirement: Transactional send

ID: SWHR8-R-0089
Recovered from: ORDER-APPROVAL-BUSINESS-RULE-0003
The system SHALL perform the send within the caller's transaction, so that the queued message is committed or discarded together with the caller's work.

#### Scenario: Caller rolls back

- **GIVEN** a message sent inside a transaction
- **WHEN** the transaction rolls back
- **THEN** the message is not delivered

### Requirement: Shared asynchronous send

ID: SWHR8-R-0090
Recovered from: ORDER-APPROVAL-INTEGRATION-0001
The system SHALL provide a shared service that accepts a text message (order or approval XML) from any caller and publishes it as one text message to a single configured asynchronous queue.

#### Scenario: Message published

- **GIVEN** a caller with an approval XML message
- **WHEN** it is sent
- **THEN** one text message is placed on the configured queue
