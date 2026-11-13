# PLAN — SWHR8-T-0042 Admin order management

Change: `swhr8-i-0011-admin-order-management`. Read its `design.md` FIRST — section "Rebuild decisions" (M1–M9) and "Spec discrepancies" (SD1–SD8) — then the delta spec and `test-cases.md`.

## Objective

Deliver the Administration area: administrator-only access with 54-minute idle expiry, a launcher (Manage orders / Log out), order lists by the four statuses with counts, approve/deny of pending orders committed as an asynchronous OrderApproval hand-off, a Refresh warning for unsaved decisions, and sales totals by category or item over a date range. Every task line of the change's `tasks.md` (groups 1–5) belongs to this ticket; work them in order.

## Steps

1. **Access control (tasks 1.1–1.4).** `server/lib/admin-session.ts` (design M2) and wire it into `server/admin/auth.ts` so an admin sign-on idle 54 min is dropped. `server/lib/admin-launcher.ts` + `routes/api/admin/launch.post.ts` (M7). Error replies in `server/lib/admin-requests.ts` (M3).
2. **Order listing (2.1–2.3).** `server/lib/admin-orders.ts` (M5) over `server/checkout/repository.ts` reads; `routes/api/admin/orders.get.ts` through the relay (GETORDERS).
3. **Approval workflow (3.1–3.6).** UPDATESTATUS in `admin-requests.ts` with a production `publish` that enqueues one OrderApproval document on `order-approval` and schedules the drain (M4); `routes/api/admin/update-status.post.ts`; `/admin/orders` page with Commit (two requests: approved set, denied set) and Refresh (`window.confirm` when unsaved) (M8).
4. **Sales totals (4.1–4.2).** `server/lib/admin-sales.ts` (M6); `routes/api/admin/sales.get.ts` (REVENUE / other) reading `order_line_item` joined to `purchase_order.order_date`; `/admin/sales` page.
5. **Pages and nav.** `/admin` launcher with in-place sign-on form, `/admin/logout` logged-out page, `PRIMARY_AREAS` administration href -> `/admin` (M8, M9). Screen strings in all three `src/i18n/screens/*` dictionaries.
6. **Test harness (5.1).** Unit tests per `server/lib/admin-*.ts`, route tests under `routes/api/admin/`, page tests for the four pages, and `e2e/admin-orders.spec.ts` signing on as seeded `jps_admin` and deciding a real PENDING order (design Phases 5). The locked suites in `tests/acceptance/admin-order-management/` pass unchanged.
7. **CI.** No workflow change; the ticket's pull request runs green (design Phases 6).

## Fixed interface contracts

The locked suites in `tests/acceptance/admin-order-management/` code against these; do not change them.
- `server/lib/admin-session.ts`: `createAdminSession(): { id }`, `isAdminSessionExpired(session, now?)` (54 min idle)
- `server/lib/admin-launcher.ts`: `handleAdminAction({ action?, session, host, port })` -> `{kind:"launch",descriptor}` | `{kind:"logout-page"}` | `{kind:"empty"}`
- `server/lib/admin-requests.ts`: `handleOrderServiceRequest({ type, session, orders?, publish? })` -> `Promise<{ kind: "response"|"error"; message }>`; `publish` called once with `{ orders }`
- `server/lib/admin-orders.ts`: `findOrdersByStatus`, `listOrdersByStatus` -> `{ orders, count }` (throws an error named `AdminFacadeError`), `orderStatusView`
- `server/lib/admin-sales.ts`: `salesTotals({ lines, type, start, end, category? })` -> `{ key, total }[]`
- HTTP: `GET /api/admin/orders?status=` -> `{ orders, count }`; `POST /api/admin/update-status` body `{ orders: [{ orderId, status }] }` -> `{ result: "SUCCESS" }`
- Pages: `/admin` (sign-on form in place when not an administrator: password field, "Log in" button, no "Manage orders"), `/admin/orders` (rows carry `data-order-id`, a select labelled "Status", buttons "Commit" and "Refresh", native `confirm`), `/admin/logout` (no logout control)

## Design reference

Mockups are committed in `artifacts/SWHR8-S-0010/design/` (see `MANIFEST.md` there for the route and state each draws):
- `/admin` signed out — `mockup-administrator-login.html` (1440), `mockup-administrator-login-mobile.html` (390)
- `/admin` as administrator — `mockup-administration-launcher.html` (1440), `mockup-administration-launcher-mobile.html` (390)
- `/admin/orders` Pending tab — `mockup-manage-orders-order-lists-by-status.html` (1440), `mockup-manage-orders-order-lists-by-status-mobi.html` (390)
- `/admin/orders` Refresh with unsaved change — `mockup-refresh-with-unsaved-changes-warning.html` (1440), `mockup-refresh-with-unsaved-changes-warning-mob.html` (390); use native `confirm` (SD6)
- `/admin/sales` — `mockup-sales-totals-revenue-or-quantity.html` (1440), `mockup-sales-totals-revenue-or-quantity-mobile.html` (390)
- `/admin/logout` — `mockup-administrator-logged-out.html` (1440), `mockup-administrator-logged-out-mobile.html` (390)

Render each route beside its mockup at the stated viewport. Reuse existing tokens, `src/components/ui`, `src/components/account/ui` (`Page`, `Crumbs`) and the shell frames; no new design tokens.

## File/module ownership

Create:
- `server/lib/admin-session.ts`, `server/lib/admin-launcher.ts`, `server/lib/admin-requests.ts`, `server/lib/admin-orders.ts`, `server/lib/admin-sales.ts` (+ `*.test.ts` beside each)
- `routes/api/admin/launch.post.ts`, `routes/api/admin/orders.get.ts`, `routes/api/admin/update-status.post.ts`, `routes/api/admin/sales.get.ts`, `routes/api/admin/admin-orders.test.ts`
- `src/pages/admin/index.tsx`, `src/pages/admin/orders.tsx`, `src/pages/admin/sales.tsx`, `src/pages/admin/logout.tsx` (+ `*.test.tsx`)
- `src/components/admin/orders-api.ts`, `src/components/admin/admin-sign-on-form.tsx` (extracted from the login page if shared)
- `e2e/admin-orders.spec.ts`

Modify:
- `server/admin/auth.ts` (idle expiry), `src/pages/admin/login.tsx` (use the shared form only), `src/components/admin/api.ts`, `src/components/admin/logout-button.tsx` (go to `/admin/logout`)
- `src/constants/primary-areas.ts` (administration href), `src/i18n/screens/en_US.ts`, `ja_JP.ts`, `zh_CN.ts`
- related existing tests that assert the old nav href

Do not modify: `tests/acceptance/**` (locked), `server/approval/**` (reuse only), `db/schema.ts` (no schema change needed), anything under `openspec/` except ticking nothing (the platform ticks `tasks.md`).

## Definition of Done

AC-1 … AC-23 on the ticket, one per scenario of the delta spec, each proven by the locked acceptance case of the same scenario plus the ticket's own tests. The existing inventory, approval, fulfilment and notification suites stay green.
