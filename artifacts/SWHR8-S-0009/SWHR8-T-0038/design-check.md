---
ticket: SWHR8-T-0038
sprint: SWHR8-S-0009
artifact: design-check
---

# Design check — SWHR8-T-0038

Each mockup was rendered with Playwright from `artifacts/SWHR8-S-0009/design/` and compared with the built route at the same viewport (dev server on :5000). Screenshots are in `design-check/`: `mockup-<name>.png` beside `build-<name>.png`.

| Mockup       | Route and state                                                | Viewport | Mockup                                     | Build                                     |
| ------------ | -------------------------------------------------------------- | -------- | ------------------------------------------ | ----------------------------------------- |
| SWHR8-MCK-51 | `/admin/inventory`, administrator; EST-3 = `-4`, EST-5 = `120` | 1440     | `design-check/mockup-inventory.png`        | `design-check/build-inventory.png`        |
| SWHR8-MCK-52 | same, mobile                                                   | 390      | `design-check/mockup-inventory-mobile.png` | `design-check/build-inventory-mobile.png` |
| SWHR8-MCK-53 | `/admin/login?next=/admin/inventory`, failed attempt           | 1440     | `design-check/mockup-signin.png`           | `design-check/build-signin.png`           |
| SWHR8-MCK-54 | same, mobile                                                   | 390      | `design-check/mockup-signin-mobile.png`    | `design-check/build-signin-mobile.png`    |
| SWHR8-MCK-55 | `/admin/inventory`, signed in as `j2ee` (no role)              | 1440     | `design-check/mockup-refused.png`          | `design-check/build-refused.png`          |
| SWHR8-MCK-56 | same, mobile                                                   | 390      | `design-check/mockup-refused-mobile.png`   | `design-check/build-refused-mobile.png`   |

## Differences left

- **Sample data.** The built table shows the seeded catalog (descriptions such as "Fresh Water fish from Japan", quantities left by earlier test runs); the mockup used invented names and quantities. Layout, hierarchy and states match.
- **Header.** The built header is the shared site layout (Language chip and Sign in control on the right; the Administration link sits with the other areas, not pushed to the far right; no Search link because the app has none). The mockup's header is a static copy.
- **Page-level sign-out control.** Reads "Log out" (the mockup says "Sign out") and appears on the refused frame too. SD4: the locked e2e case C-0229 looks for `/log ?out/i`.
- **Sign-in field label.** "Username" (mockup: "User name"), because C-0229 uses `getByLabel("Username")` (SD4).
- **Refused frame.** An extra "Access denied" line sits above the mockup heading (SD4, C-0229 text match) and the body says "not an administrator account" instead of "a customer account", since `customer` and other roleless users are not all customers.
- **Typography and tokens.** Headings use the app's Tailwind `font-semibold` and design tokens, so weight and colour differ by a shade from the mockup's literals. The token wins.
- **Footer.** Shared site footer instead of the mockup's two-column copy.
- **Mobile.** The inventory rows stack (item, description, on hand, input, hint) as in MCK-52; the shared header's "Sign in" link wraps to two lines at 390px (existing layout, unchanged).
