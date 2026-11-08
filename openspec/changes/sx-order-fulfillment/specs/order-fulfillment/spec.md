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

### Requirement: Generated identifiers from named counters

ID: SWHR8-R-0101
Recovered from: FULF-ENT-0002
The system SHALL generate order and purchase-order identifiers from named counters held in the database.

#### Scenario: Generated identifiers from named counters

- **GIVEN** a new order is created
- **WHEN** an identifier is requested
- **THEN** the next value of the named counter for that identifier kind is returned

### Requirement: Inventory quantity per item

ID: SWHR8-R-0102
Recovered from: FULF-ENT-0008
The system SHALL keep one inventory quantity per item.

#### Scenario: Inventory quantity per item

- **GIVEN** an item with a stocked quantity
- **WHEN** a second quantity is recorded for the same item
- **THEN** only one quantity exists for the item

### Requirement: Unstocked line stays unshipped

ID: SWHR8-R-0103
Recovered from: ORD-FUL-BR-0002
GIVEN a purchase order line whose item has no inventory record WHEN fulfilment is attempted THEN the system SHALL treat the line as unavailable, leave it unshipped and leave the order open.

#### Scenario: Unstocked line stays unshipped

- **GIVEN** a line for an item with no inventory record
- **WHEN** fulfilment is attempted
- **THEN** the line stays unshipped and the order stays open

### Requirement: Purchase order intake and immediate fulfilment

ID: SWHR8-R-0104
Recovered from: ORD-FUL-REQ-0001
The system SHALL accept each purchase order message arriving on the supplier purchase-order queue, persist it as a supplier order, and attempt to fulfil it immediately from inventory.

#### Scenario: Purchase order intake and immediate fulfilment

- **GIVEN** a purchase order message on the supplier queue
- **WHEN** it is received
- **THEN** it is stored as a supplier order and fulfilment is attempted at once

### Requirement: Shipped quantity accumulates per line

ID: SWHR8-R-0105
Recovered from: ORDER-FULFILLMENT-BR-0003
The system SHALL, when supplier invoice information arrives for a purchase order, add the shipped quantity to the quantity already shipped on each matching line item (matched by item id).

#### Scenario: Shipped quantity accumulates per line

- **GIVEN** a line with 2 already shipped
- **WHEN** an invoice reports 3 shipped for that item
- **THEN** the line shows 5 shipped

### Requirement: Purchase order fully fulfilled test

ID: SWHR8-R-0106
Recovered from: ORDER-FULFILLMENT-BR-0004
The system SHALL treat a purchase order as completely fulfilled only when, for every line item, quantity ordered equals quantity shipped.

#### Scenario: Purchase order fully fulfilled test

- **GIVEN** an order with two lines, one fully shipped and one partly shipped
- **WHEN** fulfilment is evaluated
- **THEN** the order is not completely fulfilled

### Requirement: Default order date

ID: SWHR8-R-0107
Recovered from: ORDER-FULFILLMENT-BR-0005
GIVEN an incoming supplier order whose date is missing or not in yyyy-MM-dd form, WHEN it is read, the system SHALL substitute the current date and continue.

#### Scenario: Default order date

- **GIVEN** an incoming order with date 'tomorrow'
- **WHEN** it is read
- **THEN** the current date is used and processing continues

### Requirement: New supplier purchase order starts PENDING

ID: SWHR8-R-0108
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0001
The system SHALL create every new supplier purchase order with the id and date taken from the incoming order and the status PENDING.

#### Scenario: New supplier purchase order starts PENDING

- **GIVEN** an incoming order with id 7
- **WHEN** the supplier purchase order is created
- **THEN** it carries id 7, the order date and status PENDING

### Requirement: Inventory record per item

ID: SWHR8-R-0109
Recovered from: ORDER-FULFILLMENT-ENTITY-0010
The system SHALL keep one inventory record per item, identified by item id, holding the quantity on hand, and SHALL allow listing all inventory items.

#### Scenario: Inventory record per item

- **GIVEN** inventory records for several items
- **WHEN** all inventory items are listed
- **THEN** each item appears once with its quantity on hand

### Requirement: Supplier order document

ID: SWHR8-R-0110
Recovered from: ORDER-FULFILLMENT-INTEGRATION-0003
The system SHALL send each supplier order as a SupplierOrder document containing order id, order date (yyyy-MM-dd), a shipping address (first name, last name, street, city, state, country, zip code, email, phone) and line items.

