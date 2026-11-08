## Why

The legacy Pet Store runs scheduled batch jobs (Finance extract, stuck-order aging report, weekly purge) that Finance and Operations depend on. They must be preserved in the rebuild.

## What Changes

- Nightly order extract file with trailer and failure mail.
- Nightly aging report (stuck orders, supplier mismatch, counts per status).
- Weekly purge of old COMPLETED/DENIED orders and their personal data.
- Batch schedule, dependencies, settings and exit codes.
- Date-range and user/date order retrieval.

## Impact

Capability: order-reporting-batch. 14 records recovered; no screen records.
