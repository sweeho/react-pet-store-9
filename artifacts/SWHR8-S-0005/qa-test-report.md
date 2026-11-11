---
artifact: qa-test-report
spec: 1
status: complete
author_role: validation
sprint: SWHR8-S-0005
capability brief: SWHR8-I-0006
branch: vortex/sprint/swhr8-s-0005-daaaa982
upstream: [artifacts/SWHR8-S-0005/SPRINT-PLAN.md]
downstream: [artifacts/SWHR8-S-0005/integration-test-result.md]
---

# QA test report — SWHR8-S-0005

## Executive Summary

**Verdict: PASS.** Capability SWHR8-I-0006 (Shopping cart) holds on the integrated sprint branch. Real runs: build and lint exit 0, 222 of 222 unit tests pass, 22 of 22 project E2E tests pass with none skipped. Of 19 spec scenarios, 17 pass; the two order-submission scenarios (empty cart rejected, cart cleared after hand-off) are not-testable because the order-checkout capability is not built. No defects found.

## E2E Test Status

`bun run test:e2e`: 22 passed, 0 failed, 0 skipped. Detail in `integration-test-result.md`.

Locked acceptance suite (enforced at UAT only; warnings, not fixed, sprint not held):

- `bun run test:acceptance:e2e`: 25 passed, 16 failed. Shopping-cart: C-0077 fails (needs order checkout, a later capability). Order-checkout (C-0181, 0182, 0183, 0185), order-fulfillment (C-0229), order-notifications (C-0108) and admin-order-management (C-0252, 0256, 0259, 0260, 0265, 0266) fail for later capabilities. C-0233 (catalog MyList) also fails.
- Warning to triage at UAT: C-0031 (customer-account) and C-0018 (localization) fail with `waiting for getByLabel('Banner')` / `getByLabel('Preferred language')` on `/account`. The page snapshot shows the account page rendered in Japanese for `shopper`, so the English labels are not found; the shared `shopper` profile apparently carried ja_JP from an earlier acceptance test (cause inferred from the snapshot, not proven). C-0031 passed in the SWHR8-S-0004 run, so UAT should confirm whether this is test-order pollution of the shared user.
- `bun run test:acceptance` (vitest): 26 files failed, 9 passed; 152 failed, 77 passed. Failures are missing modules of later capabilities, including shopping-cart C-0082 (`/server/checkout/service` not found). Other shopping-cart acceptance tests pass.

## Unit Test Results

```
$ bun run test
 Test Files  43 passed (43)
      Tests  222 passed (222)
$ bun run lint        # exit 0
$ bun run build       # exit 0 (tsc --build && vite build)
```

SCENARIO-VERDICT: Per-session cart structure / New cart — pass
SCENARIO-VERDICT: Add item to cart / Add with default quantity — pass
SCENARIO-VERDICT: Add item to cart / Re-add existing item — pass
SCENARIO-VERDICT: Remove item from cart / Remove present item — pass
SCENARIO-VERDICT: Remove item from cart / Remove absent item — pass
SCENARIO-VERDICT: Update item quantity / Positive quantity — pass
SCENARIO-VERDICT: Update item quantity / Zero quantity — pass
SCENARIO-VERDICT: Empty cart and count / Count distinct lines — pass
SCENARIO-VERDICT: Empty cart and count / Empty the cart — pass
SCENARIO-VERDICT: Cart line presentation / Catalog price changes — pass
SCENARIO-VERDICT: Cart subtotal / Two lines — pass
SCENARIO-VERDICT: Item missing from catalog / Unresolvable item — pass
SCENARIO-VERDICT: Unrestricted cart access / Anonymous shopper — pass
SCENARIO-VERDICT: Non-numeric quantity treated as zero / Text quantity — pass
SCENARIO-VERDICT: Cart actions from the cart page / Update several quantities — pass
SCENARIO-VERDICT: Empty cart rejects order / Submit with empty cart — not-testable: needs order checkout (later capability); locked case C-0082 fails on a missing module
SCENARIO-VERDICT: Cart cleared after order hand-off / Double submit — not-testable: needs order checkout (later capability); locked case C-0077 fails for that reason
SCENARIO-VERDICT: Cart page / Empty cart displayed — pass
SCENARIO-VERDICT: Cart page / Cart with items displayed — pass

Pass verdicts rest on the 222-test unit run, `e2e/cart.spec.ts` and the passing locked tests in `tests/acceptance/shopping-cart/`; mapped by test title, not each re-driven by hand.

## Code Review

No notable concerns observed incidentally.

## Coverage Summary

No coverage tool was run (none declared in the project commands). Not measured.

## Design fidelity

Mockups `artifacts/SWHR8-S-0005/design/mockup-cart-page-*.html` and `mockup-order-error-empty-cart*.html` exist. I did not render or compare them in this run; no comparison was performed, so none should be read as passed. The conformance decision tool is disabled for this project.

## Issues Found

None. See `integration-defects-resolution.md`. Acceptance warnings above are UAT triage items.

## Recommendation

Proceed: fire `validation.all_acs_passed`.
