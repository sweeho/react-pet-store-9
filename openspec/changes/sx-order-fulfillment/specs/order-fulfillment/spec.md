## ADDED Requirements

### Requirement: Ship a line only with sufficient stock

Recovered from: ORD-FUL-BR-0001
The system SHALL ship a purchase order line only when the stock held for its item is at least the line quantity, SHALL deduct the line quantity from stock on shipping, and SHALL mark the line fully shipped; lines already fully shipped SHALL be skipped.

#### Scenario: Ship a line only with sufficient stock

- **GIVEN** an order line of 5 units and stock of 5 for its item
- **WHEN** fulfilment is attempted
- **THEN** stock becomes 0, the line is marked fully shipped, and a second attempt skips the line

### Requirement: Line for an unstocked item is unavailable

Recovered from: ORD-FUL-BR-0002
The system SHALL treat a line whose item has no inventory record as unavailable, leave it unshipped and leave the order open.

#### Scenario: Line for an unstocked item is unavailable

- **GIVEN** a purchase order line whose item has no inventory record
- **WHEN** fulfilment is attempted
- **THEN** the line stays unshipped, no error is raised and the order stays open

### Requirement: Order completion and invoice contents

Recovered from: ORD-FUL-BR-0003
The system SHALL mark a supplier order COMPLETED only when every one of its lines is available and shipped, and SHALL issue an invoice listing only the lines shipped in the current attempt; if no line shipped, no invoice SHALL be produced.

#### Scenario: Order completion and invoice contents

- **GIVEN** an order of two lines where only one has stock
- **WHEN** fulfilment is attempted
- **THEN** the order is not COMPLETED and an invoice lists only the shipped line

### Requirement: Accept purchase orders from the queue

Recovered from: ORD-FUL-REQ-0001
The system SHALL accept each purchase order message arriving on the supplier purchase-order queue, persist it as a supplier order, and attempt to fulfil it immediately from inventory.

#### Scenario: Accept purchase orders from the queue

- **GIVEN** a purchase order message on the supplier purchase-order queue
- **WHEN** it is received
- **THEN** a supplier order is persisted and fulfilment is attempted at once

### Requirement: Stock clerk sets inventory quantity

ID: SWHR8-R-0009
Recovered from: ORD-FUL-REQ-0002
The system SHALL let a stock clerk set the quantity of any inventory item to a new value of zero or more; blank or negative entries SHALL be ignored.

#### Scenario: Stock clerk sets inventory quantity

- **GIVEN** a stock clerk updating item quantities
- **WHEN** a quantity of 10 is entered for one item and a negative value for another
- **THEN** the first item is set to 10 and the second is left unchanged

### Requirement: Inventory update restricted to administrators

Recovered from: ORD-FUL-REQ-0003
The system SHALL restrict the supplier inventory update to users in the administrator role, authenticated by a form login.

#### Scenario: Inventory update restricted to administrators

- **GIVEN** a user without the administrator role
- **WHEN** the user requests the inventory update
- **THEN** access is denied and a login is required

### Requirement: Forward invoices to the order center

ID: SWHR8-R-0016
Recovered from: ORD-FUL-WF-0001
The system SHALL, after the invoice is produced, forward each invoice to the order center; GIVEN no invoice was produced WHEN a purchase order is received THEN nothing SHALL be forwarded and the order SHALL wait for a later stock update.

#### Scenario: Forward invoices to the order center

- **GIVEN** a purchase order for which no line can ship
- **WHEN** the order is processed
- **THEN** no invoice is forwarded and the order waits for a later stock update

### Requirement: Reprocess pending orders on stock update

Recovered from: ORD-FUL-WF-0002
The system SHALL, in the same transaction as a stock update, re-process all supplier orders still PENDING and forward the invoices of any that now ship.

#### Scenario: Reprocess pending orders on stock update

- **GIVEN** a PENDING order and a stock update that makes it shippable
- **WHEN** the stock is updated
- **THEN** the order is re-processed in the same transaction and its invoice is forwarded

### Requirement: Supplier order and stock storage

Recovered from: FULF-ENT-0001
The system SHALL store supplier orders with status PENDING or COMPLETED and supplier order lines, and SHALL keep supplier stock as one non-negative quantity per item.

#### Scenario: Supplier order and stock storage

