# Summary — SWHR8-T-0016 Customer account and sign-on

CODE-REVIEW: sub-agent — fixed: unsupported language saved as success (now 400), backslash open redirect in `next`, untrimmed user name at sign-on; rejected: disabled-account sign-on block (spec silent), registration race and partial customer write (minor, left; follow-up not raised).

## What changed

- Data model: `signon_user`, `customer`, `account`, `contact`, `address`, `credit_card`, `profile` (migration `drizzle/0002_*`), `PRAGMA foreign_keys = ON`, sample users j2ee and shopper (`db/customer-seed.ts`).
- `server/customer/{model,repository,auth,http}.ts`; routes `signon`, `signoff`, `register`, `customer` (GET/POST/PUT), `profile`, `users/:name`, `test/clock`; `GET /api/session` extended additively; sign-on state rides `petstore_sid` (15-min idle, locale keeps 30).
- Screens `/signon`, `/signon/error`, `/register`, `/account/new`, `/account/duplicate`, `/account`, `/signon/welcome`; header Sign in / "Hi, name" menu; client guard `RequireSignOn`; strings in en_US, ja_JP, zh_CN; banner honours the banner flag and dogs fallback.

## Decisions and deviations

- Registration reached from a protected page returns straight to `next` (locked C-0034 matches the URL path); without `next` it continues to `/account/new`.
- `/signon` → `/register` link is a full page load: a client transition let Playwright fill the old page's field before the new route committed.
- Task 4.2 (administrator role): no code, per design A10. C-0047 deferred to SWHR8-I-0006 (no cart yet).
- Existing session tests now use `toMatchObject` because the session grew fields.
- D9: C-0018 persists shopper as ja_JP; in a long-lived dev DB later runs of C-0031 see Japanese labels. A fresh DB (CI) passed.
- Design check: `design-check.md`.

## Verification

`bun run typecheck` and `bun run lint` clean; `bun run test` 196 passed; `bun run test:e2e` 16 passed; acceptance Playwright 20 passed, C-0047 expected failure; acceptance vitest customer-account 27 passed.
