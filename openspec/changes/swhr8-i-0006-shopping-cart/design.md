# Legacy implementation notes: shopping cart

## Where the behaviour lives

- Cart state: `ShoppingCartLocalEJB` (stateful session bean, `components/cart`), a HashMap of item id to Integer quantity; not persisted. Cart operations are unrestricted (unchecked method permission) and run in a Required transaction.
- Web layer: `CartHTMLAction` (`cart.do`) maps `purchase`/`remove`/`update` to cart events; `itemQuantity_<itemId>` request parameters, non-numeric values fall to 0 on `NumberFormatException`. `CartEJBAction` applies them.
- Order hand-off: `OrderEJBAction` checks `items.size() == 0` (throws `ShoppingCartEmptyOrderException`, mapped to `cart_empty_order_error.screen` in `mappings.xml`) AFTER drawing the order id, so a rejected order still consumes an id. `cart.empty()` runs after the send block even if sending failed (suspected defect, see Open questions).
- Subtotal is computed in three places (`CartItem.getTotalCost`, `ShoppingCartModel.getTotalCost`, `ShoppingCartLocalEJB.getSubTotal`) in `double`; order total in `OrderEJBAction` uses `float`. The two can differ in precision.
- Line data (name, attribute, list price) is looked up per call through `CatalogHelper` with the bean's locale (default US English); prices are not snapshotted.

## Quirks worth preserving or deciding

- `addItem` on an existing item replaces the quantity (HashMap.put); no quantity validation on add (zero/negative accepted).
- `updateItemQuantity` for an item not in the cart adds it.
- An item whose catalog lookup fails is skipped in listing/subtotal but stays in the map, so `getCount` still counts it.
- `cart.jsp` forces the `en_US` locale for currency formatting; `ja`/`zh` variants exist under `docroot/`. Quantity inputs have maxlength 10.

## User interface

One screen record was extracted: the cart page (`cart.jsp`), captured as a requirement in the spec.

## Open questions

- Silent dropping of unresolvable items (disputed, financial risk).
- `cart.empty()` after a failed send loses the customer's cart.
- Records CART-REQ-0003 (remove vs. clear-after-order) and SHOPPING-CART-REQ-0004 (remove vs. cart page) share keys across passes; the spec states remove under CART-REQ-0003, clearing under SHOPPING-CART-REQ-0002 and the cart page under SC-REQ-0003.
