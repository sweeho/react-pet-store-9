## Context

Legacy implementation notes only. Order submission is `OrderHTMLAction` (validation, fixed card) then `OrderEJBAction` (id from the `1001` counter, float total, XML via AsyncSender). Order processing center `PurchaseOrderMDB` persists the order as PENDING. Persistence: `purchase_order`, `po_line_item`, `credit_card`, `counter` tables in `petstore_oracle.sql`; CMP beans for card, address, line item and the identifier generator.

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The only UI hint is a user-guide statement that the checkout form is pre-filled (`enter_order_information.jsp`), recorded as a requirement of low confidence.

## Known issues and conflicts

- Order totals use single-precision float with no rounding.
- Checkout always attaches a hard-coded demo card; the customer's stored card is never read.
- Shipping/billing suffixes (\_a/\_b) are swapped relative to variable names in the order action.
- The expiry fallback (01/2010) is a bare literal with no authoritative source.
- Address "mandatory" fields in the interchange format (address pass A) conflict with checkout's required set; the order-number start of 1001 per the runbook is a counter name in code.
- Record keys repeat across pass files (for example ORDER-CHECKOUT-REQ-0001), so `Recovered from:` lines may be ambiguous until ingestion assigns final keys.
