# PLAN — SWHR8-T-0002 Bootstrap, landing page and shared site shell

Change: `swhr8-i-0002-bootstrap-landing-page-and`. **Read the change's design.md first.** Its "Implementation decisions" and "Spec discrepancies" sections are the plan of record, and this file only sequences them. Then read the delta spec `specs/site-shell/spec.md`, `test-cases.md`, and the locked tests in `tests/acceptance/site-shell/`.

## Objective

Every page renders inside one shared shell (header, global navigation, footer). The root route is a Pet Store landing page linking to every primary area. Pages reuse shared empty, error and loading frames. Requirements: Landing page (SWHR8-R-0227), Global navigation (SWHR8-R-0228), Shared page layout (SWHR8-R-0229), Shared state frames (SWHR8-R-0230).

## Steps

Work through `tasks.md` groups in order. Each step cites the design.md section it rests on.

1. **Boilerplate (1.1, 1.2):** design.md, Implementation decisions, "Layout route". Mount `SiteLayout` as the parent route in `src/main.tsx`, exclude `_layout.tsx` from `Pages()`, and make `LoadingFrame` the Suspense fallback. `e2e/smoke.spec.ts` stays as the root-route smoke test and must still find the landing `<h1>`.
2. **Landing page (2.1, 2.2):** "Primary areas are data". Rewrite `src/pages/index.tsx` to `mockup-landing-page*.html`: Pet Store `<h1>`, intro copy, and one link card per `PRIMARY_AREAS` entry. Template copy goes. Rewrite `src/pages/index.test.tsx`.
3. **Site shell (3.1, 3.2):** "Shell landmarks". Add `src/pages/_layout.tsx` and `src/constants/primary-areas.ts` (re-export from `src/constants/index.ts`). Restyle `NotFound.tsx` so it reads as content inside the shell. Add `src/pages/_layout.test.tsx` covering the landmarks, the Home link and the mobile menu.
4. **Shared frames (4.1–4.3):** "Shared frames", "Load helper", "Localization area entry page". Add `src/components/shell/` (empty, error, loading frames, index, tests), `src/hooks/use-load.ts` (+ test), `src/pages/localization/index.tsx` (+ test), and `routes/api/locales.ts` (+ `routes/api/locales.test.ts`). `RootErrorBoundary.tsx` reuses `ErrorFrame`.
5. **E2E:** replace `e2e/home.spec.ts` with landing + navigation coverage at 1280px and 390px (menu opens, Home returns to `/`, an unknown path shows not-found inside the shell).
6. **Acceptance:** the five locked cases in `tests/acceptance/site-shell/` pass. The browser spec is not picked up by the acceptance Playwright config (DEFECT SWHR8-T-0003), so run it directly against the dev server on :5178. Never edit a locked test. Dispute it if it is wrong.

## Fixed interface contracts

- `src/pages/_layout.tsx`: `export default function SiteLayout(): JSX.Element`. Renders `<Outlet />` inside `<main>`, between `<header>` and `<footer>`. The first `<nav>` in DOM order is the global nav and contains `a[href="/"]`.
- `src/constants/primary-areas.ts`: `export interface PrimaryArea { slug: string; label: string; href: string; description: string }` and `export const PRIMARY_AREAS: readonly PrimaryArea[]`.
- `src/components/shell`: `EmptyFrame({ title?, message?, children? })` root has `data-testid="empty-frame"`. `ErrorFrame({ title?, message?, onRetry })` root has `data-testid="error-frame"` and `role="alert"`, with a `<button>` "Try again" that calls `onRetry`. `LoadingFrame({ label? })` root has `data-testid="loading-frame"` and `role="status"`.
- `src/hooks/use-load.ts`: `useLoad<T>(load: () => Promise<T>): { status: "loading" | "ready" | "error"; data: T | undefined; retry: () => void }`.
- `GET /api/locales` returns `200` with a JSON array of `{ code: string }`.

## File/module ownership

Create: `src/pages/_layout.tsx`, `src/pages/_layout.test.tsx`, `src/constants/primary-areas.ts`, `src/components/shell/{empty-frame,error-frame,loading-frame}.tsx`, `src/components/shell/{empty-frame,error-frame,loading-frame}.test.tsx`, `src/components/shell/index.ts`, `src/hooks/use-load.ts`, `src/hooks/use-load.test.ts`, `src/pages/localization/index.tsx`, `src/pages/localization/index.test.tsx`, `routes/api/locales.ts`, `routes/api/locales.test.ts`.
Modify: `src/main.tsx`, `vite.config.ts`, `src/pages/index.tsx`, `src/pages/index.test.tsx`, `src/pages/NotFound.tsx`, `src/pages/RootErrorBoundary.tsx`, `src/constants/index.ts`, `src/hooks/index.ts`, `src/components/index.ts`, `e2e/home.spec.ts`, `e2e/smoke.spec.ts` (only if the heading assertion needs it).
Do not touch: `tests/acceptance/**` (locked), `openspec/**` apart from ticking nothing (the platform ticks `tasks.md`), `playwright.acceptance.config.ts`, `tailwind.config.ts`.

## Design reference

Exported mockups in `artifacts/SWHR8-S-0001/design/` (see `MANIFEST.md`). Render the route beside each one:

- `mockup-landing-page.html` (1440) / `mockup-landing-page-mobile.html` (390): route `/`.
- `mockup-site-shell.html` (1440) / `mockup-site-shell-mobile.html` (390): any page, e.g. `/localization`. Mobile shows the nav collapsed behind a menu button.
- `mockup-empty-state.html` / `-mobile.html`: `/localization` when `/api/locales` returns `[]`.
- `mockup-error-state.html` / `-mobile.html`: `/localization` when `/api/locales` fails. The "Try again" button reloads.

The mockups' tokens equal `src/index.css`, so use the existing token classes and do not add new tokens. The mockups draw seven nav entries, but ship only Home + Language (design.md D1).

## Definition of Done

AC-1 to AC-5 on the ticket (one per scenario) hold. Every task line 1.1–4.3 is implemented. The locked site-shell acceptance tests pass. The app builds, and its unit and e2e suites are green on the sprint branch.
