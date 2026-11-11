# Design check — SWHR8-T-0016

Screenshots in `design-check/`: `<screen>[-mobile]-mockup.png` beside `<screen>[-mobile]-built.png`, at 1440x900 and 390x844 (full page).

| Mockup                                   | Route / state                           | Pair                                       |
| ---------------------------------------- | --------------------------------------- | ------------------------------------------ |
| mockup-sign-on-page(.html / -mobile)     | `/signon?next=/order`, signed out       | sign-on-page, sign-on-page-mobile          |
| mockup-sign-on-error-page                | `/signon/error`                         | sign-on-error-page, -mobile                |
| mockup-customer-form-registration-step-2 | `/account/new`, just registered         | customer-form-registration-step-2, -mobile |
| mockup-duplicate-account-screen          | `/account/duplicate?name=shopper`       | duplicate-account-screen, -mobile          |
| mockup-my-account-customer-profile       | `/account`, signed on as shopper        | my-account-customer-profile, -mobile       |
| mockup-sign-on-welcome                   | `/signon/welcome`, signed on as shopper | sign-on-welcome, -mobile                   |

## Differences left

- Headings "Sign-on Error", "Duplicate Account" and "My Account", the separate `/register` page with a "Create an account" link, and a "Create account" button replace the mockup's "Sign on failed", "That user name is already taken", the inline new-customer form and "Continue" (design.md D1, locked tests win).
- The shell nav shows only areas that exist (no Search, Cart, Administration); the header uses the shared shell's controls and tokens, not the mockup's literal values.
- Mockup sample data (Sophie Tanaka, "shoper") is replaced by live data. The shopper screenshots were taken after concurrent acceptance tests had saved shopper as ja_JP with the banner off (design.md D9), so the built My Account and welcome pages appear in Japanese.
- The welcome page omits the mockup's Cart tile (cart belongs to SWHR8-I-0006).
- Errors and the required-field summary use the design system's destructive token.
