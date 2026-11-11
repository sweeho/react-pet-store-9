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

## Codebase findings (sprint SWHR8-S-0005 planning)

- **No cart code exists.** There is no `server/cart/`, no `/api/cart*` route and no `/cart` page. The item page (`src/pages/item/[id].tsx`) has no Add to cart.
- **The session already reserves a cart slot.** `GET /api/session` (`routes/api/session.get.ts`) returns `cartCount: 0` with the comment "0 until the cart (SWHR8-I-0006) attaches". `src/components/account/api.ts` types `cartCount`. `routes/api/signoff.post.ts` and `server/customer/auth.ts` (`signOff`, and the 15-minute idle drop in `view`) say "and, later, the cart slot". ARCHITECTURE.md Key Decision "One session, one cookie" binds the cart to the `petstore_sid` session id, which `middleware/locale.ts` puts on `event.context.sessionId`.
- **Catalog reads are async and per-locale.** `server/catalog/index.ts` exports `catalog` (`createCatalog({ source })`), with `getItem(id, locale)` → `Item { id, productId, listPrice, unitCost, description, ... }` and `getProduct(id, locale)` → `Product { name, categoryId }`. There is no fallback across locales. ARCHITECTURE.md requires every catalog read to go through this module.
- **Money formatting.** `src/components/catalog/price.ts` `formatPrice(amount, locale)` formats in the locale's currency, through `formatCurrency` in `server/localization/locale.ts`.
- **Shell.** `src/constants/primary-areas.ts` drives the global nav, footer and landing page. `src/pages/_layout.tsx` draws the header with the language control and `AccountMenu`. `EmptyFrame` is in `src/components/shell/`.
- **Locked acceptance tests fix the boundaries** (`tests/acceptance/shopping-cart/`):
  - `server/cart/cart.ts`: `createCart()` with `add(itemId, quantity?)`, `remove`, `updateQuantity`, `empty`, `count`, `quantities()`; `subtotal(cart, catalog)`; `listLines(cart, catalog, locale = "en_US")`, where `catalog.find(itemId, locale?)` is **synchronous**.
  - HTTP: `POST /api/cart/items {itemId, quantity?}`, `POST /api/cart/update {quantities}`, `GET /api/cart` → `{ items: [{ itemId, quantity, listPrice, ... }], total }`.
  - `/cart` page: per-line "Remove" link, a quantity input with accessible name `Quantity <itemId>` and the unit price in the same row, an "Update" button, and a "Total" element outside the rows. All money is in US-dollar format.
  - C-0047 (`tests/acceptance/customer-account/account.spec.ts`, deferred here by change `swhr8-i-0005-customer-account-and-sign-o`): sign-off resets `cartCount` to 0 and keeps the locale.
  - C-0082 (`lines.test.ts`) imports `server/checkout/service.ts` `placeOrder`. C-0077 (`cart.spec.ts`) drives `POST /api/checkout` and the `/checkout` form. Both are built by order checkout (SWHR8-I-0007).
- **Sample items.** EST-1 and EST-6, which the browser tests use, exist in the seed catalog (`db/seed/catalog.json`).
- **Tests.** The platform's test-evidence globs do not count `server/**/*.test.ts`. Earlier capabilities put server unit tests in `src/test/server/`. Route tests go in `routes/**` (server Vitest project). The browser tests run `fullyParallel` against one server, and each test context has its own session cookie.
- **CI.** `.github/workflows/ci.yml` runs on pull requests to `vortex/**` and already runs unit, E2E and both acceptance tiers. No CI change is needed.

## Decisions (sprint SWHR8-S-0005)

- **K1 Pure cart model.** `server/cart/cart.ts` holds the model exactly as the locked tests name it. A cart is a `Map<itemId, quantity>` with one entry per item. `add` defaults the quantity to 1 and replaces an existing quantity. `updateQuantity` sets the value when > 0, removes the line when ≤ 0, and adds the line when it is absent (legacy). `remove` on an absent item is a no-op. `count()` returns the number of distinct lines. `listLines` and `subtotal` take a synchronous `find(itemId, locale)`, read it on every call, and never store a price.
- **K2 Session cart store.** `server/cart/store.ts` keeps carts in memory, keyed by session id (`cartFor(sessionId)`, `dropCart(sessionId)`, plus a shared singleton). Nothing is persisted.
  - Sign-off (`routes/api/signoff.post.ts`) drops the cart.
  - The signed-on 15-minute idle expiry in `server/customer/auth.ts` drops it too (customer-account design A4).
  - When a session expires, the session id changes, so the next request sees a new empty cart.
- **K3 Catalog bridge.** `server/cart/lines.ts` (async) loads the cart's items and their products through the shared `catalog` module, in the session locale, into a synchronous lookup. It returns `{ itemId, productId, categoryId, productName, attribute, quantity, listPrice, lineTotal }`, where `attribute` is the item description. An item or product that is missing in that locale is a failed lookup: the line is omitted (R-0226).
- **K4 HTTP.** No cart route is protected (R-0143).
  - `POST /api/cart/items {itemId, quantity?}`.
  - `POST /api/cart/update {quantities: {[itemId]: string|number}}`, which applies every entry through `parseQuantity`.
  - `POST /api/cart/remove {itemId}`.
  - `GET /api/cart` → `{ items, total, count }`. `total` is the raw sum, with no rounding.
  - `GET /api/session` reports `cartCount = cartFor(sessionId).count()`.
