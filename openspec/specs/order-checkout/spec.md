# order-checkout Specification

## Purpose

TBD - created by archiving change swhr8-i-0007-order-checkout-and-payment. Update Purpose after archive.

## Requirements

### Requirement: Purchase order record

ID: SWHR8-R-0002
Recovered from: ORDC-ENT-0001
The system SHALL record each purchase order with a unique order id, the ordering user, contact email, order date, locale and total value (two decimals), and SHALL require it to reference an existing contact and an existing credit card.

#### Scenario: An order references a missing card

ID: SWHR8-R-0002.01

- **GIVEN** a purchase order whose card id matches no stored credit card
- **WHEN** the order is stored
- **THEN** the store refuses it

#### Scenario: A complete order is stored

ID: SWHR8-R-0002.02

- **GIVEN** an order with id, user, email, date, locale, total, existing contact and card
- **WHEN** the order is stored
- **THEN** it is retrievable by its order id

### Requirement: Order lines

ID: SWHR8-R-0202
Recovered from: CHKO-ENT-0002
The system SHALL store each order line with line number, category, product, item, quantity, unit price and quantity shipped, keyed by order id and line number.

#### Scenario: Two lines on one order

ID: SWHR8-R-0202.01

- **GIVEN** an order with two items
- **WHEN** it is stored
- **THEN** each line has its own line number under the same order id

### Requirement: Order line quantity limits

ID: SWHR8-R-0203
Recovered from: CHKO-RULE-0003
The system SHALL reject an order line whose quantity is not greater than zero, and SHALL reject a line whose quantity shipped exceeds the quantity ordered.

#### Scenario: Zero quantity

ID: SWHR8-R-0203.01

- **GIVEN** a line with quantity 0
- **WHEN** it is stored
- **THEN** it is rejected

#### Scenario: Over-shipped

ID: SWHR8-R-0203.02

- **GIVEN** a line with quantity 2 and quantity shipped 3
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Payment card record

ID: SWHR8-R-0201
Recovered from: CHKO-ENT-0001
The system SHALL store a payment card with identifier, card number, card type and expiry date as text (for example 04/04), all mandatory, with no format validation.

#### Scenario: Card missing expiry

ID: SWHR8-R-0201.01

- **GIVEN** a card with no expiry date
- **WHEN** it is stored
- **THEN** it is rejected as incomplete

#### Scenario: Free-text expiry

ID: SWHR8-R-0201.02

- **GIVEN** a card with expiry 04/04
- **WHEN** it is stored
- **THEN** the text is kept as given

### Requirement: Card creation without validation

ID: SWHR8-R-0210
Recovered from: ORDCHK-REQ-0001
The system SHALL accept a card number, card type and expiry date at creation, from separate values or a card data object, and SHALL store them without validating them.

#### Scenario: Malformed card

ID: SWHR8-R-0210.01

- **GIVEN** a card number of 'abc'
- **WHEN** the card is created
- **THEN** it is stored as given

### Requirement: Card expiry month and year

ID: SWHR8-R-0209
Recovered from: ORDCHK-BR-0001
The system SHALL derive the card expiry month from the text before the slash and the expiry year from the text after it.

#### Scenario: Expiry parsed

ID: SWHR8-R-0209.01

- **GIVEN** an expiry '10/2001'
- **WHEN** month and year are requested
- **THEN** month is '10' and year is '2001'

### Requirement: Card expiry fallback

ID: SWHR8-R-0197
Recovered from: ORDCHK-BR-0002
The system SHALL return month '01' and year '2010' when the stored expiry is absent or has no slash.

#### Scenario: No slash

ID: SWHR8-R-0197.01

- **GIVEN** an expiry 'abcd'
- **WHEN** month and year are requested
- **THEN** month is '01' and year is '2010'

### Requirement: Required contact data at checkout

ID: SWHR8-R-0206
Recovered from: OC-REQ-0001
The system SHALL require, for both billing and shipping parties, last name, first name, street address, city, state or province, postal code and telephone number, treat address line 2 and e-mail as optional, and not place the order when any required value is empty.

#### Scenario: Blank city

ID: SWHR8-R-0206.01

- **GIVEN** a checkout where the shipping city is blank
- **WHEN** the order is submitted
- **THEN** no order is placed and the missing fields are reported

#### Scenario: Optional fields blank

ID: SWHR8-R-0206.02

- **GIVEN** address line 2 and e-mail blank, all else filled
- **WHEN** the order is submitted
- **THEN** the order is accepted

### Requirement: Fixed card on checkout

ID: SWHR8-R-0098
Recovered from: ORDER-CHECKOUT-REQ-0002
The system SHALL attach to every order submitted from checkout the fixed card number '1234-2334', type 'Duke Express' and expiry '10/2001', regardless of the account's stored card.

