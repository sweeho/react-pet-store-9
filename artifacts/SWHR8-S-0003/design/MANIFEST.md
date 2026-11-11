# Design manifest — SWHR8-S-0003

Capability brief **SWHR8-I-0004** (Catalog browsing and search), canvas doc version **12** (frozen). The files are exported byte-exact from the approved mockups. Draft wireframes are not exported.

| File                                              | Mockup                                                 | Route / state                                         | Viewport |
| ------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- | -------- |
| `mockup-category-list.html`                       | SWHR8-MCK-19 Category list                             | `/catalog`, default                                   | 1440     |
| `mockup-category-list-mobile.html`                | SWHR8-MCK-20 Category list · Mobile                    | `/catalog`, default                                   | 390      |
| `mockup-product-list-with-mylist-sidebar.html`    | SWHR8-MCK-21 Product list with MyList sidebar          | `/category/FISH`, MyList shown (signed in, MyList on) | 1440     |
| `mockup-product-list-with-mylist-sidebar-mo.html` | SWHR8-MCK-22 Product list with MyList sidebar · Mobile | `/category/FISH`, MyList shown                        | 390      |
| `mockup-item-list-for-a-product.html`             | SWHR8-MCK-23 Item list for a product                   | `/product/FI-SW-01`, default                          | 1440     |
| `mockup-item-list-for-a-product-mobile.html`      | SWHR8-MCK-24 Item list for a product · Mobile          | `/product/FI-SW-01`, default                          | 390      |
| `mockup-item-page.html`                           | SWHR8-MCK-25 Item page                                 | `/item/EST-1`, default                                | 1440     |
| `mockup-item-page-mobile.html`                    | SWHR8-MCK-26 Item page · Mobile                        | `/item/EST-1`, default                                | 390      |
| `mockup-search-results.html`                      | SWHR8-MCK-27 Search results                            | `/search?q=fish`, results                             | 1440     |
| `mockup-search-results-mobile.html`               | SWHR8-MCK-28 Search results · Mobile                   | `/search?q=fish`, results                             | 390      |
| `mockup-catalog-empty-and-error-states.html`      | SWHR8-MCK-29 Catalog empty and error states            | `/category/NONE` (empty), any list with a failed load | 1440     |
| `mockup-catalog-empty-and-error-states-mo.html`   | SWHR8-MCK-30 Catalog empty and error states · Mobile   | as above                                              | 390      |

The mockups draw cart, account and quantity controls that belong to later capabilities; only what exists ships. The item page labels the unit cost "Member price" (change `swhr8-i-0004-catalog-browsing-and-search`, design.md Spec discrepancies D5). The MyList sidebar renders only once sign-on (SWHR8-I-0005) supplies the profile (D6).
