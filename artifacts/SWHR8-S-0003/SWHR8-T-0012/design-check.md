# Design check — SWHR8-T-0012

Each mockup HTML was rendered with Playwright (Chromium) beside the built screen on the dev server with the seeded legacy catalog, at the mockup's route and viewport. Screenshots are in `design-check/`. Difference codes D1–D10 are listed at the end.

## SWHR8-MCK-19 Category list

- Mockup: `mockup-category-list.html`; route `/catalog`; viewport 1440.
- Mockup screenshot: `design-check/category-list-mockup.png`
- Built screenshot: `design-check/category-list-built.png`
- Differences left: D1, D2, D3, D5, D7, D8; the mockup's two sample categories are the first two seeded categories (Birds, Cats) without blurbs.

## SWHR8-MCK-20 Category list · Mobile

- Mockup: `mockup-category-list-mobile.html`; route `/catalog`; viewport 390.
- Mockup screenshot: `design-check/category-list-mobile-mockup.png`
- Built screenshot: `design-check/category-list-mobile-built.png`
- Differences left: D1, D2, D3, D5, D8.

## SWHR8-MCK-21 Product list with MyList sidebar

- Mockup: `mockup-product-list-with-mylist-sidebar.html`; route `/category/FISH`; viewport 1440.
- Mockup screenshot: `design-check/product-list-with-mylist-sidebar-mockup.png`
- Built screenshot: `design-check/product-list-with-mylist-sidebar-built.png`
- Differences left: D1, D2, D3, D4 (sidebar not shown: no sign-on yet), D8.

## SWHR8-MCK-22 Product list with MyList sidebar · Mobile

- Mockup: `mockup-product-list-with-mylist-sidebar-mo.html`; route `/category/FISH`; viewport 390.
- Mockup screenshot: `design-check/product-list-with-mylist-sidebar-mobile-mockup.png`
- Built screenshot: `design-check/product-list-with-mylist-sidebar-mobile-built.png`
- Differences left: D1, D2, D3, D4, D8.

## SWHR8-MCK-23 Item list for a product

- Mockup: `mockup-item-list-for-a-product.html`; route `/product/FI-SW-01`; viewport 1440.
- Mockup screenshot: `design-check/item-list-for-a-product-mockup.png`
- Built screenshot: `design-check/item-list-for-a-product-built.png`
- Differences left: D1, D2 (row title is the item description), D3, D6, D8.

## SWHR8-MCK-24 Item list for a product · Mobile

- Mockup: `mockup-item-list-for-a-product-mobile.html`; route `/product/FI-SW-01`; viewport 390.
- Mockup screenshot: `design-check/item-list-for-a-product-mobile-mockup.png`
- Built screenshot: `design-check/item-list-for-a-product-mobile-built.png`
- Differences left: D1, D2, D3, D6, D8.

## SWHR8-MCK-25 Item page

- Mockup: `mockup-item-page.html`; route `/item/EST-1`; viewport 1440.
- Mockup screenshot: `design-check/item-page-mockup.png`
- Built screenshot: `design-check/item-page-built.png`
- Differences left: D1, D2 (title is the product name), D3, D6, D8, D9 (no quantity stepper or Add to cart).

## SWHR8-MCK-26 Item page · Mobile

- Mockup: `mockup-item-page-mobile.html`; route `/item/EST-1`; viewport 390.
- Mockup screenshot: `design-check/item-page-mobile-mockup.png`
- Built screenshot: `design-check/item-page-mobile-built.png`
- Differences left: D1, D2, D3, D6, D8, D9.

## SWHR8-MCK-27 Search results

- Mockup: `mockup-search-results.html`; route `/search?q=fish`; viewport 1440.
- Mockup screenshot: `design-check/search-results-mockup.png`
- Built screenshot: `design-check/search-results-built.png`
- Differences left: D1, D2, D3, D6, D7, D8.

## SWHR8-MCK-28 Search results · Mobile

- Mockup: `mockup-search-results-mobile.html`; route `/search?q=fish`; viewport 390.
- Mockup screenshot: `design-check/search-results-mobile-mockup.png`
- Built screenshot: `design-check/search-results-mobile-built.png`
- Differences left: D1, D2, D3, D7, D8.

## SWHR8-MCK-29 Catalog empty and error states

- Mockup: `mockup-catalog-empty-and-error-states.html`; route `/category/NONE (empty frame)`; viewport 1440.
- Mockup screenshot: `design-check/catalog-empty-and-error-states-mockup.png`
- Built screenshot: `design-check/catalog-empty-and-error-states-built.png`
- Differences left: D1, D10.

## SWHR8-MCK-30 Catalog empty and error states · Mobile

- Mockup: `mockup-catalog-empty-and-error-states-mo.html`; route `/category/NONE (empty frame)`; viewport 390.
- Mockup screenshot: `design-check/catalog-empty-and-error-states-mobile-mockup.png`
- Built screenshot: `design-check/catalog-empty-and-error-states-mobile-built.png`
- Differences left: D1, D10.

## Differences left

- **D1 Header and footer links.** The mockups draw Search, Cart, Account and Administration links and a "You" footer column. Those belong to later capabilities; the shell shows only the areas that exist (Home, Catalog, Language).
- **D2 Sample copy.** The mockup shows category blurbs, item names ("Large Angelfish") and two sample categories. The catalog data has no category description or item name, so cards show the name and "View products", and item rows show the item description. Built screens show the seeded legacy data.
- **D3 Heading weight.** Page titles use the shell's semibold heading style; the mockup draws them lighter. The shell token wins.
- **D4 MyList sidebar.** Not shown on `/category/FISH`: it renders only when the session reports `myList` and a favourite category, which sign-on (SWHR8-I-0005) supplies. Its markup follows the mockup and is covered by a UI test with a stubbed session.
- **D5 Banner strip.** Task 3.3 (category banner, dogs fallback) is in no mockup. It is a slim strip above the category list.
- **D6 Category labels.** Breadcrumbs and tags show the category identifier (FISH), because the product and item APIs carry the identifier only.
- **D7 Search entry points.** The search box sits on the Catalog and Search pages, as in the mockups; the shell header has no search box.
- **D8 Placeholders.** Thumbnails are tinted tiles with a category icon, as in the mockups; no image files exist to serve.
- **D9 Quantity stepper and Add to cart.** Not built (later capability).
- **D10 Empty/error frames.** The mockup shows empty, error and loading side by side on one page; the built app shows one shared shell frame at a time with catalog wording.