#### Scenario: Account has its own card

ID: SWHR8-R-0098.01

- **GIVEN** a customer whose account holds a different card
- **WHEN** an order is submitted
- **THEN** the order carries the fixed card

### Requirement: Order total

ID: SWHR8-R-0204
Recovered from: OC-BR-0002
The system SHALL compute an order's total as the sum over cart lines of unit cost times quantity, and SHALL give each line a zero-based sequence number.

#### Scenario: Two lines

ID: SWHR8-R-0204.01

- **GIVEN** lines 2 x 10.00 and 1 x 5.00
- **WHEN** the order is placed
- **THEN** the total is 25.00 and lines are numbered 0 and 1

### Requirement: Order identification and stamping

ID: SWHR8-R-0207
Recovered from: OC-REQ-0003
The system SHALL give each order a unique order number drawn from the identifier counter named '1001', and SHALL record the signed-in user, bill-to e-mail, order time, shipping and billing contacts, card and shopper locale on the order.

#### Scenario: Order placed

ID: SWHR8-R-0207.01

- **GIVEN** a signed-in shopper with a cart
- **WHEN** the order is placed
- **THEN** the order has a new number and carries user, e-mail, time, contacts, card and locale

### Requirement: Asynchronous order submission

ID: SWHR8-R-0205
Recovered from: OC-INT-0004
The system SHALL send each placed order as an XML purchase order message to the order processing queue asynchronously, then empty the cart and return the order number and bill-to e-mail to the shopper.

#### Scenario: Order sent

ID: SWHR8-R-0205.01

- **GIVEN** a placed order
- **WHEN** submission completes
- **THEN** the XML message is queued, the cart is empty and the order number and e-mail are returned

### Requirement: Checkout form pre-fill

ID: SWHR8-R-0208
Recovered from: OC-REQ-0005
The system SHALL pre-fill the checkout form from the signed-in customer's profile.

#### Scenario: Signed-in customer

ID: SWHR8-R-0208.01

- **GIVEN** a signed-in customer with a saved profile
- **WHEN** the checkout form is opened
- **THEN** the saved details are present

### Requirement: Order processing receipt

ID: SWHR8-R-0092
Recovered from: ORDAPP-WORKFLOW-0001
The system SHALL, on receipt of an order message from the storefront, persist a purchase order and start order tracking in status PENDING, then, if auto-approval applies, publish an approval for that order to the order-approval queue.

#### Scenario: Order message received

ID: SWHR8-R-0092.01

- **GIVEN** an order message on the queue
- **WHEN** it is received
- **THEN** the order is stored with tracking status PENDING

### Requirement: Unique identifier generation

ID: SWHR8-R-0097
Recovered from: ORDER-CHECKOUT-REQ-0001
The system SHALL generate a unique identifier for a caller-supplied prefix by incrementing a persistent per-prefix counter by one and returning the prefix concatenated with the new value.

#### Scenario: Second request

ID: SWHR8-R-0097.01

- **GIVEN** a counter for prefix 'A' at 1
- **WHEN** an identifier is requested
- **THEN** 'A2' is returned

### Requirement: Identifier counter bootstrap

ID: SWHR8-R-0094
Recovered from: ORDER-CHECKOUT-BR-0001
The system SHALL create a counter starting at 0 when none exists for the requested prefix, so the first identifier ends in 1.

#### Scenario: First request

ID: SWHR8-R-0094.01

- **GIVEN** no counter for prefix 'B'
- **WHEN** an identifier is requested
- **THEN** 'B1' is returned

### Requirement: Identifier counter failure

ID: SWHR8-R-0095
Recovered from: ORDER-CHECKOUT-BR-0002
The system SHALL fail the request with an error and return no identifier when a counter cannot be created or looked up.

#### Scenario: Lookup fails

ID: SWHR8-R-0095.01

- **GIVEN** the counter lookup fails
- **WHEN** an identifier is requested
- **THEN** an error is raised and no identifier is returned

### Requirement: Address XML input

ID: SWHR8-R-0099
Recovered from: ORDER-CHECKOUT-REQ-0005
The system SHALL reject incoming XML whose root is not an Address element or which lacks street name, city, state, zip code or country in order, and SHALL treat the second street name as optional.

#### Scenario: Wrong root

ID: SWHR8-R-0099.01

- **GIVEN** XML with root Order
- **WHEN** it is parsed as an address
- **THEN** it is rejected

### Requirement: Line item interchange

ID: SWHR8-R-0100
Recovered from: ORDER-REQ-0002
The system SHALL expose a line item as a data snapshot of category, product, item, line number, quantity and unit price, and as XML with elements CategoryId, ProductId, ItemId, LineNum, Quantity and UnitPrice in that order.