- **GIVEN** a supplier order and a stock quantity
- **WHEN** they are stored
- **THEN** status is PENDING or COMPLETED and stock is never negative

### Requirement: Named identifier counters

Recovered from: FULF-ENT-0002
The system SHALL generate order and purchase-order identifiers from named counters held in the database.

#### Scenario: Named identifier counters

- **GIVEN** a new order is created
- **WHEN** an identifier is needed
- **THEN** it is drawn from a named persisted counter

### Requirement: Purchase order line columns

Recovered from: FULF-ENT-0007
The system SHALL record each purchase order line by order and line number, with category, product, item, quantity, unit price and quantity shipped all mandatory.

#### Scenario: Purchase order line columns

- **GIVEN** a purchase order line missing its quantity shipped
- **WHEN** it is stored
- **THEN** the store rejects it

### Requirement: Inventory quantity per item

Recovered from: FULF-ENT-0008
The system SHALL keep one inventory quantity per item.

#### Scenario: Inventory quantity per item

- **GIVEN** an item with an inventory record
- **WHEN** a second record for the item is stored
- **THEN** it is rejected because item id is the key

### Requirement: Purchase order line with two-decimal price

Recovered from: FULFILL-ENT-0006
The system SHALL store each purchase order line with a line number, category, product, item, quantity, unit price (2 decimals) and quantity shipped, all mandatory, and each line SHALL belong to an existing purchase order.

#### Scenario: Purchase order line with two-decimal price

- **GIVEN** a line referencing a non-existent purchase order
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Mandatory inventory quantity

Recovered from: FULFILL-REQ-0008
The system SHALL hold one inventory quantity per item, mandatory.

#### Scenario: Mandatory inventory quantity

- **GIVEN** an inventory record without a quantity
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Supplier order status and stock constraints

Recovered from: ORDB-ENT-0010
The system SHALL record supplier orders with status PENDING or COMPLETED only, each with lines, and SHALL hold supplier stock per item as a quantity that is never negative.

#### Scenario: Supplier order status and stock constraints

- **GIVEN** a supplier order with status SHIPPED
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Database-held identifier counters

Recovered from: ORDB-ENT-0011
The system SHALL generate order and purchase-order identifiers from named counters persisted in the database.

#### Scenario: Database-held identifier counters

- **GIVEN** two consecutive identifier requests
- **WHEN** they are served
- **THEN** distinct increasing identifiers are returned from the persisted counter

### Requirement: Supplier purchase order record

Recovered from: ORDER-FULFILLMENT-ENTITY-0001
The system SHALL persist each supplier purchase order with a purchase order id, a purchase order date (stored as epoch time), a status, one shipping contact record and a collection of line items.

#### Scenario: Supplier purchase order record

- **GIVEN** a supplier purchase order
- **WHEN** it is persisted
- **THEN** id, date, status, one shipping contact and its line items are stored

### Requirement: Supplier order line identity

Recovered from: ORDER-FULFILLMENT-ENTITY-0002
The system SHALL record each supplier order line identified by order id and line number, with category, product, item, ordered quantity, unit price and shipped quantity all mandatory, and SHALL require the order to exist.

#### Scenario: Supplier order line identity

- **GIVEN** a line whose order does not exist
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Inventory record per item

Recovered from: ORDER-FULFILLMENT-ENTITY-0010
The system SHALL keep one inventory record per item, identified by item id, holding the quantity on hand, and SHALL allow listing all inventory items.

#### Scenario: Inventory record per item

- **GIVEN** several inventory items
- **WHEN** the inventory is listed
- **THEN** each item appears once with its quantity on hand

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

### Requirement: New supplier order starts pending

Recovered from: ORDER-FULFILLMENT-BR-0001
The system SHALL, when a supplier purchase order is created, set its id and date from the incoming order and set its status to PENDING.

#### Scenario: New supplier order starts pending

- **GIVEN** an incoming order with id 42
- **WHEN** a supplier order is created
- **THEN** it has id 42, the incoming date and status PENDING

### Requirement: Create contact and lines with the order

Recovered from: ORDER-FULFILLMENT-BR-0002
The system SHALL, when a supplier purchase order is created, create a shipping contact record from the order's shipping information and a line item record for every line item in the order, attaching them to the purchase order; IF a required lookup fails, the creation SHALL fail.

