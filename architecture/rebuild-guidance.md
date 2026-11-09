# Rebuild guidance

Guidance for the team rebuilding the Java Pet Store 1.3.2 from the extracted specification.

## Source of truth

- Each capability's delta spec under `openspec/changes/sx-<capability>/specs/` is the contract. `api/openapi.yaml`, `architecture/erd.mermaid` and `architecture/schema.sql` describe the legacy system and lose to a delta spec on any disagreement.
- Build in `build/manifest.yaml` order; each capability depends only on earlier ones.

## Target stack

Build on this repository's pinned stack (Vite React SPA, Nitro/H3 routes, SQLite via Drizzle in `db/`, migrations in `drizzle/`). Do not reproduce the J2EE structure (EJB, JMS, Struts-style controllers, JSP screens). Map the asynchronous hand-offs (order submission, approval decisions, supplier orders, invoices, mail) to the simplest in-process or queue mechanism the specs allow, keeping the observable behaviour.

## Points that need care

- Money and quantities: keep two-decimal prices; line quantity must be positive and shipped never exceeds ordered.
- Order status is one of PENDING, APPROVED, DENIED, COMPLETED; decisions apply only to PENDING orders. Supplier order status is PENDING or COMPLETED.
- Auto-approval limits (en_US 500, ja_JP 50000) are configuration values with no authoritative business source; make them configurable and confirm them.
- Notification mail is off by default behind three independent switches.
- Legacy stores passwords and card numbers in clear. Do not copy this; follow the delta specs and raise protection as an open decision.
- Locales are en_US, ja_JP, zh_CN. The de_DE option on the locale demo page has no screens.
- Batch jobs (extract, aging, purge, inventory, catalog check, backup, health) become scheduled jobs; keep their documented exit codes and retention rules.

## Open disputes carried from extraction

- Items missing from the catalog are silently dropped from the cart (shopping-cart).
- Locale selection screen reachability (localization).
- Many customer-account and fulfilment records await SME review; `reviewedBy` is null in the manifest for all capabilities.
