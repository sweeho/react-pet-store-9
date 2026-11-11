---
artifact: sprint-summary
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0005
capability_brief: SWHR8-I-0006
branch: vortex/sprint/swhr8-s-0005-daaaa982
upstream: [artifacts/SWHR8-S-0005/SPRINT-PLAN.md, artifacts/SWHR8-S-0005/qa-test-report.md]
downstream: [artifacts/SWHR8-S-0005/release-notes.md]
---

# Sprint summary — SWHR8-S-0005

Sprint goal met. Every shopper, signed on or not, now has a cart for the visit: add from the item page, edit several quantities in one form, remove lines, see current catalog prices and a US-dollar total, and see a distinct-item count on the header badge. The empty cart and the Order Error page are in place. QA gave a verdict on all 19 scenarios: 17 pass and 2 cannot be tested yet (both need order checkout, SWHR8-I-0007). QA found no defects.

## Tickets

| Ticket       | Type    | Title                                | Outcome                                                            |
| ------------ | ------- | ------------------------------------ | ------------------------------------------------------------------ |
| SWHR8-T-0020 | TASK    | Sprint plan — SWHR8-S-0005           | DONE (commit a408e81)                                              |
| SWHR8-T-0021 | FEATURE | Shopping cart                        | DONE (PR #27, commit b85278e); detail in `SWHR8-T-0021/summary.md` |
| SWHR8-T-0022 | TASK    | Integration QA report — SWHR8-S-0005 | DONE (PR #29, commit 961459c)                                      |
| SWHR8-T-0023 | TASK    | Sprint close bundle — SWHR8-S-0005   | this ticket                                                        |

## What shipped

Against SWHR8-I-0006 (change `swhr8-i-0006-shopping-cart`). SWHR8-T-0021 delivered every task:

- **Model.** `server/cart/cart.ts` holds item ids and quantities only. Add defaults to 1 and replaces an existing quantity. A quantity of zero or less, or anything that is not a whole number, removes the line. Removing an absent item does nothing. `count()` counts distinct lines (design.md K1, K5).
- **Session store and catalog bridge.** `server/cart/store.ts` keeps one in-memory cart per session id. `server/cart/lines.ts` reads prices and text from the catalog module on every listing, in the session locale, and omits items the catalog no longer has (K2, K3, K9).
- **Routes.** `GET /api/cart`, `POST /api/cart/items`, `POST /api/cart/update`, `POST /api/cart/remove`, none protected. `GET /api/session` gained `cartCount`. Sign-off and signed-on idle expiry drop the cart.
- **Screens.** `/cart` (lines, one Update form, remove links, US-dollar total, "Your Shopping Cart is Empty." state), `/checkout/error` (Order Error), Add to cart on the item page, and a Cart navigation entry with a badge. Strings in en_US, ja_JP and zh_CN.
- **Carried case closed.** C-0047 (sign-off clears the cart), deferred from SWHR8-S-0004, now passes in `e2e/cart.spec.ts`.

## Divergence from plan

- **Order submission is split at the cart boundary (design.md K8).** This sprint ships the Order Error page and a cart that can be emptied. Rejecting an empty-cart order and emptying the cart after hand-off need `/checkout`, which SWHR8-I-0007 builds. Cases C-0077 and C-0082 are deferred there.
- **Button text is "Update"**, not the mockup's "Update cart", because the locked tests click "Update" (S2). Money is US dollars in every locale (K6, S3).
- **Code-review fixes in the FEATURE:** a non-whole quantity on add returns 400, non-object quantities on update return 400, the cart view uses one snapshot, and stale cart-page loads are ignored.
- Other mockup differences (no Search/Administration nav entries yet, static hint instead of the "changed quantities" notice, catalog sample names) are listed in `SWHR8-T-0021/design-check.md`.

## Verification

PASS. See `qa-test-report.md`. Verdicts: 17 pass, 2 not-testable (order checkout). Lint and build are clean, 222 of 222 unit tests and 22 of 22 E2E tests pass, and there are no defects (`integration-defects-resolution.md`). The only shopping-cart failures in the locked acceptance tiers are C-0077 and C-0082, both waiting on SWHR8-I-0007. QA did not compare the mockups; design fidelity rests on the FEATURE's own paired screenshots for all six (MCK-9 to MCK-14). Coverage was not measured.

## Known findings carried forward

These are not defects in this sprint's code, but they should not be lost:

- **C-0077 and C-0082 (empty-cart order rejected, cart cleared after hand-off).** Re-verify when order checkout ships in SWHR8-I-0007. Its plan must check for an empty cart before drawing an order number and empty the session cart after hand-off (K8).
- **C-0031 and C-0018 fail in the locked acceptance E2E tier.** The account page renders in Japanese for the shared `shopper` user, most likely because an earlier test saved ja_JP. The FEATURE confirmed C-0031 fails the same way on the parent commit. This is the shared-user risk recorded in SWHR8-S-0004 (design D9), now visible. Triage at UAT.
- **Anonymous carts are never dropped when their session expires.** The FEATURE's code review rejected this as out of scope (not in K2 or the spec). `SWHR8-T-0021/summary.md` says a follow-up ticket was raised, but none exists in the tracker. Carts of expired anonymous sessions stay in memory until the server restarts.
- **Missing catalog items** are dropped from lines and subtotal but still counted on the badge (K9). The Business Owner dispute in PRODUCT.md open questions is unchanged.

## Defects Raised

None. No DEFECT ticket was created during the sprint window, which started 2026-11-11T08:00Z.

## Retrospective

- **Went well:** one FEATURE dispatch delivered the whole change (model, store, four routes, two screens, three dictionaries) and closed C-0047 carried from the previous sprint.
- **Went well:** planning drew the cart/checkout boundary (K8) up front and deferred the two checkout-dependent cases before execution, so no agent was stuck on a case it could not make pass.
- **Could improve:** QA again did not compare any mockup visually. Design fidelity rests only on the implementer's check, for the second sprint in a row.
- **Could improve:** the shared `shopper` user problem flagged last sprint now breaks two locked tests. Tests that change a shared user's profile should create their own user.
- **Could improve:** a follow-up reported as raised was never created. A ticket key should be quoted whenever a follow-up is claimed.

## Compliance / Control Evidence

| Control                        | Evidence                                          | Location                                                                                                      | Status    | Exception                                    |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------- |
| Work planned before execution  | Change proposal, design and tasks; ticket PLAN.md | `openspec/changes/swhr8-i-0006-shopping-cart/`, `artifacts/SWHR8-S-0005/SWHR8-T-0021/PLAN.md`                 | Satisfied | —                                            |
| Change verified before release | QA report, PASS verdict                           | `artifacts/SWHR8-S-0005/qa-test-report.md`                                                                    | Satisfied | Two order scenarios wait on SWHR8-I-0007     |
| Tests executed                 | TDD red/green runs, integration test result       | `artifacts/SWHR8-S-0005/SWHR8-T-0021/tdd-test-result.md`, `artifacts/SWHR8-S-0005/integration-test-result.md` | Satisfied | —                                            |
| Design conformance checked     | Paired mockup/built screenshots                   | `artifacts/SWHR8-S-0005/SWHR8-T-0021/design-check.md`                                                         | Satisfied | Implementer's check only; QA did not compare |
| Defects dispositioned          | 0 found in QA                                     | `artifacts/SWHR8-S-0005/integration-defects-resolution.md`                                                    | Satisfied | —                                            |
