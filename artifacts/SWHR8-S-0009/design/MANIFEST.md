# Design manifest — SWHR8-S-0009

Approved mockups of capability brief **SWHR8-I-0010** (Order fulfillment and inventory), canvas doc version 12, exported byte-exact (sizes and sha256 checked against the platform).

| Mockup       | File                                                          | Screen / state                                         | Route                                                | Viewport |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | -------- |
| SWHR8-MCK-51 | `mockup-inventory-update.html`                                | Inventory update (after a save)                        | `/admin/inventory`, signed in as an administrator    | 1440     |
| SWHR8-MCK-52 | `mockup-inventory-update-mobile.html`                         | Inventory update · Mobile                              | `/admin/inventory`, signed in as an administrator    | 390      |
| SWHR8-MCK-53 | `mockup-administrator-sign-in-for-inventory-upda.html`        | Administrator sign-in (failed attempt shown)           | `/admin/login?next=/admin/inventory`                 | 1440     |
| SWHR8-MCK-54 | `mockup-administrator-sign-in-for-inventory-upda-mobile.html` | Administrator sign-in · Mobile                         | `/admin/login?next=/admin/inventory`                 | 390      |
| SWHR8-MCK-55 | `mockup-inventory-update-access-refused.html`                 | Inventory update access refused                        | `/admin/inventory`, signed in without the role       | 1440     |
| SWHR8-MCK-56 | `mockup-inventory-update-access-refused-mobile.html`          | Inventory update access refused · Mobile               | `/admin/inventory`, signed in without the role       | 390      |

MCK-54's name carries a `-mobile` suffix: the 40-character slug rule cuts both sign-in titles to the same name (design.md SD9).

Wireframes (draft, not exported): Inventory update, Administrator sign-in for inventory update, Inventory update access refused.