- **K5 Quantity parsing.** `parseQuantity(raw)` returns the integer for a whole-number string or number (optional sign, surrounding spaces), and 0 for anything else ("abc", "2.5", ""). Quantity inputs have `maxlength` 10 (legacy).
- **K6 Money on the cart page.** Unit price, line total and Total are formatted as US dollars (`en_US`) whatever the session locale, as the legacy `cart.jsp` did and R-0141 states (see S3). Line text (product name, description) follows the session locale.
- **K7 Screens.**
  - `/cart` follows the exported mockups MCK-9 to MCK-12. It has rows of item and product names, category, item and product ids, unit price, quantity input and Remove link, and an "Update" button. Beside the rows sits an order summary with Items (count) and Total, a "Proceed to checkout" link to `/checkout` and a "Continue shopping" link. The empty state uses `EmptyFrame` titled "Your Shopping Cart is Empty.".
  - The item page gains a quantity field and an "Add to cart" button. It posts to `/api/cart/items` and then opens `/cart`.
  - The global nav gains a `PRIMARY_AREAS` "Cart" entry (`/cart`) with a badge showing `cartCount` when it is above 0.
  - `/checkout/error` (the Order Error page, MCK-13 and MCK-14) has the heading "Order Error", the text "Your shopping cart is empty." and links to the catalog and the cart.
  - All strings are in the en_US, ja_JP and zh_CN dictionaries.
- **K8 Order interaction is split at the cart boundary.** This change ships the Order Error page, `dropCart`/`empty` on the session cart, and the guarantee that an empty cart reports `count() === 0`. Order checkout (SWHR8-I-0007) builds `placeOrder` and `/checkout`. It must check for an empty cart before drawing an order number, send an empty-cart submit to `/checkout/error`, and empty the session cart after hand-off. Cases C-0077 and C-0082 are deferred to SWHR8-I-0007 for that reason.
- **K9 Missing catalog items (task 2.3).** Implemented as specified: omitted silently from lines and subtotal, but still counted by `count()` (legacy). The Business Owner dispute stays open; changing it later only touches `listLines`/`subtotal`.

## Phases

1. Cart model and quantity parsing (tasks 1.1–1.5, 3.2). Unit tests in `src/test/server/cart/`.
2. Lines and subtotal via the catalog (tasks 2.1–2.3). Unit tests with a fake lookup.
3. Session store, cart routes, `GET /api/session` `cartCount`, sign-off and idle drop (tasks 4.3, plus the session wiring). Route tests under `routes/api/cart/`.
4. Screens: `/cart`, item-page Add to cart, nav Cart badge, `/checkout/error`, three dictionaries (tasks 3.1, 4.1, 4.2 cart side). UI tests beside the pages.
5. **Test harness** (task 5.1): one test per scenario across unit, route, UI and the new `e2e/cart.spec.ts` (add → cart page → update → remove → empty message). The locked shopping-cart acceptance tests pass, except C-0077 and C-0082 (deferred), and so does customer-account C-0047.
6. **CI**: no workflow change. The existing `ci.yml` already runs every tier on `vortex/**` pull requests. Confirm the new specs appear in its JUnit output.

## Spec discrepancies

- **S1 Order interaction needs order checkout.** R-0160 and R-0142 (and C-0082, C-0077) need `placeOrder`, `POST /api/checkout` and `/checkout`, which SWHR8-I-0007 builds. Their acceptance criteria stay on the FEATURE verbatim. The cart side (Order Error page, emptying) ships here, and the end-to-end proof is deferred with the two cases (K8). QA should record those two scenarios as not-testable until SWHR8-I-0007.
- **S2 Button text.** The mockup labels the form button "Update cart". The locked browser tests click "Update" (exact). The tests win.
- **S3 Currency.** R-0141 and the legacy `cart.jsp` format the cart in US dollars. The catalog keeps per-locale list prices (ja_JP prices are yen amounts) and DESIGN.md says money follows the locale. In ja_JP the cart will therefore show a yen amount with a `$` sign. Built as specified, and an SME should confirm.
- **S4 Order number drawn before the empty check.** The legacy draws an order id before rejecting an empty cart. R-0160 only says no order is created. SWHR8-I-0007 should check first.
- **S5 Cart emptied after a failed send** (legacy open question). This belongs to SWHR8-I-0007's hand-off and is not decided here.
- **S6 Cart lifetime.** The legacy cart lived as long as the HTTP session (15 minutes in web.xml). Here it follows the session id (30-minute locale session) and is dropped at the signed-on 15-minute expiry. This is the same open timeout question as in PRODUCT.md.
- **S7 Count includes unresolvable lines.** `count()` counts a line that `listLines` omits, so the nav badge can show one more line than the page. This is legacy behaviour, kept with R-0226 while that dispute is open.
- **S8 Add accepts any quantity.** The legacy `addItem` does not validate quantity, so 0 or a negative value is stored. The spec is silent. Kept for parity, and the UI's quantity field defaults to 1.
