# Summary — SWHR8-T-0002

Every page now renders inside one shared shell; the root route is a Pet Store landing page; empty, error and loading frames are shared and shown on a new `/localization` page backed by `GET /api/locales`.

CODE-REVIEW: self-review — sub-agent not used; diff reviewed against the ACs and mockups. Fixed: setState-in-effect for the drawer (now derived from pathname), error-frame icon sizing. Rejected: none.

## Changes

- `src/pages/_layout.tsx` (header, `nav[aria-label=Global]`, `main` with Outlet, footer, headlessui mobile menu), mounted once in `src/main.tsx`; `vite.config.ts` excludes it from `Pages()`.
- `src/constants/primary-areas.ts`: `PRIMARY_AREAS` (one entry, Language → `/localization`); nav, footer and landing render from it.
- `src/pages/index.tsx`: landing page per `mockup-landing-page*.html`.
- `src/components/shell/*`: `EmptyFrame`, `ErrorFrame`, `LoadingFrame`; `NotFound`, `RootErrorBoundary` and the Suspense fallback reuse them.
- `src/hooks/use-load.ts`, `src/pages/localization/index.tsx`, `routes/api/locales.ts`.
- Tests: unit/UI per module, route test, rewritten `e2e/home.spec.ts` (desktop + 390px).

## AC coverage

AC-1 landing links to every area (C-0136); AC-2 Home link in global nav on every page incl. not-found (C-0137); AC-3 content inside banner/nav/footer (C-0138); AC-4 empty frame (C-0139); AC-5 error frame with Try again (C-0140).

## Deviations

- Nav and landing show only Language besides Home (design.md D1). Mockup differences are in `design-check.md`.
- `src/pages/[...all].test.tsx` wrapped in `MemoryRouter` because NotFound now renders a `Link`.
- Green run is `unofficial` because of the `vite.config.ts` change; it needs a person's approval.

## Verification

`bun run verify` pass (34 tests); `bun run build` pass; `bun run test:e2e` 7 passed; locked acceptance spec run directly: 2 passed.
