## ADDED Requirements

### Requirement: Purchase order record

ID: SWHR8-R-0002
Recovered from: ORDC-ENT-0001
The system SHALL record each purchase order with a unique order id, the ordering user, contact email, order date, locale and total value (two decimals), and SHALL require it to reference an existing contact and an existing credit card.

#### Scenario: An order references a missing card

- **GIVEN** a purchase order whose card id matches no stored credit card
- **WHEN** the order is stored
- **THEN** the store refuses it

#### Scenario: A complete order is stored

- **GIVEN** an order with id, user, email, date, locale, total, existing contact and card
- **WHEN** the order is stored
- **THEN** it is retrievable by its order id

### Requirement: Order lines

Recovered from: CHKO-ENT-0002
The system SHALL store each order line with line number, category, product, item, quantity, unit price and quantity shipped, keyed by order id and line number.

#### Scenario: Two lines on one order

- **GIVEN** an order with two items
- **WHEN** it is stored
- **THEN** each line has its own line number under the same order id

### Requirement: Order line quantity limits

Recovered from: CHKO-RULE-0003
The system SHALL reject an order line whose quantity is not greater than zero, and SHALL reject a line whose quantity shipped exceeds the quantity ordered.

#### Scenario: Zero quantity

- **GIVEN** a line with quantity 0
- **WHEN** it is stored
- **THEN** it is rejected

#### Scenario: Over-shipped

- **GIVEN** a line with quantity 2 and quantity shipped 3
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Payment card record

Recovered from: CHKO-ENT-0001
The system SHALL store a payment card with identifier, card number, card type and expiry date as text (for example 04/04), all mandatory, with no format validation.

#### Scenario: Card missing expiry

- **GIVEN** a card with no expiry date
- **WHEN** it is stored
- **THEN** it is rejected as incomplete

#### Scenario: Free-text expiry

- **GIVEN** a card with expiry 04/04
- **WHEN** it is stored
- **THEN** the text is kept as given

### Requirement: Card creation without validation

Recovered from: ORDCHK-REQ-0001
The system SHALL accept a card number, card type and expiry date at creation, from separate values or a card data object, and SHALL store them without validating them.

#### Scenario: Malformed card

- **GIVEN** a card number of 'abc'
- **WHEN** the card is created
- **THEN** it is stored as given

### Requirement: Card expiry month and year

Recovered from: ORDCHK-BR-0001
The system SHALL derive the card expiry month from the text before the slash and the expiry year from the text after it.

#### Scenario: Expiry parsed

- **GIVEN** an expiry '10/2001'
- **WHEN** month and year are requested
- **THEN** month is '10' and year is '2001'

### Requirement: Card expiry fallback

Recovered from: ORDCHK-BR-0002
The system SHALL return month '01' and year '2010' when the stored expiry is absent or has no slash.

#### Scenario: No slash

- **GIVEN** an expiry 'abcd'
- **WHEN** month and year are requested
- **THEN** month is '01' and year is '2010'

### Requirement: Card capture on account

Recovered from: CHK-REQ-0003
The system SHALL capture a card number, type and expiry month and year when a customer account is created or updated, joining month and year with a slash.

#### Scenario: Account created with card

- **GIVEN** month 04 and year 2027
- **WHEN** the account is saved
- **THEN** the expiry is stored as '04/2027'

### Requirement: Card required on file

Recovered from: CUSTOMER-REQ-0004
The system SHALL require a payment card on file to carry a card number, card type and expiry date.

#### Scenario: Missing type

- **GIVEN** a card with no card type
- **WHEN** it is saved
- **THEN** it is rejected

### Requirement: Required contact data at checkout

Recovered from: OC-REQ-0001
The system SHALL require, for both billing and shipping parties, last name, first name, street address, city, state or province, postal code and telephone number, treat address line 2 and e-mail as optional, and not place the order when any required value is empty.

#### Scenario: Blank city

- **GIVEN** a checkout where the shipping city is blank
- **WHEN** the order is submitted
- **THEN** no order is placed and the missing fields are reported

#### Scenario: Optional fields blank

- **GIVEN** address line 2 and e-mail blank, all else filled
- **WHEN** the order is submitted
- **THEN** the order is accepted

### Requirement: Fixed card on checkout

Recovered from: ORDER-CHECKOUT-REQ-0002
The system SHALL attach to every order submitted from checkout the fixed card number '1234-2334', type 'Duke Express' and expiry '10/2001', regardless of the account's stored card.

#### Scenario: Account has its own card

- **GIVEN** a customer whose account holds a different card
- **WHEN** an order is submitted
- **THEN** the order carries the fixed card

### Requirement: Order total

Recovered from: OC-BR-0002
The system SHALL compute an order's total as the sum over cart lines of unit cost times quantity, and SHALL give each line a zero-based sequence number.

#### Scenario: Two lines

- **GIVEN** lines 2 x 10.00 and 1 x 5.00
- **WHEN** the order is placed
- **THEN** the total is 25.00 and lines are numbered 0 and 1

