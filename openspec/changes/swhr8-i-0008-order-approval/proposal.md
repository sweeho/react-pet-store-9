# Proposal: order-approval

## Why

The legacy Pet Store order processing centre decides whether a newly received order is approved automatically or held for an administrator, tracks the order's status, and exchanges the decision by message. The rebuild has to reproduce those rules.

## What changes

- Automatic approval by locale and total, with administrator hold for everything else.
- Status record per order, the status vocabulary, and the PENDING-only decision guard.
- Supplier and customer-relations messaging when an order is approved.
- OrderApproval and Mail message formats and their validation.
- Order status listing view.

## Impact

New capability `order-approval`. No screen records were extracted for it.
