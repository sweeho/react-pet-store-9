---
artifact: design-check
ticket: SWHR8-T-0021
sprint: SWHR8-S-0005
---

# Design check — SWHR8-T-0021

Each pair is the mockup HTML and the built screen, rendered with Playwright (Chromium) against the dev server. Screenshots are in `design-check/`.

| Mockup                                                   | Route / state     | Viewport | Mockup                                     | Built                                     |
| -------------------------------------------------------- | ----------------- | -------- | ------------------------------------------ | ----------------------------------------- |
| SWHR8-MCK-9 `mockup-cart-page-with-items.html`           | `/cart`, 3 lines  | 1440     | `design-check/cart-items-1440-mockup.png`  | `design-check/cart-items-1440-built.png`  |
| SWHR8-MCK-10 `mockup-cart-page-with-items-mobile.html`   | `/cart`, 3 lines  | 390      | `design-check/cart-items-390-mockup.png`   | `design-check/cart-items-390-built.png`   |
| SWHR8-MCK-11 `mockup-cart-page-empty.html`               | `/cart`, empty    | 1440     | `design-check/cart-empty-1440-mockup.png`  | `design-check/cart-empty-1440-built.png`  |
| SWHR8-MCK-12 `mockup-cart-page-empty-mobile.html`        | `/cart`, empty    | 390      | `design-check/cart-empty-390-mockup.png`   | `design-check/cart-empty-390-built.png`   |
| SWHR8-MCK-13 `mockup-order-error-empty-cart.html`        | `/checkout/error` | 1440     | `design-check/order-error-1440-mockup.png` | `design-check/order-error-1440-built.png` |
| SWHR8-MCK-14 `mockup-order-error-empty-cart-mobile.html` | `/checkout/error` | 390      | `design-check/order-error-390-mockup.png`  | `design-check/order-error-390-built.png`  |

## Differences left

- Search and Administration nav entries are not shown: those areas do not exist yet (PLAN.md).
- Button reads "Update", not "Update cart", and has no refresh icon: the locked browser tests click "Update" exactly (design S2).
- Item names (for example "Fish", "Friendly dog from England") come from the seeded catalog; the mockup used sample names. Category tags show the category id in capitals.
- Product id in the meta row is the catalog's product id (FISH-1), not the mockup's sample SKU.
- The "You have changed quantities" notice of the mockup is replaced by a static hint under the form (no mockup state is specified for the pre-edit view).
- Fonts, colours and radii come from the design-system tokens, not the mockup's literal values.
- The header shows the language and Sign in controls of the existing shell, which the mockup omits.
- Order Error: the trailing crumb reads "Checkout" because the page heading is already "Order Error" and the locked tests expect a single "Order Error" text.
