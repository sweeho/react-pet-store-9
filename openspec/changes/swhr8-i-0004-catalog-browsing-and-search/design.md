## Context

Legacy implementation notes for catalog browsing. Each requirement in the spec names the extraction record it was recovered from.

## Legacy implementation

- Queries: `CatalogDAOSQL.xml` (GET_CATEGORY(IES), GET_PRODUCT(S), GET_ITEM(S), search fragments) for Cloudscape and Oracle; `CloudscapeCatalogDAO` and a generic DAO hold the paging loop and search keyword splitting.
- `CatalogHelper` bean has a direct-database path and an EJB path; page size default 2 is a bare literal in the JSPs and helper (the home sidebar uses 5 for its own list).
- Locale is set by each page's sidebar (en_US, ja_JP under ja/).
- Search matches the category identifier, not the category name, although the user guide says "category".
- The item page shows list price and unit cost (labelled as member price); no discount logic was found in this module.
- Schema: category, product, item with `_details` tables per locale; the consistency check is a SQL job with checks C1 to C5.

## User interface

No `kind: screen` records were extracted for this capability (screen count 0); its user interface is unspecified. Display behaviour that was recorded as requirements (page size, banner, item prices, MyList) is in the spec.

## Open questions

- Page size 2 and the `/Populate` unauthenticated endpoint look like demo settings.
- Requirement text spans 41 pass records; the spec uses one representative record key per behaviour.

## Codebase findings (sprint SWHR8-S-0003 planning)

- **No catalog exists yet.** `db/schema.ts` holds only the demo `users` table; `drizzle/` has one migration (`0000_petite_glorian.sql`). `db/client.ts` migrates on open and seeds when a table is empty, and uses an in-memory db under Vitest.
- **Localization already supplies the locale and formatting.** `middleware/locale.ts` puts `event.context.locale` on every request. `server/localization/locale.ts` exports `formatCurrency(amount, locale, fractionDigits)` (USD/JPY/CNY). `server/localization/catalog-text.ts` and `details.ts` are an in-memory, (entity, id, locale) keyed details store with no fallback (design L7 of change `swhr8-i-0003-localization`).
- **Shell and state frames exist.** `src/pages/_layout.tsx` (header, global nav, footer), `src/constants/primary-areas.ts` (one entry per area), `src/components/shell/{empty,error,loading}-frame.tsx` and `src/hooks/use-load.ts`. Screen strings come from `src/i18n/screens/{en_US,ja_JP,zh_CN}.ts` via `useScreen()`.
- **No sign-on exists.** `middleware/auth.ts` is a demo stub; there is no `/api/signon`, no customer and no profile. `GET /api/session` returns `{ locale }` only.
- **Locked acceptance tests fix the module boundaries** (`tests/acceptance/catalog-browsing/`): `server/catalog/catalog.ts` (`createCatalog({ source })`, `paginate`, `CatalogError`), `server/catalog/store.ts` (`createCatalogStore()` with `addCategory`, `addProduct`, `addItemLocale`, throwing synchronously), `server/jobs/catalog-check.ts` (`runCatalogCheck({ catalog, populate })` → `{ exitCode, log }`, log lines prefixed `C1 `…`C5 `). The browser spec fixes `POST /api/test/seed`, routes `/catalog`, `/category/:id`, `/item/:id`, test ids `product-row`, `list-price`, `unit-cost`, `mylist`, and links named `Next` / `Previous`.
- **`tests/acceptance/inventory-reporting/catalog-check.test.ts`** (owned by SWHR8-I-0013) uses the same `runCatalogCheck` and expects exit code 8 when the tables are missing and `populate` fails. This change keeps the `populate` parameter in the signature; that branch is I-0013's.
- **Legacy sample data** is on branch `vortex/legacy-spec/sx-0001`: `legacy-source/app/src/apps/petstore/src/docroot/populate/Populate-UTF8.xml` (5 categories, 16 products, 28 items in en-US, ja-JP and zh-CN; one ja-JP item record is missing) and `legacy-source/app/src/apps/supplier/src/docroot/populate/Populate-UTF8.xml` (supplier inventory).
- **CI** (`.github/workflows/ci.yml`) already runs on pull requests to `vortex/**` and runs unit, E2E and both acceptance tiers. No CI change is needed.

