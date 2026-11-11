# Design notes: legacy implementation of customer-account

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The legacy forms (sign-on, create account, customer profile) exist as JSPs, but only their rules (mandatory fields, duplicate-account and error redirects) were captured as requirements.

## Legacy implementation notes

- Data: EJB 2.0 CMP beans Customer, Account, Profile, ContactInfo, Address, CreditCard under `components/customer` and `components/contactinfo`; schema in `db/schema/petstore_oracle.sql`. Relationships are cascade-delete per ejb-jar.
- Sign-on: `components/signon` (SignOnFilter, UserEJB, CreateUserServlet), protected resources listed in the petstore `signon-config.xml`. Passwords and card numbers are stored in clear text.
- Petstore web tier: SignOnEJBAction, CreateUserEJBAction, CustomerHTMLAction, CustomerEJBAction, SignOffHTMLAction, BannerHelper; session timeout in web.xml and `conf/petstore.properties` (15 minutes, two places).
- Source records are duplicated across passes with colliding keys (e.g. CUST-ENT-0001 exists in db/a and contactinfo/b); the spec picks one record per behaviour. 61 distinct keys were read in parseable pass files against 39 ingested by the server; three pass files (catalog/a, encodingfilter/b, batch/a) did not parse and contain no customer-account records of interest.
- Not written as requirements (minor, duplicated or low-reachability): contact creation variants, the empty-address default, the contact XML interchange format and the address-service-missing failure (contactinfo/b), cascade-delete of the address is covered by the Cascade removal requirement.

## Conflicts for Intent

- Form makes e-mail optional; DDL makes contact e-mail NOT NULL and address country mandatory.
- Account status "disabled" exists but no code path setting it was found.
- Session timeout configured in two places.

## Record key collisions

Several record keys are reused by different passes or modules for different behaviour (CUST-ENT-0001, CUST-ENT-0002, CUST-REQ-0002, CUST-REQ-0004 to CUST-REQ-0006, CUST-RULE-0002, CUSTOMER-ACCOUNT-REQ-0001, CUSTOMER-ACCOUNT-REQ-0002, CUSTOMER-ACCOUNT-ENTITY-0001). Each key is written once in spec.md. The sign-on and database-schema readings were used; the contact-information readings (address removal with contact, empty address on creation, XML contact exchange, address service lookup failure) share those keys and are not separately stated. The platform should give them distinct keys.

## Codebase findings (sprint SWHR8-S-0004 planning)

- **No customer or sign-on code exists.** `db/schema.ts` holds the demo `users` table plus the catalog tables; `drizzle/` has migrations `0000` and `0001`. `middleware/auth.ts` is a template stub that sets `event.context.user = { name: "Yeasin" }`, read only by the demo `routes/api/hello.ts`.
- **Foreign keys are not enforced.** `db/client.ts` opens `bun:sqlite` without `PRAGMA foreign_keys = ON`, so `ON DELETE CASCADE` would silently do nothing today. It migrates on open, seeds when a table is empty, and uses `:memory:` under Vitest.
- **One session already exists.** `middleware/locale.ts` resolves the `petstore_sid` cookie through `sharedSessions()` (`server/localization/sessions.ts`, in-memory, clock passed in, 30-minute idle timeout) and sets `event.context.sessionId` / `locale`. `GET /api/session` (`routes/api/session.get.ts`) returns `{ locale }` and says later capabilities extend it. ARCHITECTURE.md Key Decision "One session, one cookie" binds this change.
- **The catalog already waits for this capability.** `src/components/catalog/use-catalog-session.ts` reads `myList` and `favoriteCategory` from `GET /api/session`; `src/components/catalog/banner.tsx` and the MyList sidebar render from them. Case SWHR8-C-0233 (`tests/acceptance/catalog-browsing/catalog.spec.ts`) was deferred here by change `swhr8-i-0004-catalog-browsing-and-search` (D6): it signs on as `shopper` and expects 10 FISH products in the sidebar.
- **`/api/users/[id]` is template demo code** keyed by the numeric id of the demo `users` table. The locked browser spec needs `GET /api/users/:name` → 200 / 404 for sign-on users.
- **Shell.** `src/pages/_layout.tsx` draws the header (brand, nav from `PRIMARY_AREAS`, language control); there is no sign-in control. `src/pages/users/*` are template demo pages unrelated to customers.
- **Test-only routes** follow `routes/api/test/seed.post.ts`: refused with 404 when `NODE_ENV === "production"`.
- **Locked acceptance tests fix the module boundaries** (`tests/acceptance/customer-account/`): `server/customer/model.ts` (pure: `validateNewUser`, `createAccount`, `setAccountStatus`, `createProfile`), `server/customer/repository.ts` (async Drizzle: `saveSignOnUser`, `getSignOnUser`, `createCustomer`, `getCustomer`, `updateCustomer`, `removeCustomer`, `saveProfile`, `getProfile`, `saveAddress`, `getAddress`, `saveContact`, `getContact`, `getCreditCard`, `saveAccount`), `server/customer/auth.ts` (`createAuth()` with `start`, `signOn`, `register`, `session`; `rememberedUserName`; `bannerFor`). The browser spec fixes routes `/signon`, `/signon/error`, `/register`, `/account/duplicate`, `/account`, `/order`; labels "User name", "Password", "Remember my user name", "My list", "Banner"; buttons "Sign on", "Create account", "Save"; headings "Sign-on Error", "Duplicate Account", "My Account"; APIs `POST /api/signon`, `POST /api/signoff`, `GET /api/session`, `GET /api/profile`, `GET /api/users/:name`, `POST /api/test/clock`. The browser tests run `fullyParallel` against one server.
- **CI** (`.github/workflows/ci.yml`) runs on pull requests to `vortex/**` and already runs unit, E2E and both acceptance tiers. No CI change is needed.