#### Scenario: Create contact and lines with the order

- **GIVEN** an incoming order with three lines
- **WHEN** it is created
- **THEN** a contact and three line items are attached to it; if a lookup fails no order is created

### Requirement: Find by status; cascade delete

Recovered from: ORDER-FULFILLMENT-BR-0003
The system SHALL allow supplier purchase orders to be found by status, and SHALL delete a purchase order's contact record and line items when the purchase order is deleted.

#### Scenario: Find by status; cascade delete

- **GIVEN** a purchase order with a contact and lines
- **WHEN** it is deleted
- **THEN** the contact and all lines are deleted too, and it can no longer be found by status

### Requirement: Order status progression

Recovered from: ORDER-FULFILLMENT-BR-0004
The system SHALL track a purchase order status as one of PENDING, APPROVED, DENIED or COMPLETED, progressing PENDING to APPROVED to COMPLETED or PENDING to DENIED.

#### Scenario: Order status progression

- **GIVEN** a PENDING order
- **WHEN** it is approved and then completed
- **THEN** its status moves PENDING, APPROVED, COMPLETED

### Requirement: Default date for malformed order date

Recovered from: ORDER-FULFILLMENT-BR-0005
The system SHALL substitute the current date and continue when an incoming supplier order date is missing or not in yyyy-MM-dd form.

#### Scenario: Default date for malformed order date

- **GIVEN** an incoming supplier order with date "03/04/2001"
- **WHEN** it is read
- **THEN** the current date is used and processing continues

### Requirement: Structural message validation only

Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0001
The system SHALL validate purchase order, invoice, order approval and supplier order XML messages against the structural check, and SHALL NOT validate them against XSD schemas.

#### Scenario: Structural message validation only

- **GIVEN** a supplier order XML message
- **WHEN** it is validated
- **THEN** the structural check is applied and no XSD validation is performed

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

### Requirement: Complete only if every line fulfilled

Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0004
The system SHALL set a purchase order's status to COMPLETED only when every line could be fulfilled in the current attempt; otherwise the order SHALL keep its prior status (pending) so it can be retried when inventory arrives.

#### Scenario: Complete only if every line fulfilled

- **GIVEN** an order where one line lacks stock
- **WHEN** fulfilment is attempted
- **THEN** the order stays pending

### Requirement: Invoice contents

Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0005
The system SHALL build each invoice with only the lines shipped in the current attempt, carrying the order id, order date, today's date as shipping date, per-line category, product, item, line number, quantity and unit price, and the fixed customer label "Dear PetStore Customer".

#### Scenario: Invoice contents

- **GIVEN** an attempt that shipped two of three lines
- **WHEN** the invoice is built
- **THEN** it lists two lines, today as shipping date and the fixed customer label

### Requirement: Accept only non-negative integer quantities

Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0008
The system SHALL accept an entered inventory quantity only when it is a non-negative integer, and SHALL ignore negative values and empty entries.

#### Scenario: Accept only non-negative integer quantities

- **GIVEN** entries of "", "-3" and "7"
- **WHEN** they are submitted
- **THEN** only 7 is applied

### Requirement: Inventory screen administrator-only, form login

Recovered from: ORDER-FULFILLMENT-BUSINESS-RULE-0009
The system SHALL restrict the supplier inventory update screen to users holding the administrator role, using form login, and SHALL not require an encrypted transport.

#### Scenario: Inventory screen administrator-only, form login

- **GIVEN** an unauthenticated user
- **WHEN** the inventory update screen is requested
- **THEN** a form login is presented and only administrators are admitted

### Requirement: Supplier order XML document (DTD)

Recovered from: ORDER-FULFILLMENT-INT-0001
The system SHALL exchange a supplier order as an XML document containing OrderId, OrderDate (yyyy-MM-dd), ShippingInfo with contact information, and one or more line items, validated against the SupplierOrder DTD.

#### Scenario: Supplier order XML document (DTD)

- **GIVEN** a supplier order document with no line item
- **WHEN** it is validated
- **THEN** it is rejected

### Requirement: Accept supplier order document

ID: SWHR8-R-0012
Recovered from: ORDER-FULFILLMENT-INTEGRATION-0001
The system SHALL accept a supplier order document containing order id, order date, shipping contact information and one or more line items.