## Decisions

- **C1 One catalog module behind a source seam.** `createCatalog({ source })` holds the locale filter (applied again even when the source pre-filters), name ordering, paging, search and error wrapping. Production passes a Drizzle-backed source over SQLite, and tests pass in-memory rows. This one module serves both the HTTP routes and in-process callers (later cart, checkout, jobs). That is how "Access modes" is met (identical results by construction), with no EJB/direct split. See Spec discrepancies D1.
- **C2 Schema: base tables plus per-locale detail tables.** `category`, `product` (FK `category_id` NOT NULL), `item` (FK `product_id` NOT NULL); `category_details`, `product_details`, `item_details` keyed (id, locale) with NOT NULL `list_price`, `unit_cost`, `image`, `description` on items. An `inventory` table (`item_id` PK/FK, `qty`) is created here because the check's C5 needs it, and fulfillment (SWHR8-I-0010) extends it rather than re-creating it. Generated with drizzle-kit and committed as a migration. `createCatalogStore()` is the in-process validating writer the tests use, and the DB constraints enforce the same rules.
- **C3 Paging.** `paginate(rows, start, count)` returns `{ rows, hasNext, hasPrevious }`; a negative start or `start >= rows.length` (with a non-empty list) returns an empty page. The default page size is 2 for every list (`CATALOG_PAGE_SIZE`); the MyList sidebar uses its own limit of 10. Pages carry `?start=` in the URL so Next/Previous are links.
- **C4 Search.** Split the trimmed query on whitespace into distinct lowercased keywords; an empty list returns an empty page before any source read. An item matches when any keyword is a substring of the lowercased product name, category **identifier** or item description in the requested locale. Results are paged with C3.
- **C5 Prices.** Item API returns raw `listPrice`/`unitCost`. The item page formats both with `formatCurrency` (2 fraction digits for en_US and zh_CN, 0 for ja_JP), labelled "List price" and "Member price", and keeps test ids `list-price` and `unit-cost`.
- **C6 Catalog check is a pure function plus a thin CLI.** `runCatalogCheck({ catalog, populate })` takes plain data (`categories[{id, locales}]`, `products`, `items[{id, productId, locales, prices per locale}]`, `inventoryItemIds`). It logs one line per finding (`C1 <categoryId>` … `C5 <itemId>`) under the five headings and returns a non-zero `exitCode` when any is found. A script reads the SQLite db into that shape and exits with the code, so it can run on demand or overnight. Scheduling is out of scope (SWHR8-I-0012/0013).
- **C7 Seed.** Convert the legacy `Populate-UTF8.xml` catalog and supplier inventory into a committed JSON seed. `db/client.ts` loads it when the catalog tables are empty, as it does for users. `POST /api/test/seed` replaces the catalog with the posted rows; it is refused (404) when `NODE_ENV === "production"`.
- **C8 Screens.** Routes `/catalog` (category list), `/category/:id` (product list), `/product/:id` (item list), `/item/:id` (item page), `/search?q=` (results). The catalog becomes a `PRIMARY_AREAS` entry ("Catalog browsing & search", `/catalog`). The landing page gains a "Browse the catalog" button, and the shell header gains a search box submitting to `/search`. Unknown ids and empty lists use `EmptyFrame`; load failures use `ErrorFrame` with Try again (via `useLoad`). All strings come from the three screen dictionaries. The `/catalog` page's main heading contains "Catalog" in en_US and "カタログ" in ja_JP, and the page renders with `<html lang>` set to the session locale (cases SWHR8-C-0019 and SWHR8-C-0020 in `tests/acceptance/localization/localization.spec.ts`, deferred here by change `swhr8-i-0003-localization`).
- **C9 MyList sidebar.** Rendered on `/catalog` and `/category/:id` when the session reports `myList: true` and a `favoriteCategory`. It lists up to 10 products of that category (`data-testid="mylist"`, one `<li>` per product). Until SWHR8-I-0005 adds those session fields the sidebar does not render; it is unit-tested with a stubbed session. Acceptance case SWHR8-C-0233 is deferred to SWHR8-I-0005.
- **C10 Banner.** The category banner (task 3.3) shows the banner image of the shopper's favourite category, falling back to the dogs banner when none is set. With no profile yet, every shopper sees the dogs banner.

