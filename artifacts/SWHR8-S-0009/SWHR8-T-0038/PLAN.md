# PLAN — SWHR8-T-0038 Order fulfillment and inventory

Change: `swhr8-i-0010-order-fulfillment-and-inven`. Read `design.md` first: Codebase findings, decisions F1–F12 and Spec discrepancies SD1–SD9. Then the delta spec `specs/order-fulfillment/spec.md` and the locked tests in `tests/acceptance/order-fulfillment/` (their header comments fix the module boundary).

## Objective

Every approved order reaches a supplier order, ships each line in full from stock or waits, produces an invoice per attempt that shipped something, and reaches SHIPPED_PART or COMPLETED at the order center; only COMPLETED triggers the completed-order notification. Administrators set stock on `/admin/inventory`, and a save re-attempts every waiting supplier order in the same transaction.

## Steps

Work `tasks.md` in group order.

1. **Data model (1.1–1.5; F4, F5, F6, F7).** Add `contacts`, `supplierOrders`, `supplierLineItems`, `userRole` to `db/schema.ts`; rename `inventory.qty` → `quantity` with CHECK `>= 0` and no FK to `item`; run `db:generate` and commit the migration. Update the three `qty` callers (catalog seed, test-seed route, catalog check) to the new property without changing their external shapes. `server/fulfillment/repository.ts` (supplier orders, inventory listing) and the purchase-order cascade delegated to new functions in `server/checkout/repository.ts`. `identifiers.ts` (`nextIdentifier`).
2. **Supplier order intake (2.1–2.3; F1, F2, F12).** `documents.ts` readers, `createSupplierPurchaseOrder`, `createSupplierOrder`, `receivePurchaseOrder`; `findSupplierOrdersByStatus`.
3. **Fulfilment and invoicing (3.1–3.5; F2, F3).** `fulfillSupplierOrder`, invoice building (greeting "Dear PetStore Customer", only lines shipped now, shipping date = `now`), `publishInvoices`, `updateInventory`; `server/fulfillment/store.ts` database `Store`.
4. **Inventory update (4.1–4.3; F7, F8, F9).** `server/admin/auth.ts`, admin routes under `routes/api/admin/`, admin field on `GET /api/session`, pages `src/pages/admin/login.tsx` and `src/pages/admin/inventory.tsx`, the "Administration" `PRIMARY_AREAS` entry, seed of `jps_admin` and `customer`. Apply SD4 (label "Username", control "Log out", an "Access denied" line on the refused frame).
5. **Order center completion (5.1–5.4; F3).** `order-center.ts`; `order-status.ts` (`setOrderStatus` over `STATUSES`); drains for `order-decision`, `supplier-purchase-order` and `invoice` in `server/fulfillment/queue.ts`, fanning out `shipped`/`completed` on `order-status-mail`.
6. **Documents and messaging (6.1–6.4; F10).** Serializers, `validateDocument`, queue-name constants.
7. **Resource lookup (7.1–7.3; F11).** `resources.ts`, `process-manager.ts` (`deliverMessage`, a failing delegate rejects with a transition error).
8. **Tests.** As design.md Phase 8: locked suites, unit tests under `src/test/server/fulfillment/` and `src/test/server/admin/`, UI tests beside the two pages, one `e2e/` spec for admin sign-in → save. Title tests with case keys where one applies.

## Interface contract (fixed)

- Module boundary and `db/schema.ts` exports exactly as the header comments of `tests/acceptance/order-fulfillment/*.ts`.
- Queue names: `order-decision` (consumed here only), `supplier-purchase-order`, `invoice`; events published on `order-status-mail` as `<OrderEvent><OrderId/><Event>shipped|completed</Event></OrderEvent>`.
- `GET /api/session` gains `admin: { userName, isAdministrator } | null` (additive). `POST /api/admin/signon {userName,password}`, `POST /api/admin/signoff`, `GET /api/admin/inventory` → `{ items: [{ itemId, description, quantity }] }`, `POST /api/admin/inventory {quantities: Record<itemId, number|string>}`. Admin APIs answer 401 signed out, 403 without the role.
- Role name `administrator`; table `user_role`.

## File/module ownership

- `db/schema.ts`, `drizzle/` (new migration + meta), `db/customer-seed.ts`, `db/catalog-seed.ts`
- `routes/api/test/seed.post.ts`, `server/jobs/catalog-check.ts`, `scripts/` caller of it (property rename only)
- `server/fulfillment/*` (new), `server/admin/*` (new), `routes/api/admin/*` (new)
- `server/checkout/repository.ts` (cascade functions only), `routes/api/session.get.ts` (admin field), session middleware only if the admin field needs it
- `src/pages/admin/*` (new), `src/constants/primary-areas.ts`, `src/i18n/` dictionaries (new strings)
- `src/test/server/fulfillment/*`, `src/test/server/admin/*`, `e2e/admin-inventory.spec.ts` (new)

Out of scope: `/admin` launcher, order lists and sales totals (SWHR8-I-0011); low-stock report (SWHR8-I-0013); changes to `server/approval/*` or `server/notifications/*`.

## Design reference

`artifacts/SWHR8-S-0009/design/` (see `MANIFEST.md`):

- `mockup-inventory-update.html` (1440) / `mockup-inventory-update-mobile.html` (390) — `/admin/inventory`, administrator signed in, after a save.
- `mockup-administrator-sign-in-for-inventory-upda.html` (1440) / `mockup-administrator-sign-in-for-inventory-upda-mobile.html` (390) — `/admin/login?next=/admin/inventory`, failed-attempt state.
- `mockup-inventory-update-access-refused.html` (1440) / `mockup-inventory-update-access-refused-mobile.html` (390) — `/admin/inventory`, signed in without the role.

Render each route beside its mockup at its viewport. Where SD4 lists a difference, the locked test wins.

## Definition of Done

AC-1 … AC-47 on the ticket hold, one per scenario. Each locked case in `tests/acceptance/order-fulfillment/` passes; AC-27 (R-0118), AC-37 (R-0153) and AC-38 (R-0154) have no locked case and are evidenced by unit tests. The catalog-browsing, inventory-reporting, order-approval, order-checkout and order-notifications locked suites stay green.
