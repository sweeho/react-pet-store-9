# Order fulfillment (recovered)

## Why

The legacy Pet Store application fulfils approved orders through a supplier application: purchase orders arrive on a queue, are stored as supplier orders, shipped from inventory, invoiced back to the order center, and re-attempted when stock is updated. This change records that behaviour as requirements for the rebuild.

## What changes

- Adds the `order-fulfillment` capability: supplier order intake, stock-based shipping, invoicing, pending-order retry, inventory update by a stock clerk, order completion at the order center, the XML documents exchanged, and the data model behind them.
- 74 requirements, one per distinct IR record key. 9 carry approved keys.

## Impact

New capability only. Nothing is modified or removed.