#### Scenario: Supplier order document

- **GIVEN** a purchase order to send to the supplier
- **WHEN** the document is produced
- **THEN** it carries order id, date, shipping address and line items

### Requirement: Line item creation

ID: SWHR8-R-0111
Recovered from: ORDER-FULFILLMENT-REQ-0002
The system SHALL allow a line item to be created either from explicit values or by copying an existing line item's category, product, item, line number, quantity and unit price, and in both cases SHALL set the shipped quantity from the supplied value.

#### Scenario: Line item creation

- **GIVEN** an existing line item
- **WHEN** a new line item is created from it with shipped quantity 0
- **THEN** the copied fields match and shipped quantity is 0

### Requirement: Line item shipped quantity update and snapshot

ID: SWHR8-R-0112
Recovered from: ORDER-FULFILLMENT-REQ-0003
The system SHALL allow the quantity shipped of a line item to be updated after creation, and SHALL expose the line's category, product, item, line number, quantity and unit price as a data snapshot that omits the shipped quantity.

#### Scenario: Line item shipped quantity update and snapshot

- **GIVEN** a line item with 0 shipped
- **WHEN** shipped quantity is set to 4 and a snapshot is taken
- **THEN** the line shows 4 shipped and the snapshot has no shipped quantity

### Requirement: Purchase order deletion cascades

ID: SWHR8-R-0113
Recovered from: ORDER-FULFILLMENT-REQ-0006
The system SHALL delete a purchase order's contact, credit card and line item records when the purchase order is deleted.

#### Scenario: Purchase order deletion cascades

- **GIVEN** a purchase order with contact, card and lines
- **WHEN** it is deleted
- **THEN** its contact, credit card and line items are deleted

### Requirement: Supplier purchase orders found by status

ID: SWHR8-R-0114
Recovered from: ORDER-FULFILLMENT-REQUIREMENT-0001
The system SHALL allow supplier purchase orders to be looked up by status.

#### Scenario: Supplier purchase orders found by status

- **GIVEN** pending and completed supplier orders
- **WHEN** orders are requested by status PENDING
- **THEN** only the pending orders are returned

### Requirement: Purchase order document form

ID: SWHR8-R-0115
Recovered from: ORDER-FULFILLMENT-WF-0007
The system SHALL accept and exchange purchase orders in a document form containing order id, user id, email id, order date, shipping and billing contact, total price, credit card and at least one line item, with a locale attribute defaulting to en_US.

#### Scenario: Purchase order document form

- **GIVEN** a purchase order document with no locale attribute
- **WHEN** it is read
- **THEN** the locale is en_US

### Requirement: Supplier order assembled transactionally

ID: SWHR8-R-0116
Recovered from: ORDER-FULFILLMENT-WORKFLOW-0001
The system SHALL, when creating a supplier purchase order, create a shipping contact record from the order's shipping information and one line item record for each line item of the incoming order, attaching all of them to the purchase order, within one transaction.

#### Scenario: Supplier order assembled transactionally

- **GIVEN** an incoming order with three lines
- **WHEN** the supplier order is created
- **THEN** one contact and three line items are attached in one transaction

### Requirement: Invoice published on topic

ID: SWHR8-R-0117
Recovered from: ORDER-FULFILLMENT-WORKFLOW-0006
The system SHALL publish each invoice as a text message on the order center's invoice topic, using a new connection per message.

#### Scenario: Invoice published on topic

- **GIVEN** two invoices to publish
- **WHEN** they are published
- **THEN** each goes as a text message on its own connection

### Requirement: Line item from data object

ID: SWHR8-R-0118
Recovered from: ORDER-REQ-0001
The system SHALL allow a line item to be created from an existing line item data object plus a separate quantity-shipped value, copying category, product, item, line number, quantity and unit price from the data object.

#### Scenario: Line item from data object

- **GIVEN** a line item data object and a shipped value of 1
- **WHEN** a line item is created
- **THEN** the six fields are copied and shipped quantity is 1

### Requirement: Shipped quantities reported by invoice

ID: SWHR8-R-0119
Recovered from: ORDF-BR-0003
WHEN a supplier invoice reports shipped quantities per item, the system SHALL add each reported quantity to the quantity shipped of the matching line item of the purchase order, and SHALL treat the order as completely fulfilled only if every line item's shipped quantity equals its ordered quantity.

