## 1. Cart model

- [x] 1.1 Define the per-session cart as item id to quantity with one line per item, not persisted beyond the session (SWHR8-T-0021; SWHR8-R-0159)
- [x] 1.2 Implement add with default quantity 1 and replace-on-readd semantics (SWHR8-T-0021; SWHR8-R-0136)
- [x] 1.3 Implement remove (no-op when absent) (SWHR8-T-0021; SWHR8-R-0137)
- [x] 1.4 Implement quantity update (set when > 0, remove when <= 0, adds when absent) (SWHR8-T-0021; SWHR8-R-0158)
- [x] 1.5 Implement empty and distinct-line count (SWHR8-T-0021; SWHR8-R-0138)

## 2. Presentation and totals

- [x] 2.1 Resolve cart lines from the catalog in the shopper's locale without snapshotting prices (SWHR8-T-0021; SWHR8-R-0139)
- [x] 2.2 Compute line totals and subtotal with no discount, tax or rounding (SWHR8-T-0021; SWHR8-R-0025)
- [x] 2.3 Decide and implement handling of items missing from the catalog (disputed) (SWHR8-T-0021; SWHR8-R-0226)

## 3. Cart page

- [x] 3.1 Build the cart page with empty-state message, lines, remove links, editable quantities and total (SWHR8-T-0021; SWHR8-R-0141, SWHR8-R-0161)
- [x] 3.2 Parse submitted quantities, treating non-whole numbers as 0 (SWHR8-T-0021; SWHR8-R-0140)

## 4. Order interaction

- [x] 4.1 Reject order submission on an empty cart with the empty-cart error screen (SWHR8-T-0021; SWHR8-R-0160)
- [x] 4.2 Clear the cart after order hand-off (SWHR8-T-0021; SWHR8-R-0142)
- [x] 4.3 Allow cart operations without role restriction (SWHR8-T-0021; SWHR8-R-0143)

## 5. Verification

- [x] 5.1 Write tests for each scenario in the spec (SWHR8-T-0021; SWHR8-R-0025, SWHR8-R-0136, SWHR8-R-0137, SWHR8-R-0138, SWHR8-R-0139, SWHR8-R-0140, SWHR8-R-0141, SWHR8-R-0142, SWHR8-R-0143, SWHR8-R-0158, SWHR8-R-0159, SWHR8-R-0160, SWHR8-R-0161, SWHR8-R-0226)