## Phases

1. **Data model** (tasks 1.x): schema, migration, `store.ts`, `catalog-check.ts` + CLI. Locked tests C-0236, C-0246, C-0245 go green.
2. **Catalog queries** (tasks 2.x): `catalog.ts` and the Drizzle source; API routes under `routes/api/catalog/` with route integration tests. Locked tests C-0232, C-0234, C-0235, C-0237–C-0241, C-0243 go green.
3. **Presentation** (tasks 3.x): pages, pager, price display, banner, MyList sidebar, header search, nav entry, landing button, dictionaries; UI tests per page. Locked browser cases C-0242, C-0244, C-0247 go green.
4. **Configuration and seed** (tasks 4.x): JSON seed + loader, `POST /api/test/seed`, source selection by configuration.
5. **Test harness**: unit (`paginate`, search, store validation, check), route integration tests (real `H3Event`, in-memory db), UI tests per page, and one `e2e/catalog.spec.ts` journey (landing → category → product → item, and a search). The locked acceptance suites under `tests/acceptance/catalog-browsing/` must pass unchanged.
6. **CI**: no workflow change. The existing workflow already runs unit, E2E and both acceptance tiers on pull requests to `vortex/**`; the ticket is done when that run is green.

## Spec discrepancies

- **D1 Access modes (SWHR8-R-0038).** The spec requires a direct-to-database and an EJB access mode. The new store has one runtime and no EJB tier, and the brief puts "the old system's two ways of reading the catalog" out of scope. Met as C1: one catalog module used by routes and in-process callers, so results are identical by construction. Recommend removing or rewording the requirement.
- **D2 Database-specific SQL (SWHR8-R-0039).** The spec requires Cloudscape and Oracle statement sets chosen by configuration and a configured DAO class. The new store runs on SQLite only and the brief puts database-specific setup out of scope. The scenario's THEN ("the Oracle statements are used") cannot be met literally. Implemented as the configured `source` seam (task 4.1) with a single SQLite source. Recommend removing the requirement or rewording it to "the configured catalog source is used".
- **D3 Task 3.3 has no requirement.** "Show category banner with dogs fallback" is a task with no requirement in the delta spec. Its tasks.md line carries only the ticket key. The banner preference belongs to the customer profile (SWHR8-I-0005).
- **D4 Search matches the category identifier, not its name.** The brief says "the category"; the spec (R-0037, R-0042) and the legacy SQL use the identifier. The spec is followed.
- **D5 "Member price" is the unit cost.** R-0170 shows the item's unit cost as the member price, so shoppers see the store's cost. The spec and locked test (`unit-cost`) are followed; the label is "Member price".
- **D6 MyList needs sign-on.** R-0030 needs a signed-in customer with a profile, which SWHR8-I-0005 builds. Case SWHR8-C-0233 is deferred there; the sidebar ships against the session contract (C9).
- **D7 Locales.** The brief names en_US, ja_JP and zh_CN; this design's Legacy section says en_US and ja_JP only. The legacy sample data carries all three, so all three are seeded.
- **D8 Page size 2 is a demo value** (Open questions above). The spec fixes 2 and the locked tests assert it, so 2 ships as a named constant.
