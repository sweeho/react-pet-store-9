# Design check — SWHR8-T-0008

Each mockup was rendered (file://) and the built `/locale` page screenshotted with Playwright at the mockup's viewport. Pairs are in `design-check/`.

| Mockup                                             | Route / state         | Viewport | Mockup                                              | Built                                              |
| -------------------------------------------------- | --------------------- | -------- | --------------------------------------------------- | -------------------------------------------------- |
| `mockup-language-selection.html`                   | `/locale`, default    | 1440     | `design-check/language-selection-mockup.png`        | `design-check/language-selection-built.png`        |
| `mockup-language-selection-mobile.html`            | `/locale`, default    | 390      | `design-check/language-selection-mobile-mockup.png` | `design-check/language-selection-mobile-built.png` |
| `mockup-language-changed-confirmation.html`        | `/locale` after ja_JP | 1440     | `design-check/language-changed-mockup.png`          | `design-check/language-changed-built.png`          |
| `mockup-language-changed-confirmation-mobile.html` | `/locale` after ja_JP | 390      | `design-check/language-changed-mobile-mockup.png`   | `design-check/language-changed-mobile-built.png`   |

The error alert state is covered by the unit test and `e2e/localization.spec.ts` (SWHR8-C-0024), not by a screenshot pair.

## Differences left

- **Choice control**: a native `<select>` instead of the mockup's radio cards. The locked spec (SWHR8-C-0022..24) drives a `<select>` labelled "Language" (design.md S1). The helper line under the select carries the English name, the Default tag and the "no German screens yet" note that the cards showed.
- **Navigation**: the mockups draw Catalog, Search, Cart, Account, Administration, which do not exist yet. Only Home and Language ship. The footer "You"/"Shop" columns are the existing single "Explore" column plus a "Change language" link.
- **Header language control**: a small link showing the locale code, added per design L6. The mockup has none.
- **Type weight and sizes**: headings use the shared Tailwind tokens (heavier weight than the mockup's literal values); the token wins.
- **Sample data**: "profile" in the Good to know note is plain text, because `/account` does not exist yet.
- **Confirmation actions**: "Browse the catalog" is not built (no `/catalog` yet).
