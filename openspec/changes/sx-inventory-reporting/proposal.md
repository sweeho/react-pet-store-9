# Inventory reporting

## Why

The legacy pet store runs a set of unattended batch jobs (low-stock extract, catalog integrity checks, database backup, web module health probe), a catalog data-load endpoint they depend on, a sales report feed for admin charts, and a diagnostic-output helper. The rebuild has to reproduce their behaviour.

## What changes

- Specifies nine behaviours recovered from the legacy source as delta requirements (see `specs/inventory-reporting/spec.md`).
- No screen records were extracted for this capability.

## Impact

Operational batch behaviour, one HTTP endpoint, and one admin data request.