#### Scenario: Accept supplier order document

- **GIVEN** a supplier order document with id, date, contact and one line
- **WHEN** it is received
- **THEN** it is accepted

### Requirement: Send supplier order document

Recovered from: ORDER-FULFILLMENT-INTEGRATION-0003
The system SHALL send each supplier order as a SupplierOrder document containing order id, order date (yyyy-MM-dd), a shipping address (first name, last name, street, city, state, country, zip code, email, phone) and line items.

#### Scenario: Send supplier order document

- **GIVEN** an approved order
- **WHEN** it is sent to the supplier
- **THEN** the document carries id, date, full shipping address and lines

### Requirement: Report invoices to the order center

Recovered from: ORDER-FULFILLMENT-INTEGRATION-0004
The system SHALL report invoices back to the order center as an Invoice document containing order id, user id, order date, shipping date and line items.

#### Scenario: Report invoices to the order center

- **GIVEN** a shipment
- **WHEN** the invoice is reported
- **THEN** the document carries order id, user id, order date, shipping date and lines

### Requirement: Pluggable transition delegates

Recovered from: OAPP-INT-0001
The system SHALL support pluggable transition delegates, instantiated by class name, that receive an XML message or batch of XML messages and perform a workflow transition, reporting failure as a transition error.

#### Scenario: Pluggable transition delegates

- **GIVEN** a delegate class name that cannot be loaded
- **WHEN** a transition is requested
- **THEN** a transition error is reported

### Requirement: Resolve named resources via one locator

Recovered from: ORDER-FULFILLMENT-REQ-0001
The system SHALL resolve named infrastructure resources (EJB local and remote homes, JMS queue and topic connection factories, queues, topics, data sources, URL, boolean and string environment entries) by name from the naming service through a single lookup component.

#### Scenario: Resolve named resources via one locator

- **GIVEN** a request for a queue by name
- **WHEN** the locator is asked
- **THEN** the named queue is resolved from the naming service

### Requirement: Create line item from values or copy

Recovered from: ORDER-FULFILLMENT-REQ-0002
The system SHALL allow a line item to be created either from explicit values or by copying an existing line item's category, product, item, line number, quantity and unit price, and in both cases SHALL set the shipped quantity from the supplied value.

#### Scenario: Create line item from values or copy

- **GIVEN** an existing line item and a shipped value of 2
- **WHEN** a copy is created
- **THEN** it has the same product data and shipped quantity 2

### Requirement: Update shipped quantity; data snapshot

Recovered from: ORDER-FULFILLMENT-REQ-0003
The system SHALL allow the quantity shipped of a line item to be updated after creation, and SHALL expose the line's category, product, item, line number, quantity and unit price as a data snapshot that omits the shipped quantity.

#### Scenario: Update shipped quantity; data snapshot

- **GIVEN** a line item with shipped quantity 0
- **WHEN** shipped is updated to 3 and a snapshot is taken
- **THEN** shipped is 3 and the snapshot has no shipped quantity

### Requirement: Line item XML element order

Recovered from: ORDER-FULFILLMENT-REQ-0004
The system SHALL exchange a line item in XML as an element containing category id, product id, item id, line number, quantity and unit price, in that order.

#### Scenario: Line item XML element order

- **GIVEN** a line item
- **WHEN** it is serialised to XML
- **THEN** the six child elements appear in that order

### Requirement: Purchase order cascade delete

Recovered from: ORDER-FULFILLMENT-REQ-0006
The system SHALL delete a purchase order's contact, credit card and line item records when the purchase order is deleted.

#### Scenario: Purchase order cascade delete

- **GIVEN** a purchase order with contact, card and lines
- **WHEN** it is deleted
- **THEN** all dependent records are deleted

### Requirement: Queues and topic between participants

Recovered from: ORDER-FULFILLMENT-REQUIREMENT-0001
The system SHALL pass orders between the storefront, order processing center, supplier and admin through the queues jms/opc/OrderQueue, jms/opc/OrderApprovalQueue, jms/supplier/PurchaseOrderQueue and jms/opc/MailQueue, and invoices through the topic jms/opc/InvoiceTopic.

#### Scenario: Queues and topic between participants

- **GIVEN** a supplier invoice
- **WHEN** it is published
- **THEN** it is sent on the topic jms/opc/InvoiceTopic

