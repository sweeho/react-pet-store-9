## ADDED Requirements

### Requirement: Mail request consumption

Recovered from: ORDER-NOTIFICATIONS-INT-0001

The system SHALL consume mail requests from a message queue, each request being an XML document with exactly the elements Address, Subject and Content in that order, and SHALL send one e-mail per request.

#### Scenario: Mail request consumption

- **GIVEN** a mail request with Address, Subject and Content
- **WHEN** the request is consumed from the queue
- **THEN** one e-mail is sent for it

### Requirement: Mail format and sender

Recovered from: ORDER-NOTIFICATIONS-REQ-0002

The system SHALL send each mail as an HTML message to the requested recipient address(es) with the requested subject, the configured sender address and the current time as sent date.

#### Scenario: Mail format and sender

- **GIVEN** a valid mail request
- **WHEN** the mail is sent
- **THEN** it is an HTML message with the requested subject, the configured sender and the current date

### Requirement: Delivery failure is discarded

Recovered from: ORDER-NOTIFICATIONS-BR-0003

The system SHALL log a delivery failure and discard the request without retry and without raising an error to the queue or failing the originating order processing.

#### Scenario: Delivery failure is discarded

- **GIVEN** no mail server is configured or transport fails
- **WHEN** a mail request is processed
- **THEN** the failure is logged, the request is discarded and no error is raised

### Requirement: Malformed request is an error

Recovered from: ORDER-NOTIFICATIONS-BR-0004

The system SHALL raise a processing error for a mail request that is malformed, fails DTD validation or cannot be read, and MUST NOT send mail for it.

#### Scenario: Malformed request is an error

- **GIVEN** a queued request that fails validation
- **WHEN** it is processed
- **THEN** a processing error is raised and no mail is sent

### Requirement: Notifications enabled by administrator

Recovered from: ORDER-NOTIFICATIONS-BR-0005

The system SHALL send order-status e-mails only when an administrator has enabled the corresponding notification; they are disabled by default.

#### Scenario: Notifications enabled by administrator

- **GIVEN** notifications have not been enabled
- **WHEN** an order changes status
- **THEN** no e-mail is sent

### Requirement: Mail document structure

Recovered from: ORDER-NOTIFICATIONS-INTEGRATION-0005

The system SHALL represent a customer notification mail as a Mail document with an Address, a Subject and a Content, in that order.

#### Scenario: Mail document structure

- **GIVEN** a notification to be sent
- **WHEN** the mail document is built
- **THEN** it contains Address, Subject and Content in that order

### Requirement: Outgoing mail document

Recovered from: ORDNOT-WORKFLOW-0007

The system SHALL represent each outgoing customer mail as a document with an address, a subject and content.

#### Scenario: Outgoing mail document

- **GIVEN** an outgoing customer mail
- **WHEN** it is represented
- **THEN** it has an address, a subject and content

### Requirement: Mail message composition

Recovered from: ORDNOT-REQ-0007

The system SHALL represent an outgoing mail message as a document with exactly an address, a subject and a content body.

#### Scenario: Mail message composition

- **GIVEN** an outgoing mail message
- **WHEN** it is composed
- **THEN** it carries exactly an address, a subject and a content body

### Requirement: Per-notification enablement setting

Recovered from: ORDNOT-RULE-0001

The system SHALL send order-status, shipment and completed-order e-mails only when the corresponding notification setting (approval, confirmation, completed) is enabled; all three are disabled by default.

#### Scenario: Per-notification enablement setting

- **GIVEN** the approval setting is disabled
- **WHEN** an order is approved
- **THEN** no approval e-mail is sent

### Requirement: Status e-mail subject, recipient and language

Recovered from: ORDNOT-RULE-0002

The system SHALL e-mail the customer when an order is approved or denied with subject "Java Pet Store Order Status: <order id>", on shipment with "Java Pet Store Order Shipped: <order id>" and on completion with "Java Pet Store Order COMPLETED: <order id>", addressed to the e-mail on the purchase order and rendered from a locale-specific template.

#### Scenario: Status e-mail subject, recipient and language

- **GIVEN** approval notifications are enabled and an order is approved
- **WHEN** the e-mail is generated
- **THEN** its subject is "Java Pet Store Order Status: <order id>", it goes to the purchase-order e-mail and the body uses the customer's locale template

### Requirement: Bill-to e-mail recorded on order

Recovered from: ON-REQ-0001

The system SHALL record the bill-to e-mail on each order and show it in the order confirmation, so that order-status mail can be addressed to it when notifications are enabled.

#### Scenario: Bill-to e-mail recorded on order

- **GIVEN** an order placed with a bill-to e-mail
- **WHEN** the order is created
- **THEN** the e-mail is stored on the order and shown in the confirmation

### Requirement: Default configuration sends no mail

Recovered from: ORN-BR-0001

The system SHALL NOT send the received, approved or completed mail under the default configuration.

#### Scenario: Default configuration sends no mail

- **GIVEN** the default configuration
- **WHEN** an order is received, approved or completed
- **THEN** the corresponding mail is not sent

### Requirement: Asynchronous message hand-over

Recovered from: ONOT-INT-0001

The system SHALL accept a text message from a caller and place it unchanged on a configured asynchronous queue as a single text message for later processing.

#### Scenario: Asynchronous message hand-over

- **GIVEN** a caller submits a text message
- **WHEN** the sender is invoked
- **THEN** the message is queued unchanged as one text message

### Requirement: Queueing failure reported to caller

Recovered from: ONOT-RULE-0002

The system SHALL raise a failure to the caller when the queue or connection factory cannot be located or sending fails, rather than dropping the message silently, and SHALL close the queue connection in every case.

#### Scenario: Queueing failure reported to caller

- **GIVEN** the queue cannot be reached
- **WHEN** a message is submitted
- **THEN** a failure is raised to the caller and the connection is closed

### Requirement: Transactional, unrestricted sender

Recovered from: ONOT-RULE-0003

The system SHALL send each message within a required transaction, joining the caller's transaction when one exists, and SHALL allow any caller to invoke the sender without role restriction.

#### Scenario: Transactional, unrestricted sender

- **GIVEN** a caller within a transaction
- **WHEN** it submits a message
- **THEN** the send joins that transaction and no role check is applied

### Requirement: Notification gating by administrator settings

Recovered from: ORDNOT-REQ-0001

The system SHALL send customer e-mail for order approval/denial, shipment and completion only when the corresponding administrator setting (approval, confirmation, completed-order) is enabled.

#### Scenario: Notification gating by administrator settings

- **GIVEN** the completed-order setting is disabled
- **WHEN** an order completes
- **THEN** no completion e-mail is sent

### Requirement: Notification addressing and subject

Recovered from: ORDNOT-REQ-0002

The system SHALL address each notification to the e-mail on the stored order, with the subject naming the order id and its stage (status, shipped, COMPLETED), and the body formatted by a locale-specific stylesheet.

#### Scenario: Notification addressing and subject

- **GIVEN** a shipment notification is enabled and an order ships
- **WHEN** the e-mail is generated
- **THEN** it goes to the order e-mail with subject "Java Pet Store Order Shipped: <orderId>" and a locale-formatted body

### Requirement: Three independent default-off switches

Recovered from: ORDER-NOTIFICATIONS-REQUIREMENT-0001

The system SHALL by default send no mail on order receipt, approval or completion, and each of the three mails SHALL be switchable on independently.

#### Scenario: Three independent default-off switches

- **GIVEN** only the approval mail is enabled
- **WHEN** orders are received, approved and completed
- **THEN** only the approval mail is sent