#### Scenario: Shipped quantities reported by invoice

- **GIVEN** an order whose lines are all shipped to their ordered quantity after an invoice
- **WHEN** completeness is evaluated
- **THEN** the order is completely fulfilled

### Requirement: Order status values

ID: SWHR8-R-0120
Recovered from: ORDF-BR-0004
The system SHALL recognise the order statuses PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED as the named values of the order lifecycle.

#### Scenario: Order status values

- **GIVEN** an order
- **WHEN** its status is set
- **THEN** only PENDING, APPROVED, DENIED, SHIPPED_PART or COMPLETED is accepted

### Requirement: Order documents validated against schema

ID: SWHR8-R-0121
Recovered from: ORDFUL-REQ-0008
The system SHALL validate incoming order documents against their published schema, resolving the schema through a catalog that can be overridden by a configured catalog location, and reject a document whose type does not match the expected type.

#### Scenario: Order documents validated against schema

- **GIVEN** a document of the wrong type
- **WHEN** it is validated
- **THEN** it is rejected

### Requirement: Fulfilment output document encoding

ID: SWHR8-R-0122
Recovered from: ORDFUL-RULE-0008
The system SHALL encode all generated business documents in UTF-8 with indentation and a declared document type (DTD mode) or namespace (schema mode).

#### Scenario: Fulfilment output document encoding

- **GIVEN** a generated document
- **WHEN** it is serialised
- **THEN** it is UTF-8, indented and carries its document type or namespace

### Requirement: Fulfil only when stock suffices

ID: SWHR8-R-0123
Recovered from: order-fulfillment-BR-0001
The system SHALL ship a purchase order line only when current stock for the item is at least the line quantity, and on shipping SHALL reduce stock by that quantity; a line with insufficient stock or an unknown item SHALL be left unshipped.

#### Scenario: Fulfil only when stock suffices

- **GIVEN** stock of 5 and a line of 8
- **WHEN** fulfilment is attempted
- **THEN** the line is unshipped and stock stays 5

### Requirement: Skip shipped lines and complete order

ID: SWHR8-R-0124
Recovered from: order-fulfillment-BR-0002
The system SHALL skip lines already fully shipped, mark each newly shipped line fully shipped, and mark the supplier order COMPLETED only when every line was available in this pass.

#### Scenario: Skip shipped lines and complete order

- **GIVEN** an order with one shipped line and one available line
- **WHEN** fulfilment is attempted
- **THEN** the available line ships and the order becomes COMPLETED

### Requirement: Supplier order and line storage

ID: SWHR8-R-0150
Recovered from: FULF-ENT-0001
The system SHALL store supplier orders with status PENDING or COMPLETED and supplier order lines, and SHALL keep supplier stock as one non-negative quantity per item.

#### Scenario: Supplier order and line storage

- **GIVEN** a stock quantity of -1
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Reprocess pending orders after stock update

ID: SWHR8-R-0151
Recovered from: ORD-FUL-WF-0002
The system SHALL, in the same transaction as a stock update, re-process all supplier orders still PENDING and forward the invoices of any that now ship.

#### Scenario: Reprocess pending orders after stock update

- **GIVEN** a pending order and a stock update making it shippable
- **WHEN** stock is updated
- **THEN** the order ships in the same transaction and its invoice is forwarded

### Requirement: Supplier purchase order persistence

ID: SWHR8-R-0152
Recovered from: ORDER-FULFILLMENT-ENTITY-0001
The system SHALL persist each supplier purchase order with a purchase order id, a purchase order date (epoch time), a status, one shipping contact record and a collection of line items.

#### Scenario: Supplier purchase order persistence

- **GIVEN** a supplier purchase order
- **WHEN** it is stored
- **THEN** id, date, status, one contact and its line items are kept

### Requirement: Resource lookup is cached on web tier

ID: SWHR8-R-0153
Recovered from: ORDF-BR-0002
GIVEN the web-tier lookup service WHEN a home, connection factory, queue, topic or data source is requested a second time by the same name THEN the system SHALL return the previously resolved object without a new lookup.

#### Scenario: Resource lookup is cached on web tier

- **GIVEN** a queue already resolved by name
- **WHEN** it is requested again
- **THEN** the earlier object is returned with no new lookup

### Requirement: Named resource lookup