### Requirement: Purchase order document form

Recovered from: ORDER-FULFILLMENT-WF-0007
The system SHALL accept and exchange purchase orders in a document form containing order id, user id, email id, order date, shipping and billing contact, total price, credit card and at least one line item, with a locale attribute defaulting to en_US.

#### Scenario: Purchase order document form

- **GIVEN** a purchase order document without a locale
- **WHEN** it is read
- **THEN** the locale is en_US

### Requirement: Supplier order intake and invoice

Recovered from: ORDER-FULFILLMENT-WORKFLOW-0001
The system SHALL accept each supplier purchase order from the order center's purchase-order queue, persist it, attempt to fulfil it from inventory, and, when at least one line was shipped, send an invoice back to the order center; when nothing was shipped it SHALL send no invoice.

#### Scenario: Supplier order intake and invoice

- **GIVEN** an order where nothing can ship
- **WHEN** it is received
- **THEN** it is persisted and no invoice is sent

### Requirement: Publish invoice on topic

Recovered from: ORDER-FULFILLMENT-WORKFLOW-0006
The system SHALL publish each invoice as a text message on the order center's invoice topic, using a new connection per message.

#### Scenario: Publish invoice on topic

- **GIVEN** two invoices
- **WHEN** they are published
- **THEN** each is sent as a text message on its own connection

### Requirement: Inventory update re-attempts pending orders

Recovered from: ORDER-FULFILLMENT-WORKFLOW-0007
The system SHALL, when the stock clerk submits the inventory update screen, in one transaction set the quantity of every ticked item to the entered value, re-attempt all pending purchase orders, and publish an invoice for each order that shipped something.

#### Scenario: Inventory update re-attempts pending orders

- **GIVEN** two ticked items and one pending order that can now ship
- **WHEN** the update is submitted
- **THEN** both quantities are set, the order is re-attempted and its invoice published, all in one transaction

### Requirement: Create line item from data object

Recovered from: ORDER-REQ-0001
The system SHALL allow a line item to be created from an existing line item data object plus a separate quantity-shipped value, copying category, product, item, line number, quantity and unit price from the data object.

#### Scenario: Create line item from data object

- **GIVEN** a line item data object and shipped value 1
- **WHEN** a line item is created
- **THEN** product data is copied and shipped is 1

### Requirement: Cache resolved resources on web tier

Recovered from: ORDF-BR-0002
The system SHALL return the previously resolved object, without a new lookup, when a home, connection factory, queue, topic or data source is requested a second time by the same name on the web tier.

#### Scenario: Cache resolved resources on web tier

- **GIVEN** a queue requested twice by the same name
- **WHEN** the second request is made
- **THEN** the cached object is returned with no new lookup

### Requirement: Single wrapped lookup failure

Recovered from: ORDF-BR-0003
The system SHALL signal a single resource-lookup failure wrapping the original cause when any lookup fails for any reason (name not found, wrong type, other error).

#### Scenario: Single wrapped lookup failure

- **GIVEN** a name that is not bound
- **WHEN** it is requested
- **THEN** a lookup failure carrying the original cause is raised

### Requirement: Shared locator per tier

Recovered from: ORDF-BR-0004
The system SHALL provide the web tier with one shared lookup instance, created once when the class loads, and the EJB tier with a lookup instance created by each caller.

#### Scenario: Shared locator per tier

- **GIVEN** two web-tier callers
- **WHEN** they obtain the locator
- **THEN** both receive the same instance

### Requirement: Central named lookup service

Recovered from: ORDF-INT-0001
The system SHALL resolve named infrastructure resources by name through a central lookup service rather than each caller looking them up directly.

#### Scenario: Central named lookup service

- **GIVEN** a caller needing a data source
- **WHEN** it asks for it by name
- **THEN** the central service resolves it

### Requirement: Uncached configuration entries

Recovered from: ORDF-INT-0002
The system SHALL provide configuration values (URL, boolean and string environment entries) to callers by name from the server's environment entries, without caching them.

#### Scenario: Uncached configuration entries

- **GIVEN** a changed configuration entry
- **WHEN** it is requested again
- **THEN** the fresh value is returned

### Requirement: Order process-status records