## Decisions

- **A1 Three server modules, as the locked tests name them.** `server/customer/model.ts` holds pure rules and defaults; `repository.ts` is the only code that touches the customer tables; `auth.ts` holds session sign-on state and the clock-driven expiry. Routes are thin wrappers over them.
- **A2 Schema.** New tables `signon_user` (`user_name` PK, `password` NOT NULL), `customer` (`user_name` PK, FK → `signon_user` ON DELETE CASCADE), `account` (FK `user_name` UNIQUE ON DELETE CASCADE, `status` CHECK `active`|`disabled`, FKs to `contact` and `credit_card`), `contact` (names, phone, e-mail, FK `address_id` UNIQUE), `address`, `credit_card`, `profile` (FK `user_name` UNIQUE ON DELETE CASCADE, `language` NOT NULL, `favorite_category` nullable, `my_list` and `banner` NOT NULL). Removing a customer deletes its account, profile, contact, address and card (explicit deletes in one transaction for the parent-side rows, cascades for the rest). `db/client.ts` turns on `PRAGMA foreign_keys = ON`. Generated with drizzle-kit and committed. Passwords and card numbers stay clear text as in the legacy (brief non-scope); see D6.
- **A3 Mandatory fields are enforced in code, not columns, for contact/address/card.** A new customer owns _empty_ contact, address and card rows (R-0054), so those columns are nullable. `saveContact`, `saveAddress`, `saveAccount` and `updateCustomer` validate through `model.ts` and reject with a message naming the first missing field.
- **A4 Sign-on state rides the existing session.** `auth.ts` keys sign-on state by the `petstore_sid` session id; no second cookie. A signed-on session idle for 15 minutes (≥ 900 000 ms) loses its sign-on and its session-scoped cart slot on the next request. The locale session keeps its own 30-minute rule from the localization spec (D3).
- **A5 Protected pages are one list.** `/account`, the profile save (`PUT /api/profile` / `POST /api/customer`), `/order` and `/signon/welcome` (R-0059, R-0177, R-0178). The server rejects protected API calls with 401; the client guard in the shell redirects protected routes to `/signon?next=<path>` and returns there after sign-on or registration. A `next` that is the profile _save_ action resolves to `/` (D2).
- **A6 Test clock is per session.** `POST /api/test/clock { advanceMinutes }` adds an offset to the calling session's clock only (404 in production), so the parallel browser tests never expire each other's sessions.
- **A7 Sample data.** `db/client.ts` seeds `j2ee/j2ee` and `shopper/shopper` when `signon_user` is empty. `shopper` gets a full customer record (contact, address, card) and profile en_US / FISH / My List on / banner on, so the profile form saves unchanged (C-0031) and the MyList sidebar renders (C-0233).
- **A8 Session API grows additively.** `GET /api/session` returns `{ locale, signedOn, userName?, cartCount, myList?, favoriteCategory?, banner? }`. `cartCount` is 0 until the cart (SWHR8-I-0006) attaches to the same session.
- **A9 Screens.** `/signon` (returning-customer form + "Create an account" link to `/register`), `/signon/error`, `/register` (step 1: user name and password), `/account/new` (step 2: customer form), `/account/duplicate`, `/account` (My Account profile form), `/signon/welcome`. The shell header gains a "Sign in" link or a "Hi, <user name> ▾" menu with My account and Sign off, and a "Customer account & sign-on" `PRIMARY_AREAS` entry. All strings come from the three screen dictionaries. Layout follows the exported mockups in `artifacts/SWHR8-S-0004/design/`, with the text overrides in D1.
- **A10 Administrator role (task 4.2).** No admin or supplier function exists in this repository yet and no requirement of this change states the rule. The ticket adds no role code; SWHR8-I-0011 (Admin order management) enforces it when it builds those functions (D4).

