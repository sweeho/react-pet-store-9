# PLAN — SWHR8-T-0008 Localization

Change: `swhr8-i-0003-localization` (proposal, design, `specs/localization/spec.md`, test-cases). **Read the change's design.md first**, especially its "Sprint SWHR8-S-0002 planning notes" (decisions L1–L11, discrepancies S1–S8). This plan cites those decisions. It does not repeat them.

## Objective

Deliver the whole localization change. The store opens in en_US. A shopper changes language on `/locale`, and every later page in the session uses it, with screen fallback to en_US. Catalog text is held and returned per locale with no fallback. Requests are UTF-8, and SJIS/JIS is decoded. Numbers and currency are formatted per locale. Order mail picks its template by the order locale. Every task in `tasks.md`, in order.

## Steps

1. **Wiring.** Add `server` to `tsconfig.node.json`, and `server/**/*.test.ts` to the vitest `server` project (design L1).
2. **Locale model** (tasks 1.1, 1.2): `server/localization/locale.ts`, which includes `loadLocaleConfig`, the code parser and `notificationLocale` (L2, L3).
3. **Sessions** (1.3, 1.4, 2.1): `server/localization/sessions.ts` with an injected clock and the 30-minute idle timeout (L4).
4. **Server surface** (2.1, 2.2, 4.1): `middleware/locale.ts`, `routes/api/session.get.ts`, `routes/api/locale.post.ts`, and `routes/api/locales.ts` rewritten to return the configured list (L3, L4, L8).
5. **Screens and client locale** (2.2): `server/localization/screens.ts`, `src/i18n/` (provider, `useScreen`, dictionaries en_US/ja_JP/zh_CN, no de_DE), wired in `src/main.tsx`. `<html lang>` follows the resolved locale (L5).
6. **Shell** (2.2): `_layout.tsx` strings come from the dictionaries, with a header language control and a footer "Change language" link. `PRIMARY_AREAS` points at `/locale` (L5, L6; DESIGN.md §Site shell).
7. **Language page** (2.4): `src/pages/locale.tsx`, with `src/pages/localization/index.tsx` rendering the same page. Selection view, confirmation view and error alert, as in the mockups and the locked spec contract (L6, S1).
8. **Preferred language hook** (2.3): document and unit-test that a profile-save-shaped call to `sessions.changeLocale` switches the session (L11).
9. **Catalog text** (3.1, 3.2): `details.ts`, `catalog-text.ts` (L7).
10. **Encoding and formatting** (4.2, 4.3): `formatCurrency`, `formatNumber`, `parseKeywords`, `readFormField`, `decodeJapanese` for SJIS and JIS (L8, L9).
11. **Mail** (5.1): `server/localization/mail.ts` (L10).
12. **Tests**: colocated unit/route/UI tests for every new module, `e2e/localization.spec.ts`, and `e2e/home.spec.ts` updated for `/locale` (design §Phases 6).

## Design reference

Exported mockups (`artifacts/SWHR8-S-0002/design/`, see MANIFEST.md):

| File                                               | Route / state                    | Viewport |
| -------------------------------------------------- | -------------------------------- | -------- |
| `mockup-language-selection.html`                   | `/locale`, default + error alert | 1440     |
| `mockup-language-selection-mobile.html`            | `/locale`, default               | 390      |
| `mockup-language-changed-confirmation.html`        | `/locale` after submitting ja_JP | 1440     |
| `mockup-language-changed-confirmation-mobile.html` | `/locale` after submitting ja_JP | 390      |

Render each route beside its mockup. The choice control is a `<select>`, not radio cards (S1). Nav entries for areas that do not exist yet are not built.

## Fixed interface contracts

- `server/localization/*`: exact names and signatures as in the header comment of `tests/acceptance/localization/localization.test.ts`. That suite is locked. Do not edit it.
- HTTP: `GET /api/session -> { locale }` (later capabilities add fields), `POST /api/locale { locale } -> 200 { locale } | 400` with message "Unable to change the language", `GET /api/locales -> [{ code }]`.
- Browser: `/locale` has a select labelled "Language" with options `en_US, de_DE, ja_JP, zh_CN` in that order and no placeholder, a button "Change language", `[data-testid="session-locale"]` on success, and `role="alert"` containing "unable to change" on failure. `<html lang>` equals the resolved locale code.
- `@/pages/localization` default export keeps the empty/error frame behaviour asserted by locked site-shell cases SWHR8-C-0139/0140.

## File / module ownership

Create: `server/localization/{locale,sessions,screens,details,catalog-text,mail}.ts` and their `*.test.ts`. Also `middleware/locale.ts`, `routes/api/session.get.ts`, `routes/api/locale.post.ts` and their tests, `src/i18n/**`, `src/pages/locale.tsx` (+ test), and `e2e/localization.spec.ts`.
Modify: `routes/api/locales.ts` (+ test), `src/pages/localization/index.tsx` (+ test), `src/pages/_layout.tsx` (+ test), `src/pages/index.tsx` (+ test, landing strings only), `src/constants/primary-areas.ts`, `src/main.tsx`, `tsconfig.node.json`, `vitest.config.ts`, `e2e/home.spec.ts`.
Read only: `tests/acceptance/**`, `openspec/**`.

## Out of scope

The `/catalog`, sign-on and `/account` pages (SWHR8-I-0004 / I-0005, whose cases SWHR8-C-0018/0019/0020 are deferred there), sending e-mail (I-0009), storing the order locale (I-0007), and the acceptance Playwright config (defect SWHR8-T-0003).

## Definition of Done

- AC-1 … AC-27 of the ticket hold. Each is one scenario of `specs/localization/spec.md`. AC-6, AC-7 and AC-27 are proven here by unit/UI/e2e tests on `/` and `/locale`. Their locked browser cases run when I-0004/I-0005 build the pages.
- The linked locked cases in `tests/acceptance/localization/localization.test.ts` pass, and the site-shell locked cases still pass.
- The Language page matches the four mockups apart from S1.
