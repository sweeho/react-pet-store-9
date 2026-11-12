---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0007
capability_brief: SWHR8-I-0008
branch: vortex/sprint/swhr8-s-0007-7c22f342
upstream: [artifacts/SWHR8-S-0007/qa-test-report.md]
---

# Release notes — SWHR8-S-0007

## Added

- **Automatic order approval.** A US (en_US) order under 500 or a Japan (ja_JP) order under 50000 is approved automatically shortly after it is placed. (SWHR8-T-0030)
- **Administrator hold.** Every other order stays PENDING for an administrator. This includes an order exactly at the limit and every order in any other language region, such as zh_CN or de_DE. (SWHR8-T-0030)
- **Order status.** Each order has exactly one current status: PENDING, APPROVED, DENIED, SHIPPED_PART (partly shipped) or COMPLETED. Any other value is refused. (SWHR8-T-0030)
- **Decisions only on pending orders.** An approve or deny for an order that is no longer PENDING is ignored. Its status is unchanged and nothing is passed on. (SWHR8-T-0030)
- **Decisions passed on all-or-nothing.** Each applied decision is published for fulfilment and customer e-mails in the same step as the status change. If either fails, neither happens, and a failed send is reported to the caller. (SWHR8-T-0030)
- **Order status listing and lookup by status**, for Admin order management to use. Orders with no status yet are left off. (SWHR8-T-0030)

## Changed

- An order is still recorded as PENDING when it arrives. An auto-approved order moves to APPROVED a moment later, when its approval is processed. (SWHR8-T-0030)

## Upgrade notes

- **Database migration** `drizzle/0004_*` adds the `queue_message` table, the shared message outbox. Apply it before starting the server.
- Queued approvals are processed on the next tick and again on server start, so an approval queued before a restart is still applied.
- No new endpoints and no new screens.

## Not included

- The administrator approve and deny screens arrive with Admin order management (SWHR8-I-0011).
- Nothing acts on an approved or denied order yet. Supplier orders and shipping arrive with fulfilment (SWHR8-I-0010), and order e-mails with customer notifications (SWHR8-I-0009).

## Verification

Verified at integration QA: all 23 scenarios pass, and QA found no defects. See `artifacts/SWHR8-S-0007/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0007/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0007/qa-test-report.md` | Satisfied | —         |
