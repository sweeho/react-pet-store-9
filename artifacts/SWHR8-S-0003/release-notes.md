---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0003
capability_brief: SWHR8-I-0004
branch: vortex/sprint/swhr8-s-0003-079c075b
upstream: [artifacts/SWHR8-S-0003/qa-test-report.md]
---

# Release notes — SWHR8-S-0003

## Added

- A **Catalog** for shoppers. It opens from **Catalog browsing & search** in the navigation and from **Browse the catalog** on the landing page. Shoppers can browse categories, then the products in a category, then the items in a product. Categories, products and items are listed alphabetically. (SWHR8-T-0012)
- Lists show two entries per page, with **Next** and **Previous** links. Going past either end of a list shows the empty frame, not an error. (SWHR8-T-0012)
- An **item page** that shows the list price and the member price, each in the shopper's currency format. (SWHR8-T-0012)
- **Keyword search** from the box on the Catalog and Search pages. Every word is matched, ignoring capital letters, against the product name, category and item description, and an item that matches any word is a result. A blank search shows nothing. (SWHR8-T-0012)
- Catalog text is shown only in the shopper's language (US English, Japanese or Simplified Chinese) and is never taken from another language. (SWHR8-T-0012)
- An item, product or category that does not exist shows the empty frame. A catalog failure shows the error frame with **Try again**. (SWHR8-T-0012)
- A **catalog check** for operations. It reports categories with no products, products with no items, items priced below cost, items missing a description in a language their category uses, and items with no stock record. It fails whenever it finds any of these. (SWHR8-T-0012)

## Changed

- The navigation has a Catalog entry, and the landing page's **Browse the catalog** button now opens it. (SWHR8-T-0012)

## Fixed

- None.

## Upgrade notes

- New database migration `drizzle/0001_*`, which adds the catalog and inventory tables. The sample catalog loads automatically when the catalog is empty.
- New endpoints: `GET /api/catalog/categories`, `/api/catalog/category/:id`, `/api/catalog/product/:id`, `/api/catalog/item/:id` and `/api/catalog/search`. `POST /api/test/seed` exists for tests and returns 404 in production.
- New script `bun run catalog:check`. Its exit code is non-zero when problems are found. Nothing schedules it yet.
- On the sample data the check already reports two problems: EST-15 has no Japanese description, and EST-26 is priced below cost in Japanese.

## Not included

- The favourites (MyList) sidebar is built, but it appears only once sign-on ships with Customer account (SWHR8-I-0005).
- Quantity and **Add to cart** on item pages arrive with the shopping cart.
- There is no search box in the site header. Search is on the Catalog and Search pages, as the design shows.
- Category cards show names only. The catalog data has no category descriptions.

## Verification

Verified at integration QA: 17 of 18 scenarios pass, the MyList scenario waits on sign-on, and QA found no defects. See `artifacts/SWHR8-S-0003/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0003/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0003/qa-test-report.md` | Satisfied | —         |
