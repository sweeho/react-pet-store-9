---
artifact: design-check
sprint: SWHR8-S-0006
ticket: SWHR8-T-0026
---

# Design check

Each mockup was rendered with Playwright (Chromium) next to the built screen at the stated route, state and viewport. Screenshots are in `design-check/`. The built page ran against the dev server with `/api/account/profile` stubbed to the mockup's sample profile and EST-1 x2 plus EST-6 x1 in the cart.

| Mockup                                                                         | Mockup screenshot                            | Built screenshot                            |
| ------------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------- |
| SWHR8-MCK-43 `mockup-checkout-form.html` (`/checkout`, 1440)                   | `design-check/mck43-form-1440-mockup.png`    | `design-check/mck43-form-1440-built.png`    |
| SWHR8-MCK-44 `mockup-checkout-form-mobile.html` (390)                          | `design-check/mck44-form-390-mockup.png`     | `design-check/mck44-form-390-built.png`     |
| SWHR8-MCK-45 `mockup-checkout-form-missing-required-fields.html` (1440)        | `design-check/mck45-missing-1440-mockup.png` | `design-check/mck45-missing-1440-built.png` |
| SWHR8-MCK-46 `mockup-checkout-form-missing-required-fields-mo.html` (390)      | `design-check/mck46-missing-390-mockup.png`  | `design-check/mck46-missing-390-built.png`  |
| SWHR8-MCK-47 `mockup-order-confirmation.html` (`/checkout/confirmation`, 1440) | `design-check/mck47-confirm-1440-mockup.png` | `design-check/mck47-confirm-1440-built.png` |
| SWHR8-MCK-48 `mockup-order-confirmation-mobile.html` (390)                     | `design-check/mck48-confirm-390-mockup.png`  | `design-check/mck48-confirm-390-built.png`  |
| SWHR8-MCK-49 `mockup-order-error-empty-cart.html` (`/checkout/error`, 1440)    | `design-check/mck49-error-1440-mockup.png`   | `design-check/mck49-error-1440-built.png`   |
| SWHR8-MCK-50 `mockup-order-error-empty-cart-mobile.html` (390)                 | `design-check/mck50-error-390-mockup.png`    | `design-check/mck50-error-390-built.png`    |

## Differences left

- **Shell nav and footer.** The mockups show a Search and an Administration entry and a "Shop / You" footer. The built shell is the existing app shell (design S4: no new nav entries, areas that do not exist yet are not shown).
- **Heading weight.** Page and panel headings use the app's design-system heading weights, which render bolder than the mockup's reset styles. The token wins.
- **Sample data.** Product names come from the seeded catalog ("Fresh Water fish from Japan"), not the mockup's "Large Angelfish". The summary count is the sum of quantities, as in the mockup (3 items).
- **Vertical rhythm.** Built panels sit a few pixels lower because of the shell's header height.
- **Order Error page (MCK-49/50).** The existing `src/pages/checkout/error.tsx` was not changed.
- **Mobile (MCK-44/46/48/50).** Fields stack to one column and the summary moves below the form, as the mockups show. The sticky header in the full-page screenshots is a capture artifact.