Recovered from: ORDF-REQ-0002
The system SHALL allow creating a status record for an order with a caller-supplied initial status, and SHALL allow changing, reading and listing by status afterwards.

#### Scenario: Order process-status records

- **GIVEN** an order with initial status X
- **WHEN** a status record is created and changed to Y
- **THEN** reading it returns Y

### Requirement: List by status returns distinct set

Recovered from: ORDF-REQ-0003
The system SHALL return, for a requested status, the distinct set of order status records whose status equals the value given.

#### Scenario: List by status returns distinct set

- **GIVEN** records with statuses X, X and Y
- **WHEN** status X is requested
- **THEN** only the X records are returned, each once

### Requirement: Pluggable transition step

Recovered from: ORDF-WF-0005
The system SHALL allow a pluggable transition step, selected by class name at run time, that receives an XML message or batch of messages and performs a transition, and SHALL fail with a transition error if the named step cannot be loaded or instantiated.

#### Scenario: Pluggable transition step

- **GIVEN** an unknown step class name
- **WHEN** a transition is requested
- **THEN** a transition error is raised

### Requirement: Supplier-bound purchase order document

Recovered from: ORDFUL-REQ-0004
The system SHALL build the supplier-bound purchase order document with an order identifier, an order date formatted yyyy-MM-dd, a shipping address (first name, last name, street, city, state, country, zip) and one or more line items.

#### Scenario: Supplier-bound purchase order document

- **GIVEN** an approved order
- **WHEN** the document is built
- **THEN** it contains the listed fields with the date as yyyy-MM-dd

### Requirement: Supplier invoice document

Recovered from: ORDFUL-REQ-0005
The system SHALL build the supplier invoice document returned to the order center with order identifier, user identifier, order date and shipping date (both yyyy-MM-dd), and a collection of line items.

#### Scenario: Supplier invoice document

- **GIVEN** a shipment
- **WHEN** the invoice document is built
- **THEN** it contains the listed fields with dates as yyyy-MM-dd

### Requirement: Line item description in documents

Recovered from: ORDFUL-REQ-0006
The system SHALL describe each line item in supplier orders and invoices with category, product, item, line number, quantity and unit price.

#### Scenario: Line item description in documents

- **GIVEN** a line item in an invoice
- **WHEN** it is written
- **THEN** the six values are present

### Requirement: Validate incoming documents against schema

Recovered from: ORDFUL-REQ-0008
The system SHALL validate incoming order documents against their published schema, resolving the schema through a catalog that can be overridden by a configured catalog location, and reject a document whose type does not match the expected type.

#### Scenario: Validate incoming documents against schema

- **GIVEN** a document of the wrong type
- **WHEN** it is validated
- **THEN** it is rejected

### Requirement: Completion on invoice receipt

ID: SWHR8-R-0017
Recovered from: ORDFUL-RULE-0001
The system SHALL, on receiving a supplier invoice, mark the shipped line items on the purchase order and set the order status to COMPLETED if every line is shipped, otherwise to SHIPPED_PART; only a completed order SHALL trigger a completed-order notification message.

#### Scenario: Completion on invoice receipt

- **GIVEN** an invoice shipping only some lines
- **WHEN** it is received
- **THEN** the order becomes SHIPPED_PART and no completed-order notification is sent

### Requirement: UTF-8 indented documents

Recovered from: ORDFUL-RULE-0008
The system SHALL encode all generated business documents in UTF-8 with indentation and a declared document type (DTD mode) or namespace (schema mode).

#### Scenario: UTF-8 indented documents

- **GIVEN** a generated document
- **WHEN** it is serialised
- **THEN** it is UTF-8, indented and declares its type or namespace

### Requirement: Record shipments on invoice

Recovered from: ORDFUL-WF-0001
The system SHALL, on receipt of a supplier invoice, record the shipped line items against the order and set the order status to COMPLETED when all items are shipped, otherwise to SHIPPED_PART; on completion it SHALL trigger the completed-order notification.

#### Scenario: Record shipments on invoice

- **GIVEN** an invoice covering all lines
- **WHEN** it is received
- **THEN** the order is COMPLETED and the notification is triggered

### Requirement: Send supplier purchase order for approved orders

ID: SWHR8-R-0018
Recovered from: ORDFUL-WORKFLOW-0001
The system SHALL, for each newly APPROVED order, build a supplier purchase order (order id, date, shipping contact and address, and every line item with category, product, item, line number, quantity and unit price) and send it to the supplier purchase-order queue.

