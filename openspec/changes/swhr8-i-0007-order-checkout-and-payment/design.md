## Context

Legacy implementation notes only. Order submission is `OrderHTMLAction` (validation, fixed card) then `OrderEJBAction` (id from the `1001` counter, float total, XML via AsyncSender). Order processing center `PurchaseOrderMDB` persists the order as PENDING. Persistence: `purchase_order`, `po_line_item`, `credit_card`, `counter` tables in `petstore_oracle.sql`; CMP beans for card, address, line item and the identifier generator.

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The only UI hint is a user-guide statement that the checkout form is pre-filled (`enter_order_information.jsp`), recorded as a requirement of low confidence.

## Known issues and conflicts

- Order totals use single-precision float with no rounding.
- Checkout always attaches a hard-coded demo card; the customer's stored card is never read.
- Shipping/billing suffixes (\_a/\_b) are swapped relative to variable names in the order action.
- The expiry fallback (01/2010) is a bare literal with no authoritative source.
- Address "mandatory" fields in the interchange format (address pass A) conflict with checkout's required set; the order-number start of 1001 per the runbook is a counter name in code.
- Record keys repeat across pass files (for example ORDER-CHECKOUT-REQ-0001), so `Recovered from:` lines may be ambiguous until ingestion assigns final keys.

## Codebase findings (sprint SWHR8-S-0006 planning)

- **No order code exists.** There is no `server/checkout/`, no order tables, no `/api/checkout*` route and no `/checkout` form. `src/pages/checkout/error.tsx` (Order Error page, shopping-cart K7) and `src/pages/cart.tsx` (its Checkout button links to `/checkout`) already exist.
- **The locked acceptance tests fix the boundaries** (`tests/acceptance/order-checkout/`, plus the deferred cart cases C-0077 in `tests/acceptance/shopping-cart/cart.spec.ts` and C-0082 in `lines.test.ts`):
  - `server/checkout/model.ts` (pure): `createCard(number, type, expiry)`, `cardExpiry(card)`, `createLineItem({...7 fields})`, `priceCart(cart)` → `{ total, lines[{ lineNumber, ... }] }`.
  - `server/checkout/xml.ts`: `lineItemToXml(line)`, `parseAddressXml(xml)` (throws on a non-`Address` root).
  - `server/checkout/identifiers.ts`: `generateIdentifier({ prefix, store })` over an injected `{ get, set }` store.
  - `server/checkout/repository.ts` (async, Drizzle): `saveContact`, `saveCreditCard`, `getCreditCard`, `savePurchaseOrder` (takes one `contactId`, optional `lines`), `getPurchaseOrder`, `getOrderLines`, `findPurchaseOrdersByUser`, `findPurchaseOrdersByDate`, `saveLineItem`, `saveLineItems`, `readLineItem`, `nextIdentifier`, `getCounter`, `nextOrderNumber` (first call returns 1001 on a fresh db).
  - `server/checkout/service.ts`: `placeOrder({ userId, locale, cart, billing, shipping, queue, accountCard?, now? })` sends the XML purchase order to `queue.deliver(text)` and resolves to the order. It rejects an empty cart with an error matching `/empty/i`, and rejects missing contact data with an error naming the fields. In both cases nothing is queued. `receiveOrderMessage(xml)` stores the order. `getOrderTrackingStatus(orderId)` returns `"PENDING"` after receipt.
  - HTTP: `POST /api/checkout {billing, shipping}` → `200 {orderNumber, email}` or `400 {missing: string[]}`. `GET /api/checkout/queue` → `{messages: string[]}`. `GET /api/account/profile` → the saved contact of the signed-on customer.
  - `/checkout`: billing and shipping sets of fields labelled "Last name", "First name", "City" and so on, each label appearing twice. A submit button named like "Place order". After an empty-cart submit the page shows the text "Order Error".
  - Every browser and HTTP case runs from a **signed-out** context. None of them signs on.
