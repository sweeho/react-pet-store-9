# Shopping cart (recovered from legacy)

## Why

The legacy Java Pet Store keeps each shopper's cart in a stateful session component and exposes it through a cart page and an order-submission path. This change records that behaviour so the rebuild can match it.

## What changes

- Adds the shopping-cart capability: item add/remove/quantity update, emptying, line presentation and subtotal, the cart page, and the cart's interaction with order submission (empty-cart rejection, clearing after hand-off).
- Records one disputed behaviour (items missing from the catalog silently dropped) for Business Owner decision.

## Impact

Specs: `shopping-cart`. Related capabilities: order-checkout, catalog-browsing, localization.
