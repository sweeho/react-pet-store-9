# Admin order management

## Why

Administrators of the legacy pet store review orders by status, approve or deny pending orders, and view sales totals. The rebuild must preserve these behaviours, including the asynchronous hand-off of decisions to order processing.

## What changes

- Restricted administrator access with a launcher entry point and session expiry.
- Listing orders by status (PENDING, APPROVED, DENIED, COMPLETED).
- Approving or denying pending orders, relayed asynchronously as an Order Approval document.
- Order Approval document structure and validation rules.
- Sales totals by category or item over a date range.
- An order status view (id, user, date, value, status).

## Impact

Capability: admin-order-management. No screen records were extracted; see design.md.
