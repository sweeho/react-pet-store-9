## ADDED Requirements

### Requirement: Stock clerk sets inventory quantity

ID: SWHR8-R-0009
Recovered from: ORD-FUL-REQ-0002
The system SHALL let a stock clerk set the quantity of any inventory item to a new value of zero or more; blank or negative entries SHALL be ignored.

#### Scenario: Stock clerk sets inventory quantity

- **GIVEN** a stock clerk updating item quantities
- **WHEN** a quantity of 10 is entered for one item and a negative value for another
- **THEN** the first item is set to 10 and the second is left unchanged

### Requirement: Forward invoices to the order center

ID: SWHR8-R-0016
Recovered from: ORD-FUL-WF-0001
The system SHALL, after the invoice is produced, forward each invoice to the order center; GIVEN no invoice was produced WHEN a purchase order is received THEN nothing SHALL be forwarded and the order SHALL wait for a later stock update.

#### Scenario: Forward invoices to the order center

- **GIVEN** a purchase order for which no line can ship
- **WHEN** the order is processed
- **THEN** no invoice is forwarded and the order waits for a later stock update

### Requirement: Supplier order table constraints

ID: SWHR8-R-0013
Recovered from: ORDF-ENT-0001
The system SHALL record each supplier purchase order with a unique id, date, mandatory status and a reference to an existing contact.

#### Scenario: Supplier order table constraints

- **GIVEN** a supplier order referencing a missing contact
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Supplier order lines belong to an order

ID: SWHR8-R-0014
Recovered from: ORDF-ENT-0002
The system SHALL record supplier order lines numbered within a supplier order, each with product reference, quantity, unit price and quantity shipped, and SHALL require each line to belong to an existing supplier order.

#### Scenario: Supplier order lines belong to an order

- **GIVEN** a line for a non-existent supplier order
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Ship a line in full or not at all

ID: SWHR8-R-0010
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0002
The system SHALL ship a purchase-order line only when the inventory quantity for that item is at least the line quantity, and SHALL then reduce inventory by that quantity and mark the line fully shipped; lines already fully shipped SHALL be skipped.

#### Scenario: Ship a line in full or not at all

- **GIVEN** a line of 5 units and inventory of 4
- **WHEN** fulfilment is attempted
- **THEN** the line is not shipped and inventory is unchanged; no partial shipment occurs

### Requirement: Unstocked item left unshipped without error

ID: SWHR8-R-0011
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0003
The system SHALL, for a purchase order line for an item with no inventory record, treat the line as not available and leave it unshipped, without raising an error.

#### Scenario: Unstocked item left unshipped without error

- **GIVEN** a line for an item with no inventory record
- **WHEN** fulfilment is attempted
- **THEN** the line stays unshipped and no error is raised

### Requirement: Accept supplier order document

ID: SWHR8-R-0012
Recovered from: ORDER-FULFILLMENT-INTEGRATION-0001
The system SHALL accept a supplier order document containing order id, order date, shipping contact information and one or more line items.

#### Scenario: Accept supplier order document

- **GIVEN** a supplier order document with id, date, contact and one line
- **WHEN** it is received
- **THEN** it is accepted

### Requirement: Completion on invoice receipt

ID: SWHR8-R-0017
Recovered from: ORDFUL-RULE-0001
The system SHALL, on receiving a supplier invoice, mark the shipped line items on the purchase order and set the order status to COMPLETED if every line is shipped, otherwise to SHIPPED_PART; only a completed order SHALL trigger a completed-order notification message.

#### Scenario: Completion on invoice receipt

- **GIVEN** an invoice shipping only some lines
- **WHEN** it is received
- **THEN** the order becomes SHIPPED_PART and no completed-order notification is sent

### Requirement: Send supplier purchase order for approved orders

ID: SWHR8-R-0018
Recovered from: ORDFUL-WORKFLOW-0001
The system SHALL, for each newly APPROVED order, build a supplier purchase order (order id, date, shipping contact and address, and every line item with category, product, item, line number, quantity and unit price) and send it to the supplier purchase-order queue.

#### Scenario: Send supplier purchase order for approved orders

- **GIVEN** a newly approved order
- **WHEN** it is detected
- **THEN** a supplier purchase order is sent to the supplier purchase-order queue
