# Proposal: order-notifications (recovered)

## Why

Recover the behaviour of the legacy customer e-mail notification path: queued mail requests, delivery, failure handling, and the administrator switches that gate order-status mail.

## What changes

- Adds one capability, `order-notifications`, with 18 requirements recovered from the legacy mailer, asyncsender, OPC customer-relations beans and configuration.
- No screens were extracted for this capability.
