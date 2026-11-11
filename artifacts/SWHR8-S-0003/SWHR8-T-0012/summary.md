# SWHR8-T-0012 — Catalog browsing and search

## What changed

- **Data:** `category`, `product`, `item`, per-locale `*_details` and `inventory` tables (`db/schema.ts`, migration `drizzle/0001_*`); legacy sample catalog converted to `db/seed/catalog.json` and loaded when the catalog is empty (`db/client.ts`, `db/catalog-seed.ts`).
- **Catalog module:** `server/catalog/catalog.ts` (`createCatalog`, `paginate`, `CatalogError`, page size 2), `store.ts` (validating writer), `source.ts` (Drizzle/SQLite source), `index.ts` (shared instance).
- **Check:** `server/jobs/catalog-check.ts` (C1–C5, bit-coded exit) and `scripts/catalog-check.ts` (`bun run catalog:check`).
- **API:** `routes/api/catalog/{categories,category/[id],product/[id],item/[id],search}`; `routes/api/test/seed.post.ts` (upsert, 404 in production).
- **Screens:** `/catalog`, `/category/:id`, `/product/:id`, `/item/:id`, `/search`, components in `src/components/catalog/`, nav entry, landing "Browse the catalog" button, keys in the en_US, ja_JP and zh_CN dictionaries.

## AC coverage

AC-1/AC-14 page size and Next/no Previous: `category/[id].test.tsx`, locked e2e C-0242/0244. AC-2 MyList: `catalog/index.test.tsx` (stubbed session; e2e C-0233 deferred to SWHR8-I-0005). AC-3/AC-6/AC-8/AC-15 check and store: `src/test/server/{catalog-check,store}.test.ts`. AC-4/AC-5/AC-9/AC-13/AC-17 paging, search and empty query: `src/test/server/catalog.test.ts`, `routes/api/catalog/catalog.test.ts`. AC-7/AC-16 locale and lookup: same. AC-10, AC-12 Access modes/DB-specific SQL: met as design D1/D2 (one module, one `source` seam). AC-18 item prices: `item/[id].test.tsx`, locked e2e C-0247. C-0019/C-0020: already passing in unit tests; `/catalog` heading verified by the locked e2e.

## Deviations

- **Seed upserts instead of replacing** (design C7 said replace). Browser tests run in parallel against one server, and a replace by one test wiped the catalog another had just seeded (C-0242 failed in a full run).
- Unit tests for the server modules live in `src/test/server/`: the platform does not recognise `server/**/*.test.ts` as test files.
- `tsconfig.node.json` includes `db/seed/*.json` so the seed import type-checks.
- No header search box (mockups put it on the Catalog and Search pages). Other differences are in `design-check.md`.
- The check reports real findings on the seed (EST-15 lacks a ja_JP description, EST-26 priced below cost in ja_JP). That is legacy data, left as is.

## Verification

- `bun run verify` (lint, typecheck, 145 unit/route tests): pass.
- `bun run test:e2e`: 15 passed (includes new `e2e/catalog.spec.ts`).
- `bun run test:acceptance:e2e`: C-0019, C-0020, C-0242, C-0244, C-0247 pass; C-0233 fails as expected (deferred); other capabilities' specs fail (not built).
- Recorded runs: red `dce38591-122a-45f8-842c-d716ccfde38f`, green `7e3083dc-d4e6-4624-8fde-4f5f081b84e6` (re-run after the final commit, see ticket comment).

CODE-REVIEW: sub-agent — fixed: item page did not reload when the id changed (now keyed), test seed body not validated (now 400 for non-arrays); rejected: gating the seed route behind a new env opt-in (design C7 specifies the NODE_ENV production refusal), blank-query double check (consistent today).
