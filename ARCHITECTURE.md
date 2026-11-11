# Architecture

See [PRODUCT.md](./PRODUCT.md) for what this is, [DESIGN.md](./DESIGN.md) for the visual system.

## Stack

- **Framework**: Vite 8 running a React 19 SPA + a Nitro 3 server together
- **Language**: TypeScript 5 (strict)
- **Frontend routing**: `vite-plugin-pages` (file-based) + `react-router` 8
- **Backend routing**: Nitro 3 / H3 2 (file-based)
- **Database**: SQLite via Bun's built-in `bun:sqlite` + Drizzle ORM — schema/client in `db/`, migrations in `drizzle/`. Requires the Bun runtime (dev, test, and production — see Deployment below)
- **Styling**: Tailwind CSS v4 (CSS-first, no `tailwind.config.ts`) + `tw-animate-css`
- **UI primitives**: shadcn/ui-style — Radix Slot, `class-variance-authority`, `cn()`
- **Icons**: `lucide-react`, `@heroicons/react`
- **Auto-imports**: `unplugin-auto-import` — `react` + `react-router` need no import
- **Fonts**: `unplugin-fonts` (config in `configs/fonts.config.ts`)
- **Tests**: Vitest + Testing Library (unit/integration/UI), Playwright (E2E/smoke)
- **Lint/format**: ESLint 9 + typescript-eslint, Prettier, Husky + lint-staged

## Directory structure

```
.
├── src/
│   ├── components/ui/   # shadcn/ui-style primitives (+ *.test.tsx)
│   ├── components/shell/ # Shared empty / error / loading frames every page reuses
│   ├── constants/primary-areas.ts # The primary areas: one source for nav + landing page
│   ├── pages/            # Frontend routes, file-based (+ *.test.tsx); _layout.tsx is the site shell
│   ├── hooks/, utils/, types/, constants/, data/, store/
│   ├── test/              # Vitest setup
│   ├── index.css           # Tailwind v4 + design tokens
│   └── main.tsx
├── src/i18n/              # Locale provider, useScreen(), per-locale screen dictionaries
├── server/                # Framework-free server modules, one folder per capability (e.g. server/localization/)
├── routes/api/            # Backend routes, file-based (+ *.test.ts)
├── middleware/             # Runs before every route handler (session + locale resolution)
├── db/                      # Drizzle schema.ts + client.ts (sqlite connection, migrate, seed)
├── drizzle/                  # Generated SQL migrations (drizzle-kit generate), committed
├── e2e/                     # Playwright specs + global-setup.ts
├── configs/, scripts/
├── server.ts                # Nitro server entry
├── vite.config.ts, vitest.config.ts, playwright.config.ts, drizzle.config.ts
├── tsconfig.json             # src
├── tsconfig.node.json          # server/config/test files
└── package.json
```

## Routing

**Frontend**: `src/pages/**/*.tsx` → routes (`about.tsx` → `/about`, `[id].tsx` → `/:id`, `[...all].tsx` → catch-all). `*.test.tsx` and `_layout.tsx` excluded via `Pages({ exclude })` in `vite.config.ts`.

**Site shell**: `src/main.tsx` mounts `src/pages/_layout.tsx` once as the parent route of every generated page route, so every page (including not-found) renders inside the shared header, global navigation and footer via `<Outlet />`. Pages render content only; they never draw chrome. Navigation entries come from `src/constants/primary-areas.ts`. Requirements: `openspec/specs/site-shell/`.

**Backend**: `routes/api/*.ts` → `/api/*`, `middleware/*.ts` runs first and can set `event.context`. Requires `nitro({ serverDir: "./" })` in `vite.config.ts` — default is `false` (no scanning). `*.test.ts` excluded via `nitro({ ignore })`.

## Data flow example

`GET /api/hello`: `middleware/auth.ts` sets `event.context.user` → `routes/api/hello.ts` reads it and responds. `routes/api/users/[id].ts` shows the dynamic-route + `createError()` 404 pattern, backed by a real query against `db/client.ts`'s Drizzle instance.

