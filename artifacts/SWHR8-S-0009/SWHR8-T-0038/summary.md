---
ticket: SWHR8-T-0038
sprint: SWHR8-S-0009
artifact: summary
---

# Summary — SWHR8-T-0038 Order fulfillment and inventory

CODE-REVIEW: sub-agent — fixed: customer sign-off now also ends the admin sign-on, inventory page keeps the saved result when the post-save refresh fails and clears the banner on a new edit; rejected: migration negative-qty concern (old column had no CHECK but seeded and written stock is never negative, and drizzle migrates in a transaction), duplicate-invoice mail concern (not reachable: supplier orders are de-duplicated by id and an order completes once).

## What changed

- **Data (tasks 1.x).** `contacts`, `supplierOrders`, `supplierLineItems`, `userRole` added; `inventory` now `{ itemId, quantity }` with CHECK `>= 0` and no FK to `item` (SQL column stays `qty`). Migration `drizzle/0005_*`. Seed gains `jps_admin`/`admin` (role `administrator`) and `customer`/`customer-password`. Catalog seed keeps its external `qty` shape.
- **Core (2.x, 3.x, 5.x, 6.x, 7.x).** Pure modules in `server/fulfillment/` with the signatures the locked tests fix: `service`, `documents`, `line-item`, `order-status`, `identifiers`, `process-manager`, `order-center`, `resources`. Adapters: `repository` (cascade functions delegate to new functions in `server/checkout/repository.ts`), `store` (load, mutate, save in one transaction), `queue` (drains `order-decision` → `supplier-purchase-order` → `invoice` → `order-status-mail`: `shipped` per invoice, `completed` only when the order completed).
- **Admin (4.x).** `server/admin/{auth,repository,inventory}.ts`, `routes/api/admin/{signon,signoff,inventory}`, `admin` field on `GET /api/session`, pages `/admin/login` and `/admin/inventory`, "Administration" nav entry, strings in en_US/ja_JP/zh_CN.

## Decisions and deviations

- The `order-decision` drain is polled once a second (plus on start and after each enqueue) because the approval drain is out of scope and has no hook; `middleware/fulfillment.ts` imports the drains so they start with the server. Polling is off under Vitest.
- Drains call the delegates through `deliverMessage`; a malformed document or an unknown order marks the row `rejected` instead of retrying forever.
- Login and refused-frame wording follow SD4 (see `design-check.md`).
- `receivePurchaseOrder` throws `InvalidDocumentError` for a malformed order rather than returning `accepted: false`.

## AC coverage

All 47 scenarios: the 44 linked cases have tests carrying their keys (copies of the locked unit and storage suites under `src/test/server/fulfillment/`, `e2e/admin-inventory.spec.ts` for C-0229). R-0118, R-0153, R-0154 (no locked case) are covered by `drains.test.ts`, `resources.test.ts` and `process-manager` cases; admin 401/403 by `src/test/server/admin/auth.test.ts`; UI by `src/pages/admin/*.test.tsx`; the sign-in → save happy path by `e2e/admin-inventory-update.spec.ts`.

## Verification

See `tdd-test-result.md`. Platform red run 7cb65aab…, green run 1b6c8012… (locked acceptance tests for the cases pass).
