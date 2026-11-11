---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0002
capability_brief: SWHR8-I-0003
branch: vortex/sprint/swhr8-s-0002-885750e9
upstream: [artifacts/SWHR8-S-0002/qa-test-report.md]
---

# Release notes — SWHR8-S-0002

## Added

- The store can now be used in US English, Japanese or Simplified Chinese. A new visitor sees US English. (SWHR8-T-0008)
- A **Language** page lets shoppers pick US English, Deutsch, 日本語 or 简体中文 and confirms the language now in use. Every later page in the visit uses it. It opens from the header's language control and the footer's "Change language" link. (SWHR8-T-0008)
- If the language cannot be understood, the page says it was unable to change the language, and the current language stays. (SWHR8-T-0008)
- Choosing German shows English pages, because no German pages exist yet. A link that names a language shows that one page in it. (SWHR8-T-0008)
- After 30 minutes of inactivity the visit ends, and the store returns to US English. (SWHR8-T-0008)
- Behind the scenes, ready for the catalog, account and order capabilities: per-language catalog text with no substitution from another language, per-language price and number formatting, correct handling of Japanese text sent in UTF-8, SJIS or JIS, and order e-mails chosen by the order's language with no English fallback. (SWHR8-T-0008)

## Changed

- The Language entry in the navigation and on the landing page now opens `/locale`. The old `/localization` address still works. (SWHR8-T-0008)
- The header, navigation, footer and landing page are shown in the chosen language. (SWHR8-T-0008)

## Fixed

- Browser acceptance tests for each capability were never picked up by their test configuration. They now run. (SWHR8-T-0003)

## Upgrade notes

- No database migration.
- New optional settings `LOCALES` (default `en_US,ja_JP,zh_CN`) and `DEFAULT_LOCALE` (default `en_US`).
- New endpoints: `GET /api/session`, `POST /api/locale`. `GET /api/locales` now returns every configured language.
- Visits are held in server memory, so a server restart starts every visit again in US English.

## Not included

- The language list uses a drop-down rather than the selectable cards shown in the design.
- The confirmation's "Browse the catalog" action, catalog text on screen, and applying a customer's preferred language on profile save arrive with Catalog browsing (SWHR8-I-0004) and Customer account (SWHR8-I-0005).
- Sending order e-mails arrives with Customer notifications (SWHR8-I-0009).

## Verification

Verified at integration QA: all 27 scenarios pass, with no defects. See `artifacts/SWHR8-S-0002/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0002/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0002/qa-test-report.md` | Satisfied | —         |