ID: SWHR8-R-0154
Recovered from: ORDF-INT-0001
The system SHALL resolve named infrastructure resources (local and remote component homes, message queues and topics with their connection factories, data sources, and URL, boolean and string configuration entries) by name through a central lookup service rather than each caller locating them itself.

#### Scenario: Named resource lookup

- **GIVEN** a caller needing the order queue
- **WHEN** it asks the lookup service by name
- **THEN** the resource is returned

### Requirement: Pluggable transition delegates

ID: SWHR8-R-0211
Recovered from: OAPP-INT-0001
The system SHALL support pluggable transition delegates, instantiated by class name, that receive an XML message or batch of XML messages and perform a workflow transition, reporting failure as a transition error.

#### Scenario: Pluggable transition delegates

- **GIVEN** a delegate named by class
- **WHEN** a message arrives and the delegate fails
- **THEN** a transition error is reported

### Requirement: Supplier order document namespace

ID: SWHR8-R-0212
Recovered from: ORDFUL-WORKFLOW-0004
The system SHALL send the supplier order document with order id, order date, a shipping address (first/last name, street, city, state, country, zip) and at least one line item, in a namespaced form (supplier order namespace) when produced by the third-party-adapter editor.

#### Scenario: Supplier order document namespace

- **GIVEN** an order produced by the adapter editor
- **WHEN** it is sent
- **THEN** it carries the supplier order namespace

### Requirement: Order line record

ID: SWHR8-R-0213
Recovered from: FULF-ENT-0007
The system SHALL record each purchase order line by order and line number, with category, product, item, quantity, unit price and quantity shipped all mandatory.

#### Scenario: Order line record

- **GIVEN** a line without a unit price
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Ship line in full from stock

ID: SWHR8-R-0214
Recovered from: ORD-FUL-BR-0001
The system SHALL ship a purchase order line only when the stock held for its item is at least the line quantity, SHALL deduct the line quantity from stock on shipping, and SHALL mark the line fully shipped; lines already fully shipped SHALL be skipped.

#### Scenario: Ship line in full from stock

- **GIVEN** stock of 10 and a line of 4
- **WHEN** fulfilment is attempted
- **THEN** stock becomes 6 and the line is marked fully shipped

### Requirement: Inventory update restricted to administrators

ID: SWHR8-R-0215
Recovered from: ORD-FUL-REQ-0003
The system SHALL restrict the supplier inventory update to users in the administrator role, authenticated by a form login.

#### Scenario: Inventory update restricted to administrators

- **GIVEN** a user without the administrator role
- **WHEN** they open the inventory update
- **THEN** access is refused

### Requirement: Invoice content

ID: SWHR8-R-0216
Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0005
The system SHALL build each invoice with only the lines shipped in the current attempt, carrying the order id, order date, today's date as shipping date, per-line category, product, item, line number, quantity and unit price, and the fixed customer label "Dear PetStore Customer".

#### Scenario: Invoice content

- **GIVEN** an order with one line shipped now
- **WHEN** the invoice is built
- **THEN** it lists that line only and the label Dear PetStore Customer

### Requirement: Line item fields in documents

ID: SWHR8-R-0217
Recovered from: ORDFUL-REQ-0006
The system SHALL describe each line item in supplier orders and invoices with category, product, item, line number, quantity and unit price.

#### Scenario: Line item fields in documents

- **GIVEN** a line item
- **WHEN** it appears in a supplier order or invoice
- **THEN** it carries the six fields

### Requirement: Supplier order completion and invoice

ID: SWHR8-R-0022
Recovered from: ORD-FUL-BR-0003
The system SHALL mark a supplier order COMPLETED only when every one of its lines is available and shipped, and SHALL issue an invoice listing only the lines shipped in the current attempt; if no line shipped, no invoice SHALL be produced.

#### Scenario: Supplier order completion and invoice

- **GIVEN** an order where no line can ship
- **WHEN** fulfilment is attempted
- **THEN** no invoice is produced and the order stays PENDING

### Requirement: Invoice document

ID: SWHR8-R-0023
Recovered from: ORDER-FULFILLMENT-INTEGRATION-0004
The system SHALL report invoices back to the order center as an Invoice document containing order id, user id, order date, shipping date and line items.

#### Scenario: Invoice document

- **GIVEN** a shipped line
- **WHEN** the invoice is reported
- **THEN** the Invoice document carries order id, user id, order date, shipping date and line items