## Phases

1. **Data model** (tasks 1.x): schema + migration, FK pragma, `model.ts`, `repository.ts`, sample users. Locked tests in `model.test.ts` and `storage.test.ts` go green.
2. **Registration and sign-on** (tasks 2.x): `auth.ts`, the remember cookie, sign-off, 15-minute expiry, `/api/signon`, `/api/signoff`, `/api/register`, `/api/users/:name`, `/api/test/clock`, session middleware wiring. Locked tests in `session.test.ts` go green.
3. **Customer profile management** (tasks 3.x): customer create/update routes, `/api/profile`, checkbox semantics, locale on sign-on, banner selection, post-creation return; pages and dictionaries.
4. **Access control** (tasks 4.x): the protected list, server 401s, client guard, header control.
5. **Test harness** (task 5.1): unit tests for `model.ts`; route integration tests (real `H3Event`, in-memory db) for every new route; UI tests per new page and for the header control; one `e2e/account.spec.ts` journey (register → customer form → welcome → sign off → sign on). The locked suites under `tests/acceptance/customer-account/` and C-0233 in `tests/acceptance/catalog-browsing/` pass unchanged; C-0047 is deferred to SWHR8-I-0006.
6. **CI**: no workflow change. The ticket is done when the existing pull-request run is green.

## Spec discrepancies

- **D1 Screen text: mockups vs locked tests.** The mockups title the error page "Sign on failed" and the duplicate screen "That user name is already taken", and draw the new-customer form inline on `/signon` with a "Continue" button. The locked browser spec expects headings "Sign-on Error" and "Duplicate Account", a separate `/register` page with a "Create account" button, and exactly one "User name" field on `/signon`. The locked tests win: layout follows the mockups, headings and the registration entry follow the tests.
- **D2 Return after sign-on.** The brief says a shopper whose target was "the profile itself" goes to the main screen; R-0047 says the same for registration. Locked case C-0061 expects sign-on from `/account` to land on `/account`. Read as the legacy rule: the profile _save action_ resolves to the main screen, the profile _screen_ is returned to.
- **D3 Session timeout.** This change says 15 minutes (R-0172, R-0174, R-0171, R-0185); the localization spec of record says 30 minutes for the session and its locale. Implemented as A4: sign-on and cart expire at 15 minutes, the locale at 30. PRODUCT.md lists this as an open question; an SME should pick one figure.
- **D4 Task 4.2 has no requirement.** "Enforce administrator role for admin and supplier functions" (story S3) is not stated by any requirement here, and the proposal says it may belong to admin-order-management. Its tasks.md line carries only the ticket key (A10).
- **D5 E-mail optional on the form, mandatory on the contact.** R-0175 makes e-mail optional on the customer form; R-0179 and R-0052 make it mandatory on the stored contact (the legacy DDL said NOT NULL while the form allowed blank). Implemented as the legacy did: a contact with no e-mail value is rejected (C-0059), and a blank form e-mail is stored as an empty string. Recommend the SME confirm.
- **D6 Clear-text passwords and card numbers.** The legacy stored both in clear text and the specification does not ask otherwise. Kept for parity; hashing is raised as an improvement, not done here.
- **D7 Sign-off and the cart.** R-0060 clears the cart, which SWHR8-I-0006 builds. Sign-off clears the session's cart slot now; case C-0047 (needs `POST /api/cart/items`) is deferred to SWHR8-I-0006.
- **D8 Order page.** `/order` is protected here (R-0177) but built by SWHR8-I-0007. C-0034 and C-0057 only assert the redirect and the URL, so they are met before the page exists.