#### Scenario: Send supplier purchase order for approved orders

- **GIVEN** a newly approved order
- **WHEN** it is detected
- **THEN** a supplier purchase order is sent to the supplier purchase-order queue

### Requirement: Purchase order sent to supplier with payment

Recovered from: ORDFUL-WORKFLOW-0003
The system SHALL send a supplier a purchase order containing order id, user id, email, order date, ship and bill addresses, total price, credit card (number, expiry, type) and at least one line item, with a locale defaulting to en_US.

#### Scenario: Purchase order sent to supplier with payment

- **GIVEN** an order without locale
- **WHEN** it is sent
- **THEN** the locale is en_US

### Requirement: Namespaced supplier order from adapter editor

Recovered from: ORDFUL-WORKFLOW-0004
The system SHALL send the supplier order document with order id, order date, a shipping address and at least one line item, in a namespaced form (supplier order namespace) when produced by the third-party-adapter editor.

#### Scenario: Namespaced supplier order from adapter editor

- **GIVEN** a document from the adapter editor
- **WHEN** it is produced
- **THEN** it uses the supplier order namespace

### Requirement: Supplier invoice returned to order center

Recovered from: ORDFUL-WORKFLOW-0005
The system SHALL return an invoice document from the supplier to the order center containing order id, user id, order date, shipping date and at least one line item, with dates formatted yyyy-MM-dd.

#### Scenario: Supplier invoice returned to order center

- **GIVEN** a shipment
- **WHEN** the invoice is returned
- **THEN** it contains the listed fields

### Requirement: Ship only with enough stock

Recovered from: order-fulfillment-BR-0001
The system SHALL ship a purchase order line only when current stock for the item is at least the line quantity, and on shipping SHALL reduce stock by that quantity; a line with insufficient stock or an unknown item SHALL be left unshipped.

#### Scenario: Ship only with enough stock

- **GIVEN** a line for an unknown item
- **WHEN** fulfilment is attempted
- **THEN** the line is left unshipped

### Requirement: Skip shipped lines; complete when all available

Recovered from: order-fulfillment-BR-0002
The system SHALL skip lines already fully shipped, mark each newly shipped line fully shipped, and mark the supplier order COMPLETED only when every line was available in this pass.

#### Scenario: Skip shipped lines; complete when all available

- **GIVEN** an order with one already shipped line
- **WHEN** it is processed
- **THEN** that line is skipped

### Requirement: Invoice when something shipped

Recovered from: order-fulfillment-REQ-0001
The system SHALL, when at least one line is shipped in a pass, produce one invoice XML document listing only the lines shipped in that pass, with shipping date set to the processing time, the original order date, and a fixed customer label, and SHALL send it to the invoice topic for the order center.

#### Scenario: Invoice when something shipped

- **GIVEN** a pass shipping one line
- **WHEN** it completes
- **THEN** one invoice with that line is sent to the invoice topic

### Requirement: Inventory view and update

Recovered from: order-fulfillment-REQ-0002
The system SHALL let a stock clerk view every inventory item with its current quantity and set a new quantity for selected items, ignoring blank and negative entries.

#### Scenario: Inventory view and update

- **GIVEN** three inventory items
- **WHEN** the clerk views them and updates two
- **THEN** all three are listed with quantity and only the selected two change

### Requirement: Accept approved order as XML message

Recovered from: order-fulfillment-WORKFLOW-0001
The system SHALL accept each approved order as an XML purchase order message from the order center's purchase order queue, store it as a supplier order, and attempt to fulfil it immediately.

#### Scenario: Accept approved order as XML message

- **GIVEN** an approved order message
- **WHEN** it is received
- **THEN** it is stored and fulfilment is attempted

### Requirement: Reprocess pending on stock update

Recovered from: order-fulfillment-WORKFLOW-0002
The system SHALL, when the supplier's stock is updated, reprocess every supplier order with status PENDING, ship what stock now allows, and send an invoice for each order that shipped something.

#### Scenario: Reprocess pending on stock update

- **GIVEN** a partially shipped pending order
- **WHEN** stock is updated
- **THEN** it is reprocessed and an invoice is sent if anything shipped
