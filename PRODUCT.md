# Pet Store Modernisation

_PRD v5 · approved 2026-11-08 · by sweeho@gmail.com. Published from the Design Workbench — edit it there, not here._

## Summary

Pet Store Modernisation replaces the Java Pet Store 1.3.2 system with a rebuilt product that behaves as the approved specification describes. The product is an online pet store. Shoppers browse and search a localised catalog, keep a cart, create an account, sign on and place orders. Orders are approved automatically or held for an administrator, fulfilled from supplier stock, invoiced and optionally announced by e-mail. Administrators review and decide on held orders and read sales totals. Operations and Finance depend on unattended nightly jobs for backup, order extract, stuck-order aging, low-stock reporting, catalog integrity, health probing and purge of old orders.

## Context

The legacy system is being replaced and its behaviour has been extracted, reviewed and approved as eleven capability specifications plus a small site-shell specification. That specification is the only source for this document. No product, roadmap or runbook documents were uploaded, so nothing here comes from a document other than the specification, and no document divergences were found.

## Goals

- Serve shoppers in en_US, ja_JP and zh_CN, defaulting to en_US, with catalog text held per locale and no fallback to another locale for catalog text.
- Let shoppers find pets by category, product, item and keyword, in pages of 2 rows by default.
- Let shoppers collect items in a per-session cart and convert it into an order with billing, shipping and card details.
- Let customers create accounts, sign on, and be sent back to the page they asked for.
- Approve orders automatically when the locale and total are under the regional limit (below 500 for US, below 50000 for Japan) and hold all others as PENDING for an administrator.
- Fulfil approved orders in full per line from supplier stock, invoice what shipped, and complete the order when every line has shipped.
- Let administrators list orders by status, approve or deny pending orders, and read revenue and quantity totals by category or item.
- Optionally e-mail customers on order status changes, with every notification off by default.
- Run the nightly and weekly operational jobs: backup, order extract for Finance, stuck-order aging report, inventory and catalog-integrity reports, health probe and purge of finished orders older than 180 days.

## Non-goals

- Restating how the legacy system is built. This document says what the replacement must do, not how.
- Adding behaviour the specification does not have, including German screens (de_DE is offered on the locale screen but no screens exist for it).
- Changing the approval limits, retention period or other thresholds. They are carried as specified.

## Users

- Shopper: browses the catalog, searches and keeps a cart, with or without signing on.
- Customer: a signed-on shopper with an account and profile who places orders.
- Administrator: reviews orders by status, approves or denies pending orders, reads sales totals. Access is restricted to the administrator role.
- Stock clerk: sets supplier inventory quantities.
- Finance: receives the daily order extract and is told when it fails.
- Operations: receives the aging, inventory, backup and health reports and is told of failures.

## User journeys

1. Browse and find an item: Landing page, Category list, Product list (2 per page with Next and Previous), Item page (list price and member price), or Search results from a keyword search.
2. Change language: Locale selection screen, confirmation screen showing the new session locale, then any storefront page in that locale.
3. Register and sign on: Sign-on page, Customer form (registration), Duplicate-account screen if the user name cannot be created, then the page originally requested or the main screen.
4. Place an order: Item page, Cart page (update quantities, remove items), Sign-on page if not signed on, Checkout form (pre-filled from the profile), Order confirmation showing the order number and bill-to e-mail. An empty cart gives the Order Error page.
5. Decide on held orders: Administration entry (login form if not an administrator), Manage orders launcher, Pending orders list, commit changes, reloaded lists.
6. Read sales totals: Administration entry, revenue or quantity report for a date range, by category or by item.
7. Update stock: Inventory update (administrator login), quantity entry per item.

## Capability map

