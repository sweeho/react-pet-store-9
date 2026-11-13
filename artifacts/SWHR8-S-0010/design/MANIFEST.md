# Design manifest — SWHR8-S-0010

Approved mockups of capability brief **SWHR8-I-0011** (Admin order management), canvas doc version 12, exported byte-exact (sizes and sha256 checked against the platform).

| Mockup       | File                                                    | Screen / state                                  | Route                                          | Viewport |
| ------------ | ------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------- | -------- |
| SWHR8-MCK-57 | `mockup-administrator-login.html`                       | Administrator login                             | `/admin`, not signed on as an administrator    | 1440     |
| SWHR8-MCK-58 | `mockup-administrator-login-mobile.html`                | Administrator login · Mobile                    | `/admin`, not signed on as an administrator    | 390      |
| SWHR8-MCK-59 | `mockup-administration-launcher.html`                   | Administration launcher                         | `/admin`, signed on as an administrator        | 1440     |
| SWHR8-MCK-60 | `mockup-administration-launcher-mobile.html`            | Administration launcher · Mobile                | `/admin`, signed on as an administrator        | 390      |
| SWHR8-MCK-61 | `mockup-manage-orders-order-lists-by-status.html`       | Order lists by status (Pending tab)             | `/admin/orders`                                | 1440     |
| SWHR8-MCK-62 | `mockup-manage-orders-order-lists-by-status-mobi.html`  | Order lists by status · Mobile                  | `/admin/orders`                                | 390      |
| SWHR8-MCK-63 | `mockup-refresh-with-unsaved-changes-warning.html`      | Refresh with unsaved changes — warning          | `/admin/orders`, a decision changed, Refresh   | 1440     |
| SWHR8-MCK-64 | `mockup-refresh-with-unsaved-changes-warning-mob.html`  | Refresh warning · Mobile                        | `/admin/orders`, a decision changed, Refresh   | 390      |
| SWHR8-MCK-65 | `mockup-sales-totals-revenue-or-quantity.html`          | Sales totals — revenue or quantity              | `/admin/sales`                                 | 1440     |
| SWHR8-MCK-66 | `mockup-sales-totals-revenue-or-quantity-mobile.html`   | Sales totals · Mobile                           | `/admin/sales`                                 | 390      |
| SWHR8-MCK-67 | `mockup-administrator-logged-out.html`                  | Administrator logged out                        | `/admin/logout`                                | 1440     |
| SWHR8-MCK-68 | `mockup-administrator-logged-out-mobile.html`           | Administrator logged out · Mobile               | `/admin/logout`                                | 390      |

MCK-63/64 draw a styled in-page dialog; the locked browser test asserts a native `confirm` dialog, which wins (change design.md, SD6).

Wireframes (draft, not exported): Administrator login, Administration launcher, Manage orders, Refresh warning, Sales totals, Administrator logged out.
