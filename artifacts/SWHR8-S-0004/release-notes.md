---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0004
capability_brief: SWHR8-I-0005
branch: vortex/sprint/swhr8-s-0004-17e72ca0
upstream: [artifacts/SWHR8-S-0004/qa-test-report.md]
---

# Release notes — SWHR8-S-0004

## Added

- **Create an account.** Choose a user name and password, then fill in the customer form with name, address, telephone, card and preferences. A user name that is taken, longer than 25 characters, or contains `%` or `*` shows the Duplicate Account screen, and no account is created. (SWHR8-T-0016)
- **Sign on.** After signing on you return to the page you were trying to reach. Wrong details show the Sign-on Error page, and you stay signed out. (SWHR8-T-0016)
- **Remember my user name.** Ticking it keeps your user name for 31 days. Leaving it unticked forgets any remembered name. (SWHR8-T-0016)
- **My Account.** Edit your contact details, card, preferred language, favourite category, and whether to show My List and the banner. (SWHR8-T-0016)
- **Your preferences are applied.** After sign-on the store switches to your preferred language, the banner matches your favourite category (any other category gets the dogs banner), and the My List sidebar shows products from your favourite category. (SWHR8-T-0016)
- **Sign off** from the "Hi, user name ▾" menu in the header. It signs you out and keeps your chosen language. (SWHR8-T-0016)
- New customers start with an active account, English, no favourite category, and My List and the banner on. Sample users `j2ee` and `shopper` are available. (SWHR8-T-0016)

## Changed

- The header now has a **Sign in** link, or the "Hi, user name ▾" menu when you are signed on, and the navigation has a **Customer account & sign-on** entry. (SWHR8-T-0016)
- Four screens now require sign-on: My Account, saving the profile, order entry and the sign-on welcome. Everything else stays open. (SWHR8-T-0016)
- If you are signed on and idle for 15 minutes, you are signed out. Your language choice still lasts 30 minutes. (SWHR8-T-0016)

## Upgrade notes

- New database migration `drizzle/0002_*` adds the customer tables. SQLite foreign-key enforcement is now on. The sample users load automatically when the sign-on table is empty.
- New endpoints: `POST /api/signon`, `POST /api/signoff`, `POST /api/register`, `GET/POST/PUT /api/customer`, `GET /api/profile` and `GET /api/users/:name`. `GET /api/session` gains new fields and keeps its existing ones. `POST /api/test/clock` exists only for tests and returns 404 in production.
- New cookie `bp_signon` (31 days) holds a remembered user name.
- Passwords and card numbers are stored in clear text, as in the legacy system.

## Not included

- Sign-off clearing the cart cannot be seen yet, because the cart arrives with SWHR8-I-0006.
- The order page that sign-on protects arrives with order checkout (SWHR8-I-0007). For now only the redirect to sign-on is in place.
- Administrator-only access to admin and supplier functions arrives with admin order management (SWHR8-I-0011).
- The sign-on page links to a separate registration page. The design showed the new-customer form inline on the sign-on page.

## Verification

Verified at integration QA: 38 of 39 scenarios pass, the sign-off/cart scenario waits on the cart, and QA found no defects. See `artifacts/SWHR8-S-0004/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0004/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0004/qa-test-report.md` | Satisfied | —         |