- localization: Locale selection, per-locale catalog text, formatting, encoding, and notification language.
- catalog-browsing: Browse and search the category, product and item catalog with paging and the MyList sidebar.
- customer-account: Customer accounts, profiles, contact and card data, sign-on, sign-off and session expiry.
- shopping-cart: The per-session cart, its subtotal and the cart page.
- order-checkout: Turning a cart into a purchase order with billing, shipping and card details, and queueing it for processing.
- order-approval: Automatic approval by locale and total, otherwise PENDING until an administrator decides, and the order status record.
- order-notifications: Order-status e-mails, each gated by an administrator setting that is off by default.
- order-fulfillment: Supplier orders, stock-based shipping, invoices, and stock update by a stock clerk.
- admin-order-management: Administrator listing of orders by status, approve and deny, and sales totals.
- order-reporting-batch: Daily order extract, stuck-order aging report, weekly purge and the nightly job chain with failure mail.
- inventory-reporting: Low-stock report, catalog integrity check, nightly backup, health probe and sample-data load.
- Site shell (from the specification; describe it in one line)

## Screens

- Landing page at the root route linking to every primary area, inside a shared layout with global navigation, header and footer, with shared empty, error and loading frames.
- Locale selection screen offering en_US, de_DE, ja_JP and zh_CN with a submit control, then a confirmation showing the session locale.
- Category, product and item screens, paged 2 rows at a time with Next and Previous; the item page shows list price and member price as currency.
- MyList sidebar of up to 10 products of the favourite category for a signed-in customer with MyList enabled; a banner chosen by favourite category.
- Cart page: each item with a remove link, editable quantity and unit price, and a total in US dollars; "Your Shopping Cart is Empty." when empty.
- Sign-on page, sign-on error page, customer registration and profile form, and the duplicate-account screen.
- Checkout form pre-filled from the profile, order confirmation with order number and bill-to e-mail, and an Order Error page for an empty cart.
- Administration screens: login form, launcher (manage orders, logout), order lists by status with approve and deny and a Refresh warning when changes are unsaved, and revenue and quantity reports.
- Supplier inventory update screen restricted to administrators.

## Constraints and assumptions

- Currency amounts and numbers are formatted by locale. Requests and responses are UTF-8, and Japanese text submitted in SJIS or JIS is decoded to Unicode.
- Catalog text is returned only for the requested locale. A null locale is an error.
- Card number, type and expiry are stored as given, with no format validation. Checkout attaches one fixed card to every order regardless of the card stored on the account.
- Approval limits are 500 for US and 50000 for Japan. An order exactly at the limit is held. Any other locale is held.
- Order statuses are PENDING, APPROVED, DENIED, SHIPPED_PART and COMPLETED. Decisions apply only to pending orders.
- A line ships only if stock covers the whole line. Stock is never negative.
- Order extract covers the previous day from 00:00 inclusive to 00:00 exclusive. Purge removes COMPLETED or DENIED orders older than 180 days with their dependents. Backups are kept 7 days.
- The nightly chain order is backup 01:00, extract 01:30 only after backup succeeds, aging 01:45, inventory 01:50, purge on Sundays.
- Assumption: where the specification states a figure once (for example the 54 minute administrator session) it is carried as stated.

## Open questions

- Session inactivity differs between capabilities: localization specifies 30 minutes, customer-account specifies 15 minutes for web and signed-on sessions, and admin-order-management specifies 54 minutes for administrators. Which applies to a customer session? This document treats 15 minutes as the customer figure, since it is stated four times.
- The first order number: the specification says numbers come from a counter named '1001' that starts new prefixes at 0, while the operations runbook cited in it says numbering starts at 1001. Marked disputed in the specification; the Business Owner must settle it.
- Cart lines whose catalog item no longer exists are silently dropped from the cart and subtotal. The specification marks this as disputed and awaiting the Business Owner.
- The locale selection screen offers de_DE but no de_DE screens exist, and its reachability is unresolved.
- Checkout always attaches a fixed card (number '1234-2334', type 'Duke Express') whatever the account holds. Is this intended for the replacement?
- The specification has a site-shell capability (landing page, global navigation, shared layout, shared state frames) that the build manifest does not list. This PRD folds it into no manifest capability and leaves it out of the Capability map. Decide whether to add it as a twelfth capability or merge it into another.
- The build manifest's change directories (openspec/changes/sx-_) do not exist on this branch; the specifications live under openspec/changes/swhr8-i-_. The Capability map follows the manifest slugs.

## Sources

The approved capability specifications under openspec/changes/, read through build/manifest.yaml. No uploaded documents.
