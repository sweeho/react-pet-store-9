# Design check — SWHR8-T-0012

Mockup HTML rendered with Playwright (Chromium) beside the built screen on the dev server with the seeded legacy catalog. Screenshots are in `design-check/` as `<name>-mockup.png` and `<name>-built.png` (mobile: `<name>-mobile-…`). Viewports: 1440×900 desktop, 390×844 mobile.

| Mockup                                                 | Route / state            | Pair                                                                         |
| ------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------- |
| `mockup-category-list.html` / `-mobile`                | `/catalog`               | `design-check/category-list{,-mobile}-{mockup,built}.png`                    |
| `mockup-product-list-with-mylist-sidebar.html` / `-mo` | `/category/FISH`         | `design-check/product-list-with-mylist-sidebar{,-mobile}-{mockup,built}.png` |
| `mockup-item-list-for-a-product.html` / `-mobile`      | `/product/FI-SW-01`      | `design-check/item-list-for-a-product{,-mobile}-{mockup,built}.png`          |
| `mockup-item-page.html` / `-mobile`                    | `/item/EST-1`            | `design-check/item-page{,-mobile}-{mockup,built}.png`                        |
| `mockup-search-results.html` / `-mobile`               | `/search?q=fish`         | `design-check/search-results{,-mobile}-{mockup,built}.png`                   |
| `mockup-catalog-empty-and-error-states.html` / `-mo`   | `/category/NONE` (empty) | `design-check/catalog-empty-and-error-states{,-mobile}-{mockup,built}.png`   |

## Differences left

- **D1 Header and footer links.** The mockups draw Search, Cart, Account and Administration links and a "You" footer column. Those belong to later capabilities; the shell shows only the areas that exist (Home, Catalog, Language).
- **D2 Sample copy.** The mockup shows category blurbs ("Exotic varieties…"), item names ("Large Angelfish") and two sample categories. The catalog data has no category description or item name, so the card shows the name and "View products", and item rows show the item description. Built screens show the seeded legacy data.
- **D3 Heading weight.** Page titles use the shell's semibold heading style; the mockup draws them lighter. The shell token wins.
- **D4 MyList sidebar.** Not shown on `/category/FISH`: it renders only when the session reports `myList` and a favourite category, which sign-on (SWHR8-I-0005) supplies. Its markup follows the mockup and is covered by a UI test with a stubbed session.
- **D5 Banner strip.** Task 3.3 (category banner, dogs fallback) is not in any mockup. It is a slim strip above the category list.
- **D6 Category labels in breadcrumbs.** Breadcrumbs and tags show the category identifier (FISH), because the item and product APIs carry the identifier only.
- **D7 Search entry points.** The search box sits on the Catalog and Search pages, as in the mockups; the shell header has no search box.
- **D8 Placeholders.** Thumbnails are tinted tiles with a category icon, as in the mockups; no image files exist to serve.
- **D9 Quantity stepper and Add to cart.** Not built (later capability).
- **D10 Empty/error frames.** The mockup shows all four states side by side on one page; the built app shows one frame at a time using the shared shell frames, with catalog wording.