### Requirement: Order identification and stamping

Recovered from: OC-REQ-0003
The system SHALL give each order a unique order number drawn from the identifier counter named '1001', and SHALL record the signed-in user, bill-to e-mail, order time, shipping and billing contacts, card and shopper locale on the order.

#### Scenario: Order placed

- **GIVEN** a signed-in shopper with a cart
- **WHEN** the order is placed
- **THEN** the order has a new number and carries user, e-mail, time, contacts, card and locale

### Requirement: Asynchronous order submission

Recovered from: OC-INT-0004
The system SHALL send each placed order as an XML purchase order message to the order processing queue asynchronously, then empty the cart and return the order number and bill-to e-mail to the shopper.

#### Scenario: Order sent

- **GIVEN** a placed order
- **WHEN** submission completes
- **THEN** the XML message is queued, the cart is empty and the order number and e-mail are returned

### Requirement: Checkout form pre-fill

Recovered from: OC-REQ-0005
The system SHALL pre-fill the checkout form from the signed-in customer's profile.

#### Scenario: Signed-in customer

- **GIVEN** a signed-in customer with a saved profile
- **WHEN** the checkout form is opened
- **THEN** the saved details are present

### Requirement: Order processing receipt

Recovered from: ORDAPP-WORKFLOW-0001
The system SHALL, on receipt of an order message from the storefront, persist a purchase order and start order tracking in status PENDING, then, if auto-approval applies, publish an approval for that order to the order-approval queue.

#### Scenario: Order message received

- **GIVEN** an order message on the queue
- **WHEN** it is received
- **THEN** the order is stored with tracking status PENDING

### Requirement: Unique identifier generation

Recovered from: ORDER-CHECKOUT-REQ-0001
The system SHALL generate a unique identifier for a caller-supplied prefix by incrementing a persistent per-prefix counter by one and returning the prefix concatenated with the new value.

#### Scenario: Second request

- **GIVEN** a counter for prefix 'A' at 1
- **WHEN** an identifier is requested
- **THEN** 'A2' is returned

### Requirement: Identifier counter bootstrap

Recovered from: ORDER-CHECKOUT-BR-0001
The system SHALL create a counter starting at 0 when none exists for the requested prefix, so the first identifier ends in 1.

#### Scenario: First request

- **GIVEN** no counter for prefix 'B'
- **WHEN** an identifier is requested
- **THEN** 'B1' is returned

### Requirement: Identifier counter failure

Recovered from: ORDER-CHECKOUT-BR-0002
The system SHALL fail the request with an error and return no identifier when a counter cannot be created or looked up.

#### Scenario: Lookup fails

- **GIVEN** the counter lookup fails
- **WHEN** an identifier is requested
- **THEN** an error is raised and no identifier is returned

### Requirement: Identifier counter storage

Recovered from: CHECKOUT-REQ-0009
The system SHALL persist each counter as a unique name with a mandatory integer last-issued value.

#### Scenario: Duplicate name

- **GIVEN** a counter named '1001' exists
- **WHEN** another named '1001' is stored
- **THEN** it is rejected

### Requirement: Postal address record

Recovered from: ORDER-CHECKOUT-ENTITY-0001
The system SHALL hold a postal address as six fields: street line 1, street line 2, city, state, zip code and country.

#### Scenario: Address stored

- **GIVEN** six field values
- **WHEN** an address is created
- **THEN** all six are stored as given

### Requirement: Address XML output

Recovered from: ORDER-CHECKOUT-REQ-0004
The system SHALL serialize an address to an Address XML element containing street name, optional second street name (omitted when null or empty), city, state, zip code and country, in that order.

#### Scenario: No second street

- **GIVEN** street 2 empty
- **WHEN** the address is serialized
- **THEN** no second street element appears

### Requirement: Address XML input

Recovered from: ORDER-CHECKOUT-REQ-0005
The system SHALL reject incoming XML whose root is not an Address element or which lacks street name, city, state, zip code or country in order, and SHALL treat the second street name as optional.

#### Scenario: Wrong root

- **GIVEN** XML with root Order
- **WHEN** it is parsed as an address
- **THEN** it is rejected

### Requirement: Address purge with order

Recovered from: ORDER-CHECKOUT-REQ-0006
The system SHALL delete an order's addresses together with the order when the order is COMPLETED or DENIED and older than 180 days.

#### Scenario: Old completed order

- **GIVEN** a COMPLETED order 200 days old
- **WHEN** purge runs
- **THEN** the order and its addresses are deleted

### Requirement: Line item interchange

Recovered from: ORDER-REQ-0002
The system SHALL expose a line item as a data snapshot of category, product, item, line number, quantity and unit price, and as XML with elements CategoryId, ProductId, ItemId, LineNum, Quantity and UnitPrice in that order.

#### Scenario: Line serialized

- **GIVEN** a line item
- **WHEN** XML is produced
- **THEN** elements appear in the stated order
