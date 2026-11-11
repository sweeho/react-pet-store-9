---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0005
capability_brief: SWHR8-I-0006
branch: vortex/sprint/swhr8-s-0005-daaaa982
upstream: [artifacts/SWHR8-S-0005/qa-test-report.md]
---

# Release notes — SWHR8-S-0005

## Added

- **Shopping cart.** Every shopper has a cart for the visit, signed on or not. (SWHR8-T-0021)
- **Add to cart** on the item page. The item goes in with quantity 1. Adding an item already in the cart sets its quantity again rather than adding to it. (SWHR8-T-0021)
- **Cart page** at `/cart`. Each line shows the item, its product and category, the product name, the description, the current list price, an editable quantity and a remove link. The total is in US dollars. (SWHR8-T-0021)
- **Change several quantities at once** and press Update. A quantity of zero or less, or anything that is not a whole number (such as "abc"), removes the line. (SWHR8-T-0021)
- **Prices are always current.** The cart shows the catalog's list price at the moment you look, and the total is price times quantity with no discount or tax. (SWHR8-T-0021)
- **Empty cart** shows "Your Shopping Cart is Empty.". An **Order Error** page is ready for orders submitted with an empty cart. (SWHR8-T-0021)
- Line text appears in your chosen language (en_US, ja_JP or zh_CN). (SWHR8-T-0021)

## Changed

- The navigation has a **Cart** entry, and its badge counts distinct items, not units: 5 of one pet and 2 of another shows "2". (SWHR8-T-0021)
- Signing off, or being signed out after 15 idle minutes, now empties your cart. (SWHR8-T-0021)

## Upgrade notes

- No database migration. Carts are held in server memory per session and are lost on restart.
- New endpoints: `GET /api/cart`, `POST /api/cart/items`, `POST /api/cart/update`, `POST /api/cart/remove`. None requires sign-on. `GET /api/session` gains `cartCount` and keeps its existing fields.

## Not included

- Placing an order arrives with order checkout (SWHR8-I-0007). Until then, rejecting an empty-cart order and emptying the cart after an order cannot be seen end to end.
- Search and Administration navigation entries shown in the mockups arrive with their own capabilities.
- Carts of anonymous visitors whose session has expired are not cleared from memory.

## Verification

Verified at integration QA: 17 of 19 scenarios pass, the two order-submission scenarios wait on order checkout, and QA found no defects. See `artifacts/SWHR8-S-0005/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0005/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0005/qa-test-report.md` | Satisfied | —         |
