## 1. Cart model

- [ ] 1.1 Define the per-session cart as item id to quantity with one line per item, not persisted beyond the session
- [ ] 1.2 Implement add with default quantity 1 and replace-on-readd semantics
- [ ] 1.3 Implement remove (no-op when absent)
- [ ] 1.4 Implement quantity update (set when > 0, remove when <= 0, adds when absent)
- [ ] 1.5 Implement empty and distinct-line count

## 2. Presentation and totals

- [ ] 2.1 Resolve cart lines from the catalog in the shopper's locale without snapshotting prices
- [ ] 2.2 Compute line totals and subtotal with no discount, tax or rounding
- [ ] 2.3 Decide and implement handling of items missing from the catalog (disputed)

## 3. Cart page

- [ ] 3.1 Build the cart page with empty-state message, lines, remove links, editable quantities and total
- [ ] 3.2 Parse submitted quantities, treating non-whole numbers as 0

## 4. Order interaction

- [ ] 4.1 Reject order submission on an empty cart with the empty-cart error screen
- [ ] 4.2 Clear the cart after order hand-off
- [ ] 4.3 Allow cart operations without role restriction

## 5. Verification

- [ ] 5.1 Write tests for each scenario in the spec
