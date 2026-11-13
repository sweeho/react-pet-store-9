---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0010
capability_brief: SWHR8-I-0011
branch: vortex/sprint/swhr8-s-0010-4eb2e1df
upstream: [artifacts/SWHR8-S-0010/qa-test-report.md]
---

# Release notes — SWHR8-S-0010

## Added

- **Administration area** at `/admin`. Only users with the administrator role can open it. Anyone else sees the administrator sign-in form in its place. Once signed in, the administrator chooses **Manage orders** or **Log out**. Log out ends the administrator session and shows a logged-out page. (SWHR8-T-0042)
- **Order lists by status** (`/admin/orders`). There are tabs for Pending, Approved, Denied and Completed. Each row shows the order number, the customer's user name, the order date (month/day/year), the value and the status, and each list shows its total. Status matching is exact. (SWHR8-T-0042)
- **Approve or deny held orders.** In the Pending list, each order can be set to Approved or Denied and nothing else. **Commit** sends the approvals and the denials, then reloads the lists. If nothing was changed, nothing is sent. "Sent" means queued for order processing, so an order can show as Pending for a moment after a commit. Applied decisions flow on to fulfilment and to the customer e-mails, as before. (SWHR8-T-0042)
- **Refresh warning.** Choosing **Refresh** with uncommitted decisions asks for confirmation with OK/Cancel. The lists reload only on OK. (SWHR8-T-0042)
- **Sales totals** (`/admin/sales`). Pick a start and end date, both included, and choose Revenue (quantity × unit price) or Quantity. Totals are given per category, or per item when a category is chosen. (SWHR8-T-0042)

## Changed

- The **Administration** navigation entry now opens the `/admin` launcher instead of the inventory screen. The inventory screen is still at `/admin/inventory`.
- An administrator session now ends after **54 minutes** of inactivity. The next action then says the session timed out and asks the administrator to log in again. The customer's 15-minute rule is unchanged.
- **Log out** on the admin pages now shows the logged-out page instead of returning to the sign-in form.

## Upgrade notes

- No database migration, no new configuration and no new dependency.
- Decisions use the existing `order-approval` queue in `queue_message`.

## Not included

- The precision of sales totals still awaits a Business Owner decision. Totals are summed in double precision.
- The sales page shows totals only. The mockup's share column and bars are not built.
- Low-stock, order-extract and other operational reports come with Inventory reporting and the order batch jobs.

## Verification

Verified at integration QA: all 23 scenarios pass, E2E passes 28 of 28, and QA found no defects. See `artifacts/SWHR8-S-0010/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0010/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0010/qa-test-report.md` | Satisfied | —         |
