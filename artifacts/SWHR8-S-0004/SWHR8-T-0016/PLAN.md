# PLAN — SWHR8-T-0016 Customer account and sign-on

Change: `swhr8-i-0005-customer-account-and-sign-o`. Read its `design.md` FIRST (Codebase findings, Decisions A1–A10, Spec discrepancies D1–D8), then `specs/customer-account/spec.md` and the locked tests in `tests/acceptance/customer-account/`.

## Objective

Shoppers can register, sign on and off, be remembered, edit their profile and see their language and banner applied; four screens require sign-on and a signed-on session idles out after 15 minutes. Delivers every task group of the change's `tasks.md`, in order.

## Steps

1. **Data model** (tasks 1.1–1.5) — schema and migration per design A2, FK pragma in `db/client.ts`, `server/customer/model.ts` and `repository.ts` with the exact exports the locked tests name (findings), mandatory-field validation per A3, sample users per A7. → `model.test.ts` and `storage.test.ts` green.
2. **Registration and sign-on** (tasks 2.1–2.6) — `server/customer/auth.ts` per A4 (clock passed in, 900 000 ms idle, `bp_signon` cookie 2 678 400 s / expired when unticked), wired into the existing session middleware; routes `POST /api/signon`, `POST /api/signoff`, `POST /api/register`, `GET /api/users/:name` (replaces the demo numeric lookup), `POST /api/test/clock` per A6. Sign-off keeps the locale and clears sign-on and the session cart slot (D7). → `session.test.ts` green.
3. **Customer profile management** (tasks 3.1–3.5) — customer create/update and `GET /api/profile`; unchecked checkbox = off (R-0043); locale and cart locale from the profile on sign-on; `bannerFor` with the dogs fallback, feeding the existing catalog banner; post-creation sign-on and return per A5/D2. Extend `GET /api/session` per A8 (feeds `use-catalog-session.ts`, so C-0233 goes green).
4. **Access control** (tasks 4.1–4.2) — the protected list per A5 (server 401 + client redirect to `/signon?next=`); task 4.2 per A10 (no code; record in summary).
5. **Screens** (part of 2.x/3.x) — pages per A9, header Sign in / "Hi, <user name> ▾" control and the `PRIMARY_AREAS` entry, strings in all three dictionaries. Headings and labels per D1.
6. **Verification** (task 5.1) — tests per the harness in design.md Phases 5; one `e2e/account.spec.ts` journey; render each screen beside its mockup at both viewports.

## Design reference

Mockups exported under `artifacts/SWHR8-S-0004/design/` — see `MANIFEST.md` there for the route, state and viewport of each:

- `mockup-sign-on-page.html` / `-mobile` — `/signon?next=/order`, signed out, 1440 / 390
- `mockup-sign-on-error-page.html` / `-mobile` — `/signon/error`, 1440 / 390
- `mockup-customer-form-registration-step-2.html` / `-mobile` — `/account/new`, 1440 / 390
- `mockup-duplicate-account-screen.html` / `-mobile` — `/account/duplicate`, 1440 / 390
- `mockup-my-account-customer-profile.html` / `-mobile` — `/account`, signed on as shopper, 1440 / 390
- `mockup-sign-on-welcome.html` / `-mobile` — `/signon/welcome`, signed on as shopper, 1440 / 390

## File / module ownership

- New: `server/customer/{model,repository,auth,index}.ts` (+ unit tests under `src/test/server/`), `routes/api/{signon.post,signoff.post,register.post,profile.get,profile.put,customer.post}.ts` (names may vary; one file per route, + `*.test.ts`), `routes/api/test/clock.post.ts`, `src/pages/signon/*`, `src/pages/register.tsx`, `src/pages/account/*` (+ `*.test.tsx`), `src/components/account/*`, `drizzle/0002_*.sql` + `drizzle/meta/*`, `e2e/account.spec.ts`.
- Modified: `db/schema.ts`, `db/client.ts`, `middleware/auth.ts`, `middleware/locale.ts`, `routes/api/session.get.ts`, `routes/api/users/[id].ts` (+ test), `routes/api/hello.ts` (+ test) if the stub user goes, `src/pages/_layout.tsx` (+ test), `src/constants/primary-areas.ts`, `src/i18n/screens/{en_US,ja_JP,zh_CN}.ts`, `src/components/catalog/use-catalog-session.ts` / `banner.tsx` (session fields only), `server/localization/sessions.ts` (only if the locale must be set from the profile).
- Never: `tests/acceptance/**` (locked), `openspec/specs/**`, root docs.

## Definition of Done

AC-1 … AC-39 on the ticket, each met by its linked case (C-0028 … C-0065 except C-0047, plus C-0233 and C-0018, both deferred here by earlier sprints). Saving the profile language applies it to the session immediately (C-0018). Watch design.md D9: C-0018 and C-0233 both use `shopper`. C-0047 is deferred to SWHR8-I-0006 and is not expected green. The app builds, its unit, E2E and acceptance tiers are green, and each screen matches its mockup at 1440 and 390 within the D1 overrides.