- **Customer data.** `server/customer/repository.ts` `getCustomer(userName)` and `server/customer/http.ts` `formFromCustomer` already produce the flat contact form (lastName … email) that the pre-fill needs. `requireSignedOn(event)` returns 401 when signed out. The customer's `contact` / `address` / `credit_card` tables have nullable columns, because a new customer owns empty rows (customer-account A2).
- **Protected routes.** `src/components/account/api.ts` `PROTECTED` already lists `/order` ("order information entry", C-0057), which redirects to `/signon?next=/order`. No `/order` page exists.
- **Cart.** `server/cart/store.ts` `cartFor(sessionId)` / `.empty()`, and `server/cart/lines.ts` resolve cart lines (`itemId, productId, categoryId, quantity, listPrice`) through the catalog in the session locale (shopping-cart K1–K3).
- **Session.** `event.context.sessionId`, `event.context.locale` and `event.context.userName` are set by the middleware.
- **No XML library and no message broker.** The repository has neither. SQLite (Drizzle, `bun:sqlite`) is the only store.
- **Tests and CI.** Server unit tests go in `src/test/server/<capability>/`, because the evidence globs ignore `server/**/*.test.ts`. Route tests go in `routes/**` (server Vitest project). `.github/workflows/ci.yml` already runs unit, E2E and both acceptance tiers on `vortex/**`.

## Decisions (sprint SWHR8-S-0006)

- **O1 Module.** All order code lives in `server/checkout/`, in the five files the locked tests name. `model.ts` and `xml.ts` are pure. `identifiers.ts` is pure over an injected store. `repository.ts` is the only module that touches the order tables. `service.ts` orchestrates.
- **O2 Order tables, separate from customer tables.** One migration adds:
  - `order_contact`: names, phone, e-mail and inline address (address1, address2, city, state, postal code, country). Every column is nullable at the db level, because `saveContact` may store a partial contact (C-0154/0155). Required checkout fields are enforced in the service (O5).
  - `order_credit_card`: card number, card type and expiry date, all NOT NULL, plus CHECK `length(expiry_date) <= 10` (R-0201, R-0199).
  - `purchase_order`: `order_id` text PK, `user_id` (nullable, see S2), e-mail, `order_date` (timestamp), locale, total (real, two decimals), `bill_contact_id` and `ship_contact_id` NOT NULL FK to `order_contact`, `credit_card_id` NOT NULL FK. Indexes on `user_id` and `order_date`. `savePurchaseOrder({ contactId })` uses that id for both contacts when no separate ids are given.
  - `order_line_item`: PK (`order_id`, `line_number`), FK to `purchase_order`, with CHECK `quantity > 0` and CHECK `quantity_shipped <= quantity` (R-0203).
  - `id_counter`: `name` PK, `value` integer (R-0096).
  - `order_status`: `order_id` PK FK, `status` text NOT NULL. Order approval extends it.
  - `order_message`: the outbox, with id, `order_id`, `body` (XML), `status` (`queued` / `delivered`), `session_id`, `created_at`.

  These tables do not reuse the customer tables, which allow empty cards, while R-0201 forbids them. They also stay out of the customer-repository key decision.

