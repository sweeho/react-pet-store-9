## ADDED Requirements

### Requirement: Bill-to e-mail recorded on the order

ID: SWHR8-R-0125
Recovered from: ON-REQ-0001
The system SHALL record the bill-to e-mail on each order and show it in the order confirmation, so that order-status mail can be addressed to it when notifications are enabled.

#### Scenario: Order placed with a bill-to e-mail

- **GIVEN** a customer placing an order with a bill-to e-mail address
- **WHEN** the order is accepted
- **THEN** the e-mail is stored on the order and shown in the order confirmation

### Requirement: Failed delivery is discarded

ID: SWHR8-R-0155
Recovered from: ORDER-NOTIFICATIONS-BR-0003
The system SHALL log a mail delivery failure (mail session lookup or transport failure) and discard the request without retry and without failing the originating order processing or raising an error to the queue.

#### Scenario: No mail server configured

- **GIVEN** a queued mail request and no usable mail server
- **WHEN** the request is processed
- **THEN** the failure is logged, the message is consumed, and no retry or error is raised

### Requirement: Malformed mail request is an error

ID: SWHR8-R-0126
Recovered from: ORDER-NOTIFICATIONS-BR-0004
The system SHALL treat a mail request that is malformed, fails DTD validation or cannot be read from the queue as a processing error, so that the message is not treated as successfully handled and no mail is sent.

#### Scenario: Request fails validation

- **GIVEN** a queued mail request that violates the Mail DTD
- **WHEN** it is processed
- **THEN** a processing error is raised and no mail is sent

### Requirement: Notifications disabled by default

ID: SWHR8-R-0127
Recovered from: ORDER-NOTIFICATIONS-BR-0005
The system SHALL send order-status mails only when the administrator has enabled the corresponding notification (approval, confirmation, completion), all of which are disabled by default.

#### Scenario: Notification not enabled

- **GIVEN** the default configuration
- **WHEN** an order event occurs
- **THEN** no order-status mail is sent

### Requirement: Mail request queue contract

ID: SWHR8-R-0156
Recovered from: ORDER-NOTIFICATIONS-INT-0001
The system SHALL consume mail requests from a message queue, each request being an XML document with exactly the elements Address, Subject and Content in that order, validated against the Mail DTD, and SHALL send one e-mail per request.

#### Scenario: Valid request consumed

- **GIVEN** a queued request with Address, Subject and Content in order
- **WHEN** it is processed
- **THEN** one e-mail is sent for it

### Requirement: Mail document structure

ID: SWHR8-R-0218
Recovered from: ORDER-NOTIFICATIONS-INTEGRATION-0005
The system SHALL represent a customer notification mail as a Mail document with an Address, a Subject and a Content, in that order.

#### Scenario: Elements out of order

- **GIVEN** a Mail document whose Subject precedes its Address
- **WHEN** it is validated
- **THEN** it is rejected as invalid

### Requirement: HTML mail delivery

ID: SWHR8-R-0128
Recovered from: ORDER-NOTIFICATIONS-REQ-0002
The system SHALL send each notification as an HTML message to the recipient address(es) given, with the supplied subject, the current time as sent date and the sender address configured for the mail service.

#### Scenario: Multiple recipients

- **GIVEN** a request with a comma-separated list of addresses
- **WHEN** the mail is sent
- **THEN** it is sent as text/html to each address from the configured sender with the given subject

### Requirement: Order-status mail gated by setting

ID: SWHR8-R-0129
Recovered from: ORDNOT-RULE-0001
The system SHALL send order-status, shipment and completed-order e-mails only when the corresponding notification setting (approval, confirmation, completed) is enabled; all three are disabled by default.

#### Scenario: Completed-order setting disabled

- **GIVEN** the completed-order notification setting is disabled
- **WHEN** an order is completed
- **THEN** no completion e-mail is sent

### Requirement: Order-status mail subjects and templates

ID: SWHR8-R-0157
Recovered from: ORDNOT-RULE-0002
The system SHALL e-mail the customer for each order whose status changed to approved or denied with subject "Java Pet Store Order Status: <order id>", shipment e-mails with subject "Java Pet Store Order Shipped: <order id>", and completion e-mails with subject "Java Pet Store Order COMPLETED: <order id>", addressed to the e-mail on the purchase order and rendered from a locale-specific template.

#### Scenario: Order approved

- **GIVEN** approval notifications are enabled and an approved order with locale en_US
- **WHEN** the status change is processed
- **THEN** an e-mail with subject "Java Pet Store Order Status: <order id>" is sent to the purchase-order e-mail, rendered from the en_US template

### Requirement: Default configuration sends no order mail

ID: SWHR8-R-0130
Recovered from: ORN-BR-0001
The system SHALL NOT send the confirmation, approval or completion mail when the default configuration is in effect.

#### Scenario: Default configuration

- **GIVEN** the default configuration
- **WHEN** an order is received, approved or completed
- **THEN** the corresponding mail is not sent
