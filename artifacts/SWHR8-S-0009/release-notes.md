---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0009
capability_brief: SWHR8-I-0010
branch: vortex/sprint/swhr8-s-0009-2d54314a
upstream: [artifacts/SWHR8-S-0009/qa-test-report.md]
---

# Release notes — SWHR8-S-0009

## Added

- **Approved orders now ship.** Each approved order goes to fulfilment automatically. A line ships only when stock covers its whole quantity, and shipping takes that quantity out of stock. Stock never goes below zero. (SWHR8-T-0038)
- **Invoices.** Each fulfilment attempt that ships something produces an invoice listing only the lines shipped in that attempt, dated today. An attempt that ships nothing produces no invoice, and the order waits. (SWHR8-T-0038)
- **Order progress.** An order becomes partly shipped while lines are outstanding and completed once every line has shipped. With the e-mail switches from the previous release turned on, customers get the shipped e-mail per invoice and the completed e-mail once. (SWHR8-T-0038)
- **Inventory update screen** under Administration (`/admin/inventory`). It lists every item with its quantity on hand. An administrator enters new quantities of zero or more; blank, negative and non-whole entries are flagged and ignored. Saving immediately retries every waiting order, and any that can now ship do. (SWHR8-T-0038)
- **Administrator sign-in** (`/admin/login`). Only users with the administrator role can open the inventory screen. Other signed-in users see an access-refused page, and signed-out visitors are sent to sign in. (SWHR8-T-0038)

## Changed

- The site navigation has a new **Administration** entry.
- Stock can now be held for item ids the catalog does not list. A line for an item with no stock record stays unshipped, without an error.

## Upgrade notes

- **Database migration** `drizzle/0005_legal_kulan_gath.sql`: adds the supplier order, supplier line, supplier contact and user role tables, and rebuilds `inventory` with a non-negative check and without its catalog foreign key. It is applied on start.
- **New demo accounts** in the seed: `jps_admin` / `admin` (administrator) and `customer` / `customer-password` (no role). Change or remove them before any public deployment.
- New outbox queues `supplier-purchase-order` and `invoice` in the existing `queue_message` table. No new configuration and no new dependency.

## Not included

- Order listing, approval and sales screens for administrators come with Admin order management (SWHR8-I-0011), which will reuse this sign-in.
- Low-stock and other operational reports come with Inventory reporting.

## Verification

Verified at integration QA: all 47 scenarios pass, E2E passes 26 of 26, and QA found no defects. See `artifacts/SWHR8-S-0009/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0009/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0009/qa-test-report.md` | Satisfied | —         |
