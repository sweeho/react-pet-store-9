# Summary — SWHR8-T-0008 Localization

Delivers all 14 tasks of `swhr8-i-0003-localization`.

CODE-REVIEW: self-review — sub-agent not run; reviewed the diff against the spec and mockups. Fixed: test files moved under `routes/` to match `testGlobs`, Language page reads the select value from the DOM (the locked e2e sets it without a change event). Not fixed, by design: sessions are in memory and never pruned (expired ones are replaced on next use); the session cookie is not `Secure` so it works over http in dev.

## What changed

- `server/localization/`: `locale.ts` (config, code parsing, notification locale, currency/number/keyword formatting, UTF-8 form reading, SJIS and JIS decoding), `sessions.ts` (30-minute idle timeout, injected clock), `screens.ts` (resolver, shared with the browser), `details.ts` + `catalog-text.ts` (per-(entity,id,locale) text, no fallback, null locale rejected), `mail.ts` (stylesheet by order locale, no fallback).
- `middleware/locale.ts` (cookie session, default locale, `?locale=` per-request override), `routes/api/session.get.ts`, `routes/api/locale.post.ts` (400 "Unable to change the language"), `routes/api/locales.ts` (configured list from `LOCALES`/`DEFAULT_LOCALE`).
- `src/i18n/` (provider, `useScreen`, en_US/ja_JP/zh_CN dictionaries, no de_DE), wired in `src/main.tsx`; `<html lang>` follows the resolved locale.
- `src/pages/locale.tsx` Language page (selection, confirmation, error alert); `/localization` re-exports it. Shell, landing and `PRIMARY_AREAS` now localized and point at `/locale`; header language control and footer "Change language" link.
- Wiring: `server` added to `tsconfig.node.json`. `vitest.config.ts` unchanged (tests sit under `routes/`).

## Deviations

- Unit tests are in `routes/localization/*.test.ts`, not colocated in `server/` (see tdd-test-result.md).
- Choice control is a `<select>` (S1); see `design-check.md` for every difference.
- Preferred language (task 2.3, SWHR8-C-0018) is the `sessions.changeLocale` call, unit-tested; the browser case is deferred to SWHR8-I-0005.

## AC coverage

All 26 ACs: server scenarios by `routes/localization/*.test.ts` and `routes/api/locale-session.test.ts`; screens/Language page by `src/i18n/locale-provider.test.tsx`, `src/pages/locale.test.tsx`, `src/pages/_layout.test.tsx` and `e2e/localization.spec.ts`.

## Verification

`bun run lint`, `bun run typecheck`, `bun run build` pass; `bun run test` 96 passed; `bun run test:e2e` 13 passed; locked localization + site-shell acceptance tests 24 passed.