- **O3 Identifiers.** `generateIdentifier` reads the stored value, treats a missing one as 0, writes value + 1 and returns `prefix + (value + 1)`. Any failure of the store propagates (R-0094/0095/0097). `repository.nextIdentifier(prefix)` runs it against `id_counter` inside one transaction. `nextOrderNumber()` uses the counter named `"1001"` and seeds it at 1000 when absent, so the first order number is **1001**, then 1002 and so on (C-0170; see S1). The order id is that number as text.
- **O4 Pricing.** `priceCart` numbers lines from 0 in cart order. The unit price is the cart line's `listPrice` (the `unitCost` field in the test shape), so the order total equals the cart total. The sum is computed in integer cents and returned as a number with two decimals. This replaces the legacy single-precision float.
- **O5 Validation.** The required fields for both parties are lastName, firstName, address1, city, state, postalCode and phone. A value counts as blank after trim. address2 and email are optional (R-0206, R-0091). Missing fields are reported as `billing.<field>` / `shipping.<field>`. `placeOrder` checks in this order: empty cart (`CheckoutError` code `EMPTY_CART`), then contacts (`MISSING_FIELDS` with `missing[]`), then draws the number. A rejected order therefore never consumes a number (shopping-cart S4) and never queues anything.
- **O6 Fixed card.** `placeOrder` always attaches `{ "1234-2334", "Duke Express", "10/2001" }` and ignores `accountCard` (R-0098). Card fields are never format-checked (R-0210).
- **O7 Purchase-order XML and hand-off.**
  - `placeOrder` builds one XML document with root `Order`. It holds OrderId, UserId, EmailAddress, OrderDate (ISO), Locale and TotalPrice; BillingInfo and ShippingInfo, each with name, phone, e-mail and an `Address` element (StreetName1, optional StreetName2, City, State, ZipCode, Country); CreditCard; and one `LineItem` per line (elements in the R-0100 order).
  - Country is not asked at checkout. It is derived from the locale's region (en_US → USA, ja_JP → Japan, zh_CN → China), see S5.
  - `receiveOrderMessage` parses the document, reusing `parseAddressXml`. In one transaction it stores the card, both contacts, the order, the lines (`saveLineItems`, all-or-nothing, R-0093) and `order_status = PENDING` (R-0092). A message for an order id that is already stored is ignored, so redelivery never duplicates an order.
- **O8 Production queue (transactional outbox, in-process).** `server/checkout/queue.ts` exports `orderQueue(sessionId?)`.
  - Its `deliver(text)` inserts an `order_message` row and schedules a drain on the next tick. The drain calls `receiveOrderMessage` for each queued row, then marks the row delivered.
  - A failed receipt leaves the row queued, and it is retried on the next drain. A drain also runs on server start.
  - `GET /api/checkout/queue` returns the bodies of the messages queued by **the calling session** only. Order XML is never exposed across sessions, and C-0182's before/after count stays stable under parallel tests.
  - No external broker is introduced (brief assumption).
- **O9 HTTP.**
  - `POST /api/checkout` builds the cart from `server/cart/lines.ts` for the session.
    - It calls `placeOrder` with `userId = event.context.userName ?? null`, the session locale and `orderQueue(sessionId)`.
    - After a successful hand-off it empties the session cart, then returns `200 {orderNumber, email}`. `email` is the billing e-mail.
    - Responses on failure: `409 {error: "EMPTY_CART"}`, `400 {missing}`. A failed `deliver` returns 500 and **keeps the cart** (shopping-cart S5).
  - `GET /api/account/profile` returns the flat contact of the signed-on customer from the customer repository (`formFromCustomer`), and 401 when signed out.
  - `GET /api/checkout/queue` is described in O8.
  - None of these routes is protected (see S2).
- **O10 Screens** (mockups in `artifacts/SWHR8-S-0006/design/`):
  - `/checkout` (`src/pages/checkout/index.tsx`):
    - Billing and shipping field sets, labelled per the mockup ("Street address", "Address line 2 (optional)", "Telephone", "E-mail (optional)"), pre-filled from `GET /api/account/profile`. On 401 the form starts empty.
    - A read-only payment panel showing the fixed card, and the order summary from `GET /api/cart`. Its money is in US dollars, like the cart page.
    - A "Place order" button.
    - Outcomes: a 400 shows the one missing-fields summary above the form (DESIGN.md form rule). A 409 navigates to `/checkout/error`. A 200 navigates to `/checkout/confirmation` with `{orderNumber, email}` in router state.
    - The form renders even when the cart is empty. The empty check happens on submit (S3).
  - `/checkout/confirmation` shows the order number and the bill-to e-mail, and omits the e-mail row when it is blank. Without router state it shows the shell's empty frame.
  - `/order` (already protected) is the sign-on gate. It immediately replaces itself with `/checkout`, and the cart's Checkout button now points to `/order`.
  - All strings are in the three screen dictionaries.
  - No new `PRIMARY_AREAS` entry (S4).

## Phases

