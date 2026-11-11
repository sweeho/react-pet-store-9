## ADDED Requirements

### Requirement: Per-session cart structure

ID: SWHR8-R-0159
Recovered from: CART-REQ-0001

The system SHALL hold each customer's cart for the length of their shopping session as a mapping of item identifiers to quantities, with at most one line per item.

#### Scenario: New cart
ID: SWHR8-R-0159.01

- **GIVEN** a customer starting a shopping session
- **WHEN** the cart is inspected
- **THEN** it contains no lines

### Requirement: Add item to cart

ID: SWHR8-R-0136
Recovered from: CART-REQ-0002

The system SHALL allow adding an item with quantity 1 by default or a specified quantity, and adding an item already in the cart SHALL replace its quantity rather than increase it.

#### Scenario: Add with default quantity
ID: SWHR8-R-0136.01

- **GIVEN** an empty cart
- **WHEN** an item is added without a quantity
- **THEN** the cart holds that item with quantity 1

#### Scenario: Re-add existing item
ID: SWHR8-R-0136.02

- **GIVEN** a cart holding item A with quantity 3
- **WHEN** item A is added again with no quantity
- **THEN** item A has quantity 1

### Requirement: Remove item from cart

ID: SWHR8-R-0137
Recovered from: CART-REQ-0003

The system SHALL allow an item to be removed from the cart, and removing an item not in the cart SHALL have no effect.

#### Scenario: Remove present item
ID: SWHR8-R-0137.01

- **GIVEN** a cart holding item A
- **WHEN** item A is removed
- **THEN** the cart no longer holds item A

#### Scenario: Remove absent item
ID: SWHR8-R-0137.02

- **GIVEN** a cart not holding item B
- **WHEN** item B is removed
- **THEN** the cart is unchanged and no error is raised

### Requirement: Update item quantity

ID: SWHR8-R-0158
Recovered from: CART-BR-0001

The system SHALL set an item's quantity to the new value when it is greater than zero, and SHALL remove the item from the cart when the new value is zero or less.

#### Scenario: Positive quantity
ID: SWHR8-R-0158.01

- **GIVEN** a cart holding item A with quantity 1
- **WHEN** its quantity is updated to 4
- **THEN** item A has quantity 4

#### Scenario: Zero quantity
ID: SWHR8-R-0158.02

- **GIVEN** a cart holding item A
- **WHEN** its quantity is updated to 0
- **THEN** item A is removed from the cart

### Requirement: Empty cart and count

ID: SWHR8-R-0138
Recovered from: CART-REQ-0004

The system SHALL allow the cart to be emptied and SHALL report the number of distinct item lines, not the sum of quantities.

#### Scenario: Count distinct lines
ID: SWHR8-R-0138.01

- **GIVEN** a cart with item A quantity 5 and item B quantity 2
- **WHEN** the count is requested
- **THEN** 2 is reported

#### Scenario: Empty the cart
ID: SWHR8-R-0138.02

- **GIVEN** a cart with two lines
- **WHEN** the cart is emptied
- **THEN** it holds no lines

### Requirement: Cart line presentation

ID: SWHR8-R-0139
Recovered from: CART-REQ-0005

The system SHALL present each cart line with item id, product id, category, product name, attribute, quantity and the current catalog list price, resolved in the customer's locale (default US English), without snapshotting prices in the cart.

#### Scenario: Catalog price changes
ID: SWHR8-R-0139.01

- **GIVEN** a cart holding item A and the catalog list price of item A then changes
- **WHEN** the cart lines are listed
- **THEN** the line shows the changed price

### Requirement: Cart subtotal

ID: SWHR8-R-0025
Recovered from: CART-BR-0002

The system SHALL compute the cart subtotal as the sum over lines of unit list cost multiplied by quantity, with no discount, tax or rounding applied.

#### Scenario: Two lines
ID: SWHR8-R-0025.01

- **GIVEN** item A at 10.00 quantity 2 and item B at 5.50 quantity 1
- **WHEN** the subtotal is computed
- **THEN** it is 25.50

### Requirement: Item missing from catalog

ID: SWHR8-R-0226
Recovered from: CART-BR-0003

The system SHALL omit a cart line whose catalog lookup fails from the listed lines and from the subtotal, without informing the customer. This behaviour is disputed and awaits a Business Owner decision.

#### Scenario: Unresolvable item
ID: SWHR8-R-0226.01

- **GIVEN** a cart holding an item no longer in the catalog
- **WHEN** the cart lines are listed
- **THEN** that line and its cost are absent and no message is shown

### Requirement: Unrestricted cart access

ID: SWHR8-R-0143
Recovered from: SHOPPING-CART-REQ-0010

The system SHALL make cart operations available to any caller without role restriction.

#### Scenario: Anonymous shopper
ID: SWHR8-R-0143.01

- **GIVEN** a shopper who has not signed on
- **WHEN** they add an item to the cart
- **THEN** the operation succeeds

### Requirement: Non-numeric quantity treated as zero

ID: SWHR8-R-0140
Recovered from: SC-BR-0002

The system SHALL treat a quantity that is not a whole number, submitted on a cart update, as 0.

#### Scenario: Text quantity
ID: SWHR8-R-0140.01

- **GIVEN** a cart page with item A
- **WHEN** the shopper enters "abc" as its quantity and updates
- **THEN** the quantity is treated as 0 and item A is removed

### Requirement: Cart actions from the cart page

ID: SWHR8-R-0161
Recovered from: SC-REQ-0001

The system SHALL let a customer add an item, remove an item, and update the quantity of each cart item from a single form.

#### Scenario: Update several quantities
ID: SWHR8-R-0161.01

- **GIVEN** a cart with items A and B
- **WHEN** the customer changes both quantities and submits the form
- **THEN** both quantities are applied

### Requirement: Empty cart rejects order

ID: SWHR8-R-0160
Recovered from: SC-BR-0004

The system SHALL NOT create an order when the customer's cart has no items, and SHALL show an "Order Error" page stating the cart is empty.

#### Scenario: Submit with empty cart
ID: SWHR8-R-0160.01

- **GIVEN** a customer whose cart has no items
- **WHEN** they submit an order
- **THEN** no order is created and the empty-cart error page is shown

### Requirement: Cart cleared after order hand-off

ID: SWHR8-R-0142
Recovered from: SHOPPING-CART-REQ-0002

The system SHALL empty the customer's cart once an order has been handed off, so that re-submitting the same order is rejected as an empty-cart order.

#### Scenario: Double submit
ID: SWHR8-R-0142.01

- **GIVEN** an order that was just submitted successfully
- **WHEN** the customer submits the order again
- **THEN** the empty-cart error page is shown

### Requirement: Cart page

ID: SWHR8-R-0141
Recovered from: SC-REQ-0003

The cart page SHALL show "Your Shopping Cart is Empty." when the cart has no items, and otherwise SHALL list each item with a remove link, an editable quantity and a cart total formatted as US currency.

#### Scenario: Empty cart displayed
ID: SWHR8-R-0141.01

- **GIVEN** a cart with no items
- **WHEN** the cart page is displayed
- **THEN** the message "Your Shopping Cart is Empty." is shown

#### Scenario: Cart with items displayed
ID: SWHR8-R-0141.02

- **GIVEN** a cart with two items
- **WHEN** the cart page is displayed
- **THEN** each item shows a remove link, an editable quantity and its unit price, and the total is shown in US dollars
