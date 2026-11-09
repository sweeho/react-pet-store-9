# Design check — SWHR8-T-0002

Screenshots in `design-check/` as `<name>-<desktop|mobile>-<built|mockup>.png` (1440x900 and 390x844). Built screens rendered from the dev server with Playwright; empty and error states use a routed `/api/locales` response (`[]`, 500).

| Mockup                             | Route / state         | Pair                                    |
| ---------------------------------- | --------------------- | --------------------------------------- |
| mockup-landing-page.html / -mobile | `/`                   | `landing-desktop-*`, `landing-mobile-*` |
| mockup-site-shell.html / -mobile   | `/localization`       | `shell-desktop-*`, `shell-mobile-*`     |
| mockup-empty-state.html / -mobile  | `/localization`, `[]` | `empty-desktop-*`, `empty-mobile-*`     |
| mockup-error-state.html / -mobile  | `/localization`, 500  | `error-desktop-*`, `error-mobile-*`     |

## Differences left

- Nav shows Home and Language only; the mockups draw seven entries (design.md D1: no dead links to unbuilt areas). The landing grid has one card for the same reason.
- Landing hero has no "Browse the catalog" / "Search pets" buttons or language chips and the art panel has no Catalog/Cart chips: they point at areas that do not exist yet.
- Mockup empty state draws a "Page title" breadcrumb and placeholder copy; the built page shows the Language heading with the shared frame copy.
- Footer has one "Explore" column generated from `PRIMARY_AREAS` instead of the mockup's Shop / You columns.
- Icons are lucide-react equivalents of the mockup's inline SVGs; colours and radii use the existing `src/index.css` tokens, which equal the mockup values.