1. **Data model** (tasks 1.1–1.4): schema and migration (O2), `model.ts` (cards, expiry, line items), `identifiers.ts`, and the repository with counters (O3).
2. **Checkout behaviour** (tasks 2.1–2.5, 4.1–4.3): validation (O5), pricing (O4), numbering and stamping, the fixed card (O6), and `placeOrder`.
3. **Interchange and lifecycle** (tasks 3.1–3.2): `xml.ts`, the purchase-order XML, `receiveOrderMessage` and PENDING tracking (O7), and the outbox queue (O8).
4. **HTTP and screens** (O9, O10): the three routes, `/checkout`, `/checkout/confirmation`, the `/order` gate, the cart link and the dictionaries.
5. **Test harness.** One test per scenario at the cheapest tier:
   - Pure and repository unit tests in `src/test/server/checkout/`.
   - Route tests in `routes/api/checkout/*.test.ts` and `routes/api/account/*.test.ts`.
   - Page tests beside each page.
   - `e2e/checkout.spec.ts`: cart → checkout → confirmation, plus the missing-fields summary.

   The locked acceptance cases C-0154…C-0187, C-0077 and C-0082 must pass unchanged. Nothing under `tests/acceptance/` is edited.

6. **CI.** No workflow change. `.github/workflows/ci.yml` already runs the unit, E2E and acceptance tiers on `vortex/**` pushes and pull requests. The new migration runs through `db/client.ts` at start-up in every tier.

## Spec discrepancies

- **S1 First order number (R-0198, R-0207).**
  - R-0207 says numbers come from the counter _named_ "1001". Under R-0094/R-0097 that would give "10011".
  - The runbook and the locked case C-0170 say the first number is 1001, and the confirmation mockup shows a plain number (1023).
  - Built per C-0170: the counter "1001" starts so the first number is 1001 (O3).
  - The scenario stays disputed for the Business Owner. If they choose otherwise, only the seed value in `nextOrderNumber` changes.
- **S2 Sign-on at checkout.**
  - The brief sends a signed-out shopper to sign-on first, and customer-account protects "order information entry".
  - The locked checkout cases (C-0181/0182/0183/0185) and the cart case C-0077 post to `/api/checkout` and open `/checkout` from a signed-out context, and expect success.
  - Built so that both pass: the shopper's path from the cart goes through the protected `/order` gate, while `/checkout` and `POST /api/checkout` themselves accept a signed-out session.
  - Such an order carries `user_id = NULL`, so R-0207's "signed-in user" holds only for signed-on shoppers.
  - This needs a decision (protect the API, and amend the tests) from the Business Owner and Test Author.
- **S3 Empty cart order of checks.** The brief's flow shows the Order Error page _before_ the form. C-0077 opens `/checkout` with an empty cart and expects a fillable form, then the Order Error page after submit. Built per the test: the check runs on submit, and the form opens regardless.
- **S4 Navigation entry.** The brief asks for an "Order checkout & payment" entry under Shop. The approved mockups show no such entry (header: Catalog, Search, Cart, Account, Language, Administration; footer Shop: Catalog, Search, Cart). Built per the mockups: checkout is reached from the cart only. This is open question "Shell navigation" in the brief.
- **S5 Country.** R-0099 requires a Country in address XML, and checkout asks for none (brief open question "Country"). Country is derived from the locale's region (O7).
- **S6 Address purge (task 3.2).** No requirement in this delta specifies an address purge. Purging finished orders and their dependents is order-reporting-batch's job, so nothing is built for it here.
- **S7 Receipt ownership (R-0092).** Storing the order as PENDING is also order approval's "Create status record on order receipt". It is built here, because C-0160 is in this change. The "publish an approval if auto-approval applies" half is left to order approval, which extends `receiveOrderMessage`.
- **S8 Card mandatory fields.** R-0201/R-0199 make every card field mandatory, while customer-account stores empty cards (its R-0054). Hence the separate `order_credit_card` table (O2). The customer's card is never read by checkout (R-0098).
- **S9 Total precision.** The legacy computed the total in float with no rounding. R-0002 says two decimals. Built in integer cents (O4).
- **S10 Tasks 2.5 and 4.3** are Business Owner decisions, not code. The feature builds the specified behaviour (fixed card; first number 1001), and the boxes are ticked when it merges. The decisions stay open in PRODUCT.md.
