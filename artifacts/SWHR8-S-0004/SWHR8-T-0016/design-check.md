# Design check — SWHR8-T-0016

Pairs are in `design-check/` (full page, mockup then built). Differences common to every screen are listed at the end.

## SWHR8-MCK-31 Sign-on page

Route/state: `/signon?next=/order`, signed out; viewport 1440.

- Mockup: `design-check/sign-on-page-mockup.png`
- Built: `design-check/sign-on-page-built.png`
- Differences: see the common list below; the new-customer panel is a link to `/register` instead of an inline form (D1).

## SWHR8-MCK-32 Sign-on page · Mobile

Route/state: as above; viewport 390.

- Mockup: `design-check/sign-on-page-mobile-mockup.png`
- Built: `design-check/sign-on-page-mobile-built.png`
- Differences: see the common list below; the new-customer panel is a link to `/register` instead of an inline form (D1).

## SWHR8-MCK-33 Sign-on error page

Route/state: `/signon/error`; viewport 1440.

- Mockup: `design-check/sign-on-error-page-mockup.png`
- Built: `design-check/sign-on-error-page-built.png`
- Differences: see the common list below; heading reads "Sign-on Error" and the alert keeps "Sign on failed" (D1).

## SWHR8-MCK-34 Sign-on error page · Mobile

Route/state: as above; viewport 390.

- Mockup: `design-check/sign-on-error-page-mobile-mockup.png`
- Built: `design-check/sign-on-error-page-mobile-built.png`
- Differences: see the common list below; heading reads "Sign-on Error" and the alert keeps "Sign on failed" (D1).

## SWHR8-MCK-35 Customer form (registration, step 2)

Route/state: `/account/new`, just registered; viewport 1440.

- Mockup: `design-check/customer-form-registration-step-2-mockup.png`
- Built: `design-check/customer-form-registration-step-2-built.png`
- Differences: see the common list below.

## SWHR8-MCK-36 Customer form (registration, step 2) · Mobile

Route/state: as above; viewport 390.

- Mockup: `design-check/customer-form-registration-step-2-mobile-mockup.png`
- Built: `design-check/customer-form-registration-step-2-mobile-built.png`
- Differences: see the common list below.

## SWHR8-MCK-37 Duplicate-account screen

Route/state: `/account/duplicate?name=shopper`; viewport 1440.

- Mockup: `design-check/duplicate-account-screen-mockup.png`
- Built: `design-check/duplicate-account-screen-built.png`
- Differences: see the common list below; heading reads "Duplicate Account" with the mockup's sentence leading the body (D1).

## SWHR8-MCK-38 Duplicate-account screen · Mobile

Route/state: as above; viewport 390.

- Mockup: `design-check/duplicate-account-screen-mobile-mockup.png`
- Built: `design-check/duplicate-account-screen-mobile-built.png`
- Differences: see the common list below; heading reads "Duplicate Account" with the mockup's sentence leading the body (D1).

## SWHR8-MCK-39 My account — customer profile

Route/state: `/account`, signed on as shopper; viewport 1440.

- Mockup: `design-check/my-account-customer-profile-mockup.png`
- Built: `design-check/my-account-customer-profile-built.png`
- Differences: see the common list below; screenshots were taken after concurrent acceptance tests saved shopper as ja_JP with the banner off (D9), so text is Japanese and the banner may be absent.

## SWHR8-MCK-40 My account — customer profile · Mobile

Route/state: as above; viewport 390.

- Mockup: `design-check/my-account-customer-profile-mobile-mockup.png`
- Built: `design-check/my-account-customer-profile-mobile-built.png`
- Differences: see the common list below; screenshots were taken after concurrent acceptance tests saved shopper as ja_JP with the banner off (D9), so text is Japanese and the banner may be absent.

## SWHR8-MCK-41 Sign-on welcome

Route/state: `/signon/welcome`, signed on as shopper; viewport 1440.

- Mockup: `design-check/sign-on-welcome-mockup.png`
- Built: `design-check/sign-on-welcome-built.png`
- Differences: see the common list below; screenshots were taken after concurrent acceptance tests saved shopper as ja_JP with the banner off (D9), so text is Japanese and the banner may be absent.

## SWHR8-MCK-42 Sign-on welcome · Mobile

Route/state: as above; viewport 390.

- Mockup: `design-check/sign-on-welcome-mobile-mockup.png`
- Built: `design-check/sign-on-welcome-mobile-built.png`
- Differences: see the common list below; screenshots were taken after concurrent acceptance tests saved shopper as ja_JP with the banner off (D9), so text is Japanese and the banner may be absent.

## Common differences

- Nav shows only areas that exist (no Search, Cart, Administration); the shell's tokens replace literal mockup colours.
- Mockup sample data is replaced by live data; the welcome page omits the Cart tile (SWHR8-I-0006).
- Mobile: header controls are compacted by the shared shell; the user name in the header menu is truncated.
