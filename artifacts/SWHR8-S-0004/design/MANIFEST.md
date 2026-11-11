# Design manifest — SWHR8-S-0004

Capability brief **SWHR8-I-0005** (Customer account and sign-on), canvas doc version **12** (frozen). The files are exported byte-exact from the approved mockups. Draft wireframes are not exported.

| File                                                   | Mockup                                                     | Route / state                               | Viewport |
| ------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------- | -------- |
| `mockup-sign-on-page.html`                             | SWHR8-MCK-31 Sign-on page                                  | `/signon?next=/order`, signed out           | 1440     |
| `mockup-sign-on-page-mobile.html`                      | SWHR8-MCK-32 Sign-on page · Mobile                         | as above                                    | 390      |
| `mockup-sign-on-error-page.html`                       | SWHR8-MCK-33 Sign-on error page                            | `/signon/error`, after wrong credentials    | 1440     |
| `mockup-sign-on-error-page-mobile.html`                | SWHR8-MCK-34 Sign-on error page · Mobile                   | as above                                    | 390      |
| `mockup-customer-form-registration-step-2.html`        | SWHR8-MCK-35 Customer form (registration, step 2)          | `/account/new`, after `/register`           | 1440     |
| `mockup-customer-form-registration-step-2-mobile.html` | SWHR8-MCK-36 Customer form (registration, step 2) · Mobile | as above                                    | 390      |
| `mockup-duplicate-account-screen.html`                 | SWHR8-MCK-37 Duplicate-account screen                      | `/account/duplicate`, registering `shopper` | 1440     |
| `mockup-duplicate-account-screen-mobile.html`          | SWHR8-MCK-38 Duplicate-account screen · Mobile             | as above                                    | 390      |
| `mockup-my-account-customer-profile.html`              | SWHR8-MCK-39 My account — customer profile                 | `/account`, signed on as `shopper`          | 1440     |
| `mockup-my-account-customer-profile-mobile.html`       | SWHR8-MCK-40 My account — customer profile · Mobile        | as above                                    | 390      |
| `mockup-sign-on-welcome.html`                          | SWHR8-MCK-41 Sign-on welcome                               | `/signon/welcome`, signed on as `shopper`   | 1440     |
| `mockup-sign-on-welcome-mobile.html`                   | SWHR8-MCK-42 Sign-on welcome · Mobile                      | as above                                    | 390      |

The mockups draw cart and administration entries that belong to later capabilities; only what exists ships. Headings and the separate `/register` page follow the locked acceptance tests where they differ from the mockups (change `swhr8-i-0005-customer-account-and-sign-o`, design.md Spec discrepancies D1).
