# PLAN — SWHR8-T-0012 Catalog browsing and search

## Objective

Deliver the whole change `swhr8-i-0004-catalog-browsing-and-search`: catalog schema and seed, locale-filtered paged queries and search, the catalog consistency check, and the five catalog screens inside the shared shell. Read the change's `design.md` first, including **Decisions C1–C10** and **Spec discrepancies D1–D8**. They are not repeated here.

## Steps

Work the `tasks.md` groups in order.

1. **Data model** (tasks 1.1–1.3; design C2, C6)
   - Add the catalog tables to `db/schema.ts` and generate the migration into `drizzle/`.
   - `server/catalog/store.ts`: `createCatalogStore()` with synchronous validation, as the locked test expects.
   - `server/jobs/catalog-check.ts` (pure function) and `scripts/catalog-check.ts` (CLI that reads SQLite and exits with the code). Add a `catalog:check` package script running it under bun.
2. **Catalog queries** (tasks 2.1–2.5; design C1, C3, C4)
   - `server/catalog/catalog.ts`: `createCatalog`, `paginate`, `CatalogError`, `CATALOG_PAGE_SIZE`.
   - `server/catalog/source.ts`: the Drizzle-backed `source.select(table, locale)`.
   - Routes under `routes/api/catalog/`, reading `event.context.locale`, each with an integration test.
3. **Presentation** (tasks 3.1–3.4; design C5, C8, C9, C10)
   - Pages and `src/components/catalog/` (pager, price, banner, MyList sidebar).
   - Header search box in `_layout.tsx`, the `PRIMARY_AREAS` entry, the landing "Browse the catalog" button, and keys in all three screen dictionaries.
   - Match the mockups below.
4. **Configuration and seed** (tasks 4.1–4.2; design C1, C7)
   - Convert the legacy `Populate-UTF8.xml` files into `db/seed/catalog.json` (fetch branch `vortex/legacy-spec/sx-0001`; paths in design.md Codebase findings) and load it in `db/client.ts` when the catalog is empty.
   - Add `routes/api/test/seed.post.ts`, refused in production.
5. **Tests**: unit/UI/route tests per the AGENTS.md table, plus `e2e/catalog.spec.ts` (browse journey and one search). The locked suites in `tests/acceptance/catalog-browsing/` must pass unchanged; do not edit them. Two localization browser cases deferred here, SWHR8-C-0019 and SWHR8-C-0020 (`tests/acceptance/localization/localization.spec.ts`), are linked to this ticket. They need `/catalog` to show a heading containing "Catalog" (en_US) / "カタログ" (ja_JP) (design C8). SWHR8-C-0233 (MyList e2e) is deferred to SWHR8-I-0005; cover the sidebar with a UI test using a stubbed session instead.

## File/module ownership

- `db/schema.ts`, `db/client.ts`, `db/seed/catalog.json` (new), `drizzle/0001_*.sql` + `drizzle/meta/*` (generated)
- `server/catalog/` (new: `catalog.ts`, `store.ts`, `source.ts`, tests), `server/jobs/catalog-check.ts` (new, + test), `scripts/catalog-check.ts` (new), `package.json` (one script)
- `routes/api/catalog/**` (new, + tests), `routes/api/test/seed.post.ts` (new, + test), `routes/api/session.get.ts` (only if needed for the MyList fields, additive)
- `src/pages/catalog/`, `src/pages/category/[id].tsx`, `src/pages/product/[id].tsx`, `src/pages/item/[id].tsx`, `src/pages/search.tsx` (new, + tests)
- `src/components/catalog/` (new, + tests)
- `src/pages/_layout.tsx` (+ test), `src/pages/index.tsx` (+ test), `src/constants/primary-areas.ts`, `src/i18n/screens/{en_US,ja_JP,zh_CN}.ts`
- `e2e/catalog.spec.ts` (new)
- Read only: `tests/acceptance/**`, `server/localization/**`, `src/components/shell/**`, `src/hooks/use-load.ts`

## Design reference

Mockups are in `artifacts/SWHR8-S-0003/design/` (see `MANIFEST.md` there). Render each route beside its mockup at the viewport listed.

| Mockup file                                       | Route / state                  | Viewport |
| ------------------------------------------------- | ------------------------------ | -------- |
| `mockup-category-list.html`                       | `/catalog`                     | 1440     |
| `mockup-category-list-mobile.html`                | `/catalog`                     | 390      |
| `mockup-product-list-with-mylist-sidebar.html`    | `/category/FISH`, MyList shown | 1440     |
| `mockup-product-list-with-mylist-sidebar-mo.html` | `/category/FISH`, MyList shown | 390      |
| `mockup-item-list-for-a-product.html`             | `/product/FI-SW-01`            | 1440     |
| `mockup-item-list-for-a-product-mobile.html`      | `/product/FI-SW-01`            | 390      |
| `mockup-item-page.html`                           | `/item/EST-1`                  | 1440     |
| `mockup-item-page-mobile.html`                    | `/item/EST-1`                  | 390      |
| `mockup-search-results.html`                      | `/search?q=fish`               | 1440     |
| `mockup-search-results-mobile.html`               | `/search?q=fish`               | 390      |
| `mockup-catalog-empty-and-error-states.html`      | empty list / failed load       | 1440     |
| `mockup-catalog-empty-and-error-states-mo.html`   | empty list / failed load       | 390      |

Controls for later capabilities (cart, account, quantity stepper) are not built.

## Definition of Done

- AC-1 … AC-18 of the ticket hold. Each is one scenario of the delta spec. AC-2 (MyList) is met by the sidebar's UI test until SWHR8-I-0005 enables its e2e case. AC-11 and AC-12 are met as design.md D1/D2 describe.
- Every `tasks.md` line of the change is implemented.
- The locked acceptance tests in `tests/acceptance/catalog-browsing/` (except the deferred SWHR8-C-0233) and the localization cases SWHR8-C-0019 and SWHR8-C-0020 pass unchanged, and the CI run on the ticket's pull request is green.
