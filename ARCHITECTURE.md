# Architecture

See [PRODUCT.md](./PRODUCT.md) for what this is, [DESIGN.md](./DESIGN.md) for the visual system.

## Stack

- **Framework**: Vite 8 running a React 19 SPA + a Nitro 3 server together
- **Language**: TypeScript 5 (strict)
- **Frontend routing**: `vite-plugin-pages` (file-based) + `react-router` 8
- **Backend routing**: Nitro 3 / H3 2 (file-based)
- **Database**: SQLite via Bun's built-in `bun:sqlite` + Drizzle ORM — schema/client in `db/`, migrations in `drizzle/`. Requires the Bun runtime (dev, test, and production — see Deployment below)
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.ts`) + `tw-animate-css`
- **UI primitives**: shadcn/ui-style — Radix Slot, `class-variance-authority`, `cn()`
- **Icons**: `lucide-react`, `@heroicons/react`
- **Auto-imports**: `unplugin-auto-import` — `react` + `react-router` need no import
- **Fonts**: `unplugin-fonts` (config in `configs/fonts.config.ts`)
- **Tests**: Vitest + Testing Library (unit/integration/UI), Playwright (E2E/smoke)
- **Lint/format**: ESLint 9 + typescript-eslint, Prettier, Husky + lint-staged

## Directory structure

```
.
├── src/
│   ├── components/ui/   # shadcn/ui-style primitives (+ *.test.tsx)
│   ├── components/shell/ # Shared empty / error / loading frames every page reuses
│   ├── constants/primary-areas.ts # The primary areas: one source for nav + landing page
│   ├── pages/            # Frontend routes, file-based (+ *.test.tsx); _layout.tsx is the site shell
│   ├── hooks/, utils/, types/, constants/, data/, store/
│   ├── test/              # Vitest setup
│   ├── index.css           # Tailwind v4 + design tokens
│   └── main.tsx
├── src/i18n/              # Locale provider, useScreen(), per-locale screen dictionaries
├── server/                # Framework-free server modules, one folder per capability (e.g. server/localization/, server/catalog/); server/jobs/ holds operational checks; server/lib/ holds the pure admin order-management rules whose paths the locked acceptance tests fix, and server/admin/ their database reads and queue hand-off
├── routes/api/            # Backend routes, file-based (+ *.test.ts)
├── middleware/             # Runs before every route handler (session + locale resolution)
├── db/                      # Drizzle schema.ts + client.ts (sqlite connection, migrate, seed)
├── drizzle/                  # Generated SQL migrations (drizzle-kit generate), committed
├── e2e/                     # Playwright specs + global-setup.ts
├── configs/, scripts/
├── server.ts                # Nitro server entry
├── vite.config.ts, vitest.config.ts, playwright.config.ts, drizzle.config.ts
├── tsconfig.json             # src
├── tsconfig.node.json          # server/config/test files
└── package.json
```

## Routing

**Frontend**: `src/pages/**/*.tsx` → routes (`about.tsx` → `/about`, `[id].tsx` → `/:id`, `[...all].tsx` → catch-all). `*.test.tsx` and `_layout.tsx` excluded via `Pages({ exclude })` in `vite.config.ts`.

**Site shell**: `src/main.tsx` mounts `src/pages/_layout.tsx` once as the parent route of every generated page route, so every page (including not-found) renders inside the shared header, global navigation and footer via `<Outlet />`. Pages render content only; they never draw chrome. Navigation entries come from `src/constants/primary-areas.ts`. Requirements: `openspec/specs/site-shell/`.

**Backend**: `routes/api/*.ts` → `/api/*`, `middleware/*.ts` runs first and can set `event.context`. Requires `nitro({ serverDir: "./" })` in `vite.config.ts` — default is `false` (no scanning). `*.test.ts` excluded via `nitro({ ignore })`.

## Data flow example

`POST /api/signon`: the session middleware resolves `sessionId` → the route calls `server/customer/auth.ts`, which checks the credentials through `server/customer/repository.ts` (Drizzle over `db/client.ts`) and records sign-on on that session → `GET /api/session` then reports `signedOn` and `userName`. `routes/api/users/[id].ts` shows the dynamic-route + `createError()` 404 pattern.

## Session and locale

Every request passes through one session middleware. It resolves an HTTP-only session cookie, renews a session idle for 30 minutes or more, and puts `sessionId` and the request's `locale` on `event.context`. The locale is a `?locale=` parameter for that request, otherwise the session locale, otherwise the configured default (en_US). `GET /api/session` exposes the session state; each capability adds its fields to it (locale; sign-on, user name and profile preferences; cart count). The client mirrors it in one `LocaleProvider`, which sets `<html lang>` and serves screen strings from per-locale dictionaries. A locale with no dictionary falls back to the default. Catalog text never falls back. Requests and responses are UTF-8. Behaviour: `openspec/specs/localization/`. Implementation: `server/localization/`, `middleware/`, `src/i18n/`.

## Sign-on and protected pages

Sign-on state is attached to the same session id. A signed-on session idle for 15 minutes loses its sign-on and cart on the next request, and sign-off clears the cart too, while the locale follows the 30-minute session rule (the two figures are an open question in [PRODUCT.md](./PRODUCT.md#open-questions)). A short, fixed list of pages and actions requires sign-on: the account profile and its save, order information entry (`/order`, the gate the cart's Checkout button goes through) and the sign-on welcome. The checkout form and its order API themselves accept a signed-out session, as the locked acceptance tests require. That is an open decision recorded in change `swhr8-i-0007-order-checkout-and-payment` (design S2). The server answers a protected API call from a signed-out session with 401; the client shell redirects a protected route to `/signon?next=<path>` and returns there afterwards. Administration pages sit behind a separate form login (at `/admin/login`, and in place on the `/admin` launcher): the admin sign-on is another field on the same session, and a user needs the `administrator` role in `user_role` (`server/admin/auth.ts`). The admin sign-on has its own idle limit of 54 minutes, independent of the customer's 15; an expired admin sign-on is dropped on the next admin request, which answers that the session timed out. Admin APIs answer 401 when no admin is signed in and 403 when the signed-in user lacks the role; the admin pages show the login form or the access-refused frame accordingly. Everything else is public. A "remember my user name" cookie (`bp_signon`, 31 days) is the only cookie besides the session cookie. Behaviour: `openspec/specs/customer-account/`. Implementation: `server/customer/`.

## Database

`db/schema.ts` defines Drizzle tables; `db/client.ts` opens the SQLite connection, runs pending migrations from `drizzle/`, and turns on SQLite foreign-key enforcement, and seeds sample data (demo users, the sample catalog, the sample sign-on users) when a table is empty. The template's demo routes import `db` and the table objects directly (see `routes/api/users/`); capability data goes through its module instead (`server/catalog/`, and `server/customer/repository.ts` for customers — see Key Decisions).

- `bun run db:generate` — after editing `db/schema.ts`, generates a new migration into `drizzle/` (via `drizzle-kit`, config in `drizzle.config.ts`)
- `bun run db:studio` — browse the db in Drizzle Studio
- The db file itself is `sqlite.db` at the project root (gitignored, created on first run); `drizzle/` migrations are committed
- Under Vitest (`VITEST=true`), `db/client.ts` swaps in an in-memory db instead, so tests never touch the dev database

**Entity model.** The catalog is `category` → `product` → `item`. Each product belongs to exactly one category and each item to exactly one product, both enforced by NOT NULL foreign keys. Localised text and prices live in per-locale detail tables keyed by (id, locale), with no cross-locale fallback. `inventory` holds one supplier stock row per item id, never negative; it is keyed by item id without a catalog foreign key, so supplier stock can exist for an id the catalog does not list. The sample catalog is seeded from a committed JSON file when the tables are empty. Behaviour: `openspec/specs/catalog-browsing/`. Implementation: `server/catalog/`.

**Customer model.** A customer is keyed by its sign-on user name and owns exactly one account (status `active` or `disabled`, one contact with one address, one credit card) and one profile (language, favourite category, My List and banner flags). Removing a customer removes all of them. Mandatory contact, address and card fields are enforced in `server/customer/model.ts`, because a new customer starts with empty ones. All customer reads and writes go through `server/customer/repository.ts`. Behaviour: `openspec/specs/customer-account/`.

**Order model.** A purchase order is keyed by its order number and references a billing contact, a shipping contact and a payment card. These are order-owned rows, separate from the customer's contact and card. It has zero-based numbered line items, each with quantity > 0 and quantity shipped ≤ quantity. Each order has one `order_status` row holding one of PENDING, APPROVED, DENIED, SHIPPED_PART or COMPLETED. Order numbers and other identifiers come from named counters in `id_counter`. All order reads and writes go through `server/checkout/repository.ts`. Behaviour: `openspec/specs/order-checkout/`.

**Supplier model.** A supplier order has the numeric id of the purchase order it came from, an order date, a status of PENDING or COMPLETED, one supplier contact and numbered lines (category, product, item, quantity, unit price, quantity shipped). Supplier rows are separate from order rows, as order rows are from customer rows. All supplier reads and writes go through `server/fulfillment/repository.ts`. Behaviour: `openspec/specs/order-fulfillment/` (after this sprint lands).

**Jobs.** Batch jobs and operational checks are pure functions in `server/jobs/`. Each is given plain data, its settings and a `notify` callback, and returns an exit code: 0 ok, 4 problem found, 8 failure. A thin script in `scripts/` reads the database through the owning repositories, sends mail through `server/notifications/transport.ts`, and exits with that code. Batch settings (retention, stuck threshold, output folder, ops and finance mailboxes) come from the environment through one settings module. The jobs never run inside the web server. One nightly entry point, `server/jobs/schedule.ts`, is started by the host at 01:00 and decides the chain: backup, then the order extract, then the aging report, the inventory report and the Sunday purge. Each later job runs only when the job it depends on exited 0. Behaviour: `openspec/specs/order-reporting-batch/` (after this sprint lands).

## Order hand-off

Checkout never stores the order itself. `placeOrder` (`server/checkout/service.ts`) prices, numbers and stamps the order, then hands an XML purchase-order message to a queue. The production queue is an in-process transactional outbox:

- each message is a row in `order_message`;
- a drain on the next tick, and on server start, passes queued rows to `receiveOrderMessage`;
- `receiveOrderMessage` stores the order with status PENDING and marks the row delivered;
- a failed receipt stays queued and is retried, and redelivering an order already stored is ignored.

No external broker exists. The session cart is emptied only after the message is queued.

## Order approval

Order processing decides each received order in two steps:

- receipt stores the order with status PENDING. When the order is under its locale's limit, the same transaction puts an OrderApproval document on the `order-approval` queue;
- that queue's drain applies each decision only to a PENDING order. In one transaction it updates `order_status` and publishes the applied decision on the `order-decision` queue.

Administrator decisions enter through `order-approval` as well: the admin order-management relay (rules in `server/lib/admin-requests.ts`, hand-off in `server/admin/orders.ts`) puts one OrderApproval document per update-status request on that queue (the order lists send approvals and denials as two requests) and replies SUCCESS once it is queued, not once it is applied. The same transaction publishes each applied decision once per consumer: on `order-decision` for fulfilment and on `order-status-mail` for customer e-mails. The rules live in `server/approval/service.ts`. Behaviour: `openspec/specs/order-approval/`.

Every queue is a set of rows in one database outbox, `queue_message`, keyed by queue name. A message commits or rolls back with the caller's transaction, and a failed send is raised to the caller. A row has one status, so each queue has exactly one consumer.

## Order fulfilment

Fulfilment consumes `order-decision` and runs in three queued steps, each drain one transaction per row:

- an APPROVED decision becomes a supplier purchase-order document on `supplier-purchase-order` (a DENIED one is consumed and ignored);
- that drain stores the supplier order as PENDING and tries to ship it at once. A line ships only in full, only when stock covers it, and stock is deducted. Each attempt that ships something puts one invoice, listing only the lines shipped in that attempt, on `invoice`;
- the `invoice` drain adds the shipped quantities to the order's lines and sets `order_status` to SHIPPED_PART or COMPLETED. It publishes `shipped` on `order-status-mail` for every invoice and `completed` only when the order completed.

An administrator's inventory save sets the quantities and re-attempts every PENDING supplier order in the same transaction. The rules are pure functions in `server/fulfillment/` over an injected store; `store.ts` adapts them to the database. Documents on these queues are XML. The drains start with the server from `middleware/fulfillment.ts`; because the approval drain has no hook to signal fulfilment, `order-decision` is also polled once a second (polling is off under Vitest). Behaviour: `openspec/specs/order-fulfillment/` (after this sprint lands).

## Customer e-mail

Order-status e-mail runs in two steps:

- the `order-status-mail` drain turns an order event (approved, denied, shipped, completed) into a Mail document on the `mail` queue, only when that event's switch is on;
- the `mail` drain sends the document as HTML over SMTP.

The three switches (`SEND_APPROVAL_MAIL`, `SEND_CONFIRMATION_MAIL`, `SEND_COMPLETED_ORDER_MAIL`) are deployment configuration and off by default. SMTP is configured by `MAIL_SMTP_URL` and `MAIL_SENDER`. A delivery failure, including no configured server, is logged and the mail dropped, never retried and never failing the order. A malformed Mail document is an error and stays queued. The code is in `server/notifications/`. Behaviour: `openspec/specs/order-notifications/` (after this sprint lands).

Four tiers, one worked example each. Commands and how to extend: [README.md](./README.md#testing), [AGENTS.md](./AGENTS.md).

## Deployment

- `ecosystem.config.js` (PM2) runs the real build: `.output/server/index.mjs`, under Bun (`interpreter: "bun"`) — required by `db/client.ts`'s `bun:sqlite` import. `nitro.service` (systemd) is the non-PM2 equivalent, same requirement.
- `ecosystem.config.js` also declares `order-batch-nightly`, which runs `scripts/nightly-chain.ts` under Bun at 01:00 (`cron_restart`, `autorestart: false`). Its batch settings come from `BATCH_RETENTION_DAYS`, `BATCH_STUCK_HOURS`, `BATCH_OUT_DIR`, `BATCH_MAIL_FINANCE` and `BATCH_MAIL_OPS`, and mail goes through `MAIL_SMTP_URL`. `nitro.service` has no batch equivalent; a non-PM2 host schedules `bun run batch:nightly` itself.
- `Dockerfile`/`docker-compose.yml` build a static `dist/` served by nginx — don't rely on them for the Nitro/DB-backed API without fixing first (they never run `.output/server/index.mjs`)

## Key Decisions

- **One session, one cookie.** Every capability attaches its per-visitor state (locale, sign-on, cart) to the session id from the session middleware and extends `GET /api/session` additively. None mints a second session. Rationale: sign-off keeps the locale, and timeout must expire everything together. Authored in change `swhr8-i-0003-localization` (design.md, L4).
- **Screen text comes from per-locale dictionaries.** Pages and the shell read user-facing strings through `useScreen()`, never as hard-coded literals. A locale without a dictionary falls back to en_US. Rationale: ja_JP and zh_CN shoppers must get every screen in their language. Authored in change `swhr8-i-0003-localization` (design.md, L5).
- **Catalog text is keyed by (entity id, locale) with no fallback.** Persistent detail rows are unique per (id, locale). A request returns only rows of the requested locale, and a null locale is an error. Rationale: the approved spec forbids substituting another language. Authored in change `swhr8-i-0003-localization` (design.md, L7).

- **One shell, mounted once as the parent route.** Every page renders inside `SiteLayout` (`src/pages/_layout.tsx`); a capability adds a page, never its own header, nav or footer. Rationale: the store reads as one product and chrome changes land in one file. Authored in change `swhr8-i-0002-bootstrap-landing-page-and` (design.md).
- **Primary areas are one data list.** A capability that ships a primary area adds one entry to `PRIMARY_AREAS`; the nav and landing page both render from it. Rationale: no second menu, no landing page drift. Authored in change `swhr8-i-0002-bootstrap-landing-page-and`.
- **All catalog reads go through one catalog module.** Routes, cart, checkout and jobs call `createCatalog({ source })` (`server/catalog/`); none queries the catalog tables directly. Rationale: locale filtering, ordering, paging and error wrapping stay in one place, and the legacy's two access modes collapse into one. Authored in change `swhr8-i-0004-catalog-browsing-and-search` (design.md, C1).
- **One database, no dialect-specific query sets.** The store runs on SQLite through Drizzle only; the legacy Cloudscape/Oracle split is not carried over. Rationale: the brief puts it out of scope and a second dialect would double every query. Authored in change `swhr8-i-0004-catalog-browsing-and-search` (design.md, D2).
- **`inventory` is created by the catalog and extended by fulfillment.** One stock row per item; later capabilities add columns by migration, never a second stock table. Rationale: the catalog check (C5) and fulfillment must read the same stock. Authored in change `swhr8-i-0004-catalog-browsing-and-search` (design.md, C2).
- **Pages reuse the shared state frames.** Loading, empty and error states use `src/components/shell` (`useLoad` for fetch state), not page-local markup. Rationale: one empty/error/retry behaviour across capabilities. Authored in change `swhr8-i-0002-bootstrap-landing-page-and`.
- **Customer data goes through one repository.** Checkout, admin and jobs read and write customers, accounts and profiles only via `server/customer/repository.ts`; none queries those tables directly. Rationale: the mandatory-field rules and cascade removal live in one place. Authored in change `swhr8-i-0005-customer-account-and-sign-o` (design.md, A1–A3).
- **Protected pages are one list, enforced on both sides.** A capability that adds a page needing sign-on adds it to that list; the server returns 401 and the shell redirects to `/signon?next=`. Rationale: the legacy kept one configured list, and the return-to-page behaviour depends on it. Authored in change `swhr8-i-0005-customer-account-and-sign-o` (design.md, A5).
- **The cart holds item ids and quantities only, in memory on the session.** Prices and line text are read from the catalog module every time the cart is listed, and checkout prices the order from those lines. Order checkout empties the session cart through `server/cart/` after hand-off and never keeps a second cart. Rationale: catalog price changes must show up in the cart, and the cart must not outlive the session. Authored in change `swhr8-i-0006-shopping-cart` (design.md, K1–K3, K8).
- **Orders reach order processing only as queued messages.** Order processing starts from `receiveOrderMessage`. Order approval extends that receipt, never the checkout request, and later capabilities read and write orders through `server/checkout/repository.ts` only. Rationale: the order is confirmed to the shopper only once its message is durably queued, and redelivery never duplicates an order. Authored in change `swhr8-i-0007-order-checkout-and-payment` (design.md, O1, O7, O8).
- **Order numbers come from the `"1001"` counter, starting at 1001.** The Finance extract and administration see the same numbers. Rationale: this follows the runbook and the locked test, pending the Business Owner's ruling. Authored in change `swhr8-i-0007-order-checkout-and-payment` (design.md, O3, S1).
- **Order contacts and cards are order-owned rows.** They are never shared with the customer's account rows. Rationale: an order's card fields are mandatory while a new customer's are empty, and an order must not change when a profile is edited. Authored in change `swhr8-i-0007-order-checkout-and-payment` (design.md, O2, S8).
- **Order decisions travel only as messages on the shared outbox.** Approve and deny, automatic or administrator, go on `order-approval`, and applied decisions come off `order-decision`. No capability writes `order_status` for a decision directly, and a new queue is a new `queue` name in `queue_message`, not a new table. Rationale: the PENDING-only guard and the all-or-nothing hand-off to fulfilment and e-mail live in one place. Authored in change `swhr8-i-0008-order-approval` (design.md, P2–P4).
- **One queue per consumer; publishers fan out.** A capability that must react to an event gets its own queue name, and the publisher writes one row per consumer queue in its own transaction. No two capabilities drain the same queue. Rationale: an outbox row has one delivery status, so a shared queue would let one consumer swallow another's message. Authored in change `swhr8-i-0009-customer-notifications` (design.md, N7).
- **Administration is one role behind one form login.** Every admin page and API checks `requireAdministrator` from `server/admin/auth.ts` (role `administrator` in `user_role`, admin sign-on on the shared session); no capability adds its own admin check or login. Rationale: the legacy protected all administration by one role with form login, and order management reuses the inventory screen's login. Authored in change `swhr8-i-0010-order-fulfillment-and-inven` (design.md, F7).
- **Admin sign-on idles out after 54 minutes, on its own clock.** The admin session state in `server/admin/auth.ts` is the only place that limit is enforced; admin pages and APIs never re-implement it. Rationale: the specification sets 54 minutes for administrators and 15 for customers on the same cookie. Authored in change `swhr8-i-0011-admin-order-management` (design.md, M2).
- **Fulfilment rules are pure over an injected store; the database store loads, mutates and saves inside one transaction.** Rationale: a stock save and its re-attempts, or one intake and its invoice, must commit together, and the locked tests drive the rules in memory. Authored in change `swhr8-i-0010-order-fulfillment-and-inven` (design.md, F1–F2).
- **Batch jobs are separate programs with literal exit codes, chained by one nightly entry point.** A new job adds a pure function in `server/jobs/`, a script in `scripts/` and a slot in the chain; it never schedules itself or runs in the web server. Rationale: operations monitors the legacy 0/4/8 codes, and the chain's dependency rules must live in one place. Authored in change `swhr8-i-0012-order-batch-jobs` (design.md, B1, B4).