## Session and locale

Every request passes through one session middleware. It resolves an HTTP-only session cookie, renews a session idle for 30 minutes or more, and puts `sessionId` and the request's `locale` on `event.context`. The locale is a `?locale=` parameter for that request, otherwise the session locale, otherwise the configured default (en_US). `GET /api/session` exposes the session state. The client mirrors it in one `LocaleProvider`, which sets `<html lang>` and serves screen strings from per-locale dictionaries. A locale with no dictionary falls back to the default. Catalog text never falls back. Requests and responses are UTF-8. Behaviour: `openspec/specs/localization/` (after this sprint lands). Implementation: `server/localization/`, `middleware/`, `src/i18n/`.

## Database

`db/schema.ts` defines Drizzle tables; `db/client.ts` opens the SQLite connection, runs pending migrations from `drizzle/`, and seeds two demo users if the table is empty. Routes import `db` and the table objects directly (see `routes/api/users/`) — no repository layer.

- `bun run db:generate` — after editing `db/schema.ts`, generates a new migration into `drizzle/` (via `drizzle-kit`, config in `drizzle.config.ts`)
- `bun run db:studio` — browse the db in Drizzle Studio
- The db file itself is `sqlite.db` at the project root (gitignored, created on first run); `drizzle/` migrations are committed
- Under Vitest (`VITEST=true`), `db/client.ts` swaps in an in-memory db instead, so tests never touch the dev database

## Testing

Four tiers, one worked example each. Commands and how to extend: [README.md](./README.md#testing), [AGENTS.md](./AGENTS.md).

## Deployment

- `ecosystem.config.js` (PM2) runs the real build: `.output/server/index.mjs`, under Bun (`interpreter: "bun"`) — required by `db/client.ts`'s `bun:sqlite` import. `nitro.service` (systemd) is the non-PM2 equivalent, same requirement.
- `Dockerfile`/`docker-compose.yml` build a static `dist/` served by nginx — don't rely on them for the Nitro/DB-backed API without fixing first (they never run `.output/server/index.mjs`)

## Key Decisions

- **One session, one cookie.** Every capability attaches its per-visitor state (locale, sign-on, cart) to the session id from the session middleware and extends `GET /api/session` additively. None mints a second session. Rationale: sign-off keeps the locale, and timeout must expire everything together. Authored in change `swhr8-i-0003-localization` (design.md, L4).
- **Screen text comes from per-locale dictionaries.** Pages and the shell read user-facing strings through `useScreen()`, never as hard-coded literals. A locale without a dictionary falls back to en_US. Rationale: ja_JP and zh_CN shoppers must get every screen in their language. Authored in change `swhr8-i-0003-localization` (design.md, L5).
- **Catalog text is keyed by (entity id, locale) with no fallback.** Persistent detail rows are unique per (id, locale). A request returns only rows of the requested locale, and a null locale is an error. Rationale: the approved spec forbids substituting another language. Authored in change `swhr8-i-0003-localization` (design.md, L7).

- **One shell, mounted once as the parent route.** Every page renders inside `SiteLayout` (`src/pages/_layout.tsx`); a capability adds a page, never its own header, nav or footer. Rationale: the store reads as one product and chrome changes land in one file. Authored in change `swhr8-i-0002-bootstrap-landing-page-and` (design.md).
- **Primary areas are one data list.** A capability that ships a primary area adds one entry to `PRIMARY_AREAS`; the nav and landing page both render from it. Rationale: no second menu, no landing page drift. Authored in change `swhr8-i-0002-bootstrap-landing-page-and`.
- **Pages reuse the shared state frames.** Loading, empty and error states use `src/components/shell` (`useLoad` for fetch state), not page-local markup. Rationale: one empty/error/retry behaviour across capabilities. Authored in change `swhr8-i-0002-bootstrap-landing-page-and`.
