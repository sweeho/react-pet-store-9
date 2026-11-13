# Design check — SWHR8-T-0042

Mockup and built screen rendered with Playwright Chromium at each mockup's viewport; pairs are in `design-check/`. Built screens use the signed-on seeded `jps_admin` against the dev server.

## SWHR8-MCK-57 — `mockup-administrator-login.html`

- Route / state: `/admin`, signed out; viewport 1440
- Mockup: `design-check/login-desktop-mockup.png`
- Built: `design-check/login-desktop-built.png`
- Differences left: Sign-in card is the shared `AdminSignOnForm` with the "Administrator access required" copy. Button reads "Sign in" (existing dictionary string).

## SWHR8-MCK-58 — `mockup-administrator-login-mobile.html`

- Route / state: `/admin`, signed out; viewport 390
- Mockup: `design-check/login-mobile-mockup.png`
- Built: `design-check/login-mobile-built.png`
- Differences left: Same as MCK-57.

## SWHR8-MCK-59 — `mockup-administration-launcher.html`

- Route / state: `/admin`, administrator; viewport 1440
- Mockup: `design-check/launcher-desktop-mockup.png`
- Built: `design-check/launcher-desktop-built.png`
- Differences left: Card icons are lucide-react, not the mockup's inline SVG.

## SWHR8-MCK-60 — `mockup-administration-launcher-mobile.html`

- Route / state: `/admin`, administrator; viewport 390
- Mockup: `design-check/launcher-mobile-mockup.png`
- Built: `design-check/launcher-mobile-built.png`
- Differences left: Same as MCK-59.

## SWHR8-MCK-61 — `mockup-manage-orders-order-lists-by-status.html`

- Route / state: `/admin/orders`, Pending tab; viewport 1440
- Mockup: `design-check/orders-desktop-mockup.png`
- Built: `design-check/orders-desktop-built.png`
- Differences left: The seeded database holds no PENDING order, so the built shot shows the empty state; row layout is covered by the page test and e2e. Primary button reads "Commit" (mockup: "Commit changes") because the locked tests look for the name "Commit". A "Log out" button sits in the session line: locked test SWHR8-C-0256 clicks it from this page. Only the active tab renders.

## SWHR8-MCK-62 — `mockup-manage-orders-order-lists-by-status-mobi.html`

- Route / state: `/admin/orders`; viewport 390
- Mockup: `design-check/orders-mobile-mockup.png`
- Built: `design-check/orders-mobile-built.png`
- Differences left: Table scrolls horizontally (min width 640px) instead of the mockup's card rows.

## SWHR8-MCK-63 — `mockup-refresh-with-unsaved-changes-warning.html`

- Route / state: `/admin/orders`, a decision changed, Refresh; viewport 1440
- Mockup: `design-check/orders-desktop-mockup.png`
- Built: `design-check/orders-desktop-built.png`
- Differences left: Native `confirm` dialog instead of the styled dialog (design SD6, locked test SWHR8-C-0259). The unsaved-changes indicator and the highlighted changed row follow the mockup.

## SWHR8-MCK-64 — `mockup-refresh-with-unsaved-changes-warning-mob.html`

- Route / state: `/admin/orders`, Refresh warning; viewport 390
- Mockup: `design-check/orders-mobile-mockup.png`
- Built: `design-check/orders-mobile-built.png`
- Differences left: Same as MCK-63.

## SWHR8-MCK-65 — `mockup-sales-totals-revenue-or-quantity.html`

- Route / state: `/admin/sales`; viewport 1440
- Mockup: `design-check/sales-desktop-mockup.png`
- Built: `design-check/sales-desktop-built.png`
- Differences left: Built shot is the form before "Get totals". Result table shows key, total and a Total row; the mockup's Share column, bars and two-metric summary are not built (the spec asks for one total per key for the chosen mode).

## SWHR8-MCK-66 — `mockup-sales-totals-revenue-or-quantity-mobile.html`

- Route / state: `/admin/sales`; viewport 390
- Mockup: `design-check/sales-mobile-mockup.png`
- Built: `design-check/sales-mobile-built.png`
- Differences left: Same as MCK-65.

## SWHR8-MCK-67 — `mockup-administrator-logged-out.html`

- Route / state: `/admin/logout`; viewport 1440
- Mockup: `design-check/logout-desktop-mockup.png`
- Built: `design-check/logout-desktop-built.png`
- Differences left: None beyond icon source.

## SWHR8-MCK-68 — `mockup-administrator-logged-out-mobile.html`

- Route / state: `/admin/logout`; viewport 390
- Mockup: `design-check/logout-mobile-mockup.png`
- Built: `design-check/logout-mobile-built.png`
- Differences left: None beyond icon source.