#### Scenario: Line serialized

ID: SWHR8-R-0100.01

- **GIVEN** a line item
- **WHEN** XML is produced
- **THEN** elements appear in the stated order

### Requirement: Credit card mandatory fields

ID: SWHR8-R-0199
Recovered from: CHK-ENT-0006
The system SHALL require a credit card to have a card number, card type and expiry date, with the expiry date held as free text of up to 10 characters.

#### Scenario: Credit card mandatory fields case 1

ID: SWHR8-R-0199.01

- **GIVEN** a card with no card type
- **WHEN** it is stored
- **THEN** it is rejected

#### Scenario: Credit card mandatory fields case 2

ID: SWHR8-R-0199.02

- **GIVEN** a card whose expiry text is 10 characters long
- **WHEN** it is stored
- **THEN** it is accepted

### Requirement: Order counter and order lookups

ID: SWHR8-R-0200
Recovered from: CHK-ENT-0010
The system SHALL keep a named integer counter per name for generating sequential identifiers, and SHALL support looking up purchase orders by user and by date.

#### Scenario: Order counter and order lookups case 1

ID: SWHR8-R-0200.01

- **GIVEN** purchase orders exist for several users
- **WHEN** orders are looked up by user
- **THEN** only that user's orders are returned

#### Scenario: Order counter and order lookups case 2

ID: SWHR8-R-0200.02

- **GIVEN** purchase orders exist on several dates
- **WHEN** orders are looked up by date
- **THEN** only orders with that date are returned

### Requirement: Billing and shipping contact data required

ID: SWHR8-R-0091
Recovered from: CHK-REQ-0001
The system SHALL require billing and shipping contact data (family name, given name, street, city, state or province, postal code, telephone) before accepting an order, and on missing data SHALL not place the order.

#### Scenario: Billing and shipping contact data required case 1

ID: SWHR8-R-0091.01

- **GIVEN** an order whose billing postal code is empty
- **WHEN** the order is submitted
- **THEN** the order is not placed

#### Scenario: Billing and shipping contact data required case 2

ID: SWHR8-R-0091.02

- **GIVEN** an order with every contact field present
- **WHEN** the order is submitted
- **THEN** the order is accepted

### Requirement: Payment card attributes

ID: SWHR8-R-0020
Recovered from: ORDCHK-ENT-0001
The system SHALL represent a payment card as three attributes: card number, card type and expiry date, each held as text.

#### Scenario: Payment card attributes case 1

ID: SWHR8-R-0020.01

- **GIVEN** a payment card
- **WHEN** it is represented
- **THEN** it has card number, card type and expiry date as text

### Requirement: Line item transactions and access

ID: SWHR8-R-0093
Recovered from: ORDER-BR-0001
The system SHALL perform line item reads and writes within a transaction and SHALL NOT restrict line item access by role.

#### Scenario: Line item transactions and access case 1

ID: SWHR8-R-0093.01

- **GIVEN** a user with no particular role
- **WHEN** a line item is read or written
- **THEN** the operation is allowed and runs in a transaction

### Requirement: Identifier counter entity

ID: SWHR8-R-0096
Recovered from: ORDER-CHECKOUT-ENT-0001
The system SHALL persist one counter per distinct prefix, identified uniquely by the prefix name and holding an integer last-issued value.

#### Scenario: Identifier counter entity case 1

ID: SWHR8-R-0096.01

- **GIVEN** two identifiers requested for different prefixes
- **WHEN** they are issued
- **THEN** each prefix has its own counter with its own last-issued value

### Requirement: Order line item attributes

ID: SWHR8-R-0021
Recovered from: ORDER-ENTITY-0001
The system SHALL represent each order line item with a category id, product id, item id, line number, quantity, unit price and quantity shipped.

#### Scenario: Order line item attributes case 1

ID: SWHR8-R-0021.01

- **GIVEN** an order line item
- **WHEN** it is represented
- **THEN** it carries category id, product id, item id, line number, quantity, unit price and quantity shipped

### Requirement: Order numbers from the 1001 counter

ID: SWHR8-R-0198
Recovered from: ORDER-CHECKOUT-REQ-0003
The system SHALL issue order numbers for the batch order extract from this counter mechanism, with numbering that starts at 1001 per the operations runbook.

#### Scenario: Order numbers from the 1001 counter case 1

ID: SWHR8-R-0198.01

- **GIVEN** the runbook states the order counter starts at 1001 while the counter mechanism starts a new prefix at 0
- **WHEN** an order number is issued
- **THEN** the first number follows the confirmed start value (disputed, to be settled by the Business Owner)
