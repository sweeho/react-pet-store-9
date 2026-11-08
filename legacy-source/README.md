# Java Pet Store 1.3.2: Vortex modernisation example

The complete Sun Java Pet Store Demo 1.3.2 source, with everything a legacy
modernisation tool needs beside the code: database DDL, batch jobs and a
Control-M schedule, configuration, user and operations guides, sample data and
an answer key. It is the full-size counterpart of
[j2ee-pet-store-lite](../j2ee-pet-store-lite), which keeps 3 of the 12
capabilities.

## What is original and what is added

| Part | Origin |
|---|---|
| `app/` | Original source from `petstore-1_3_2.zip`: 4 applications (storefront, order processing center, supplier, admin client), 18 components, the WAF framework. Unchanged. Binaries (`*.ear`, `*.jar`, `*.gif`, `*.jpg`) and the bundled Ant are left out. |
| `docs/sun` | Original Sun documentation (installing, configuring, using, building) |
| `db/schema` | Added. Catalog tables from `PopulateSQL.xml`. All other tables are the relational form of the CMP entity beans, which the J2EE RI creates at deploy time. Cloudscape and Oracle variants. |
| `batch`, `db/batch`, `conf`, `scheduler/control-m` | Added. Seven batch jobs on the real tables, their SQL, settings and a Control-M export (2 folders, 7 jobs). |
| `docs/guides`, `docs/*.pdf` | Added. User Guide, Administration Guide (both follow the Sun docs) and Operations Runbook. |
| `data` | Catalog, user, customer and inventory rows come from the shipped populate files. Orders are synthetic (see below). |
| `vortex` | Added. Source inputs, upload steps and the answer key. |

The 7 batch jobs, the schema of the CMP tables, the guides, the order history
and the samples were written for this example. They follow the code, but the
original bundle contains none of them.

## Capabilities

12 capabilities across 4 applications, listed in
[vortex/expected-extraction.md](vortex/expected-extraction.md). Orders flow
from the storefront through JMS to the OPC, which approves automatically below
a limit (US 500, JP 50000) or waits for the admin client, then to the supplier,
which ships from inventory and invoices the OPC.

## Data

```sh
python3 data/generate_data.py          # rewrites data/migration, data/seed, data/interface
```

Deterministic. 34 customers, 334 orders over 120 days ending 2026-10-30, with
5 orders stuck in APPROVED so the aging report has something to find.
Load `data/seed/order_history.sql` after the catalog and customers exist.

## Run

The application needs the J2EE 1.3.1 Reference Implementation and Java 1.4
(see `docs/PetStore-admin-guide.pdf`), so it is not packaged to run here. The
batch scripts need Derby `ij` and the layout under `/opt/petstore` and
`/var/petstore`. All the Vortex inputs work without running anything.

## Layout

| Path | Content |
|---|---|
| `app/src/apps` | petstore, opc, supplier, admin |
| `app/src/components` | 18 components: catalog, signon, cart, customer, purchaseorder, supplierpo and others |
| `app/src/waf` | Web application framework (controller, view, template) |
| `db/schema` | `petstore_cloudscape.sql` (runtime), `petstore_oracle.sql` (reference production): 20 tables, 5 indexes, 1 view |
| `db/batch` | SQL run by the batch jobs |
| `batch` | 7 batch shell scripts |
| `scheduler/control-m/PS_PETSTORE.xml` | Control-M DEFTABLE |
| `conf` | `petstore.properties`, `env.sh` |
| `data/migration` | Full table extracts (CSV, with header) |
| `data/interface` | Sample batch output `orders_YYYYMMDD.csv` |
| `data/seed` | Order history SQL |
| `docs` | Guides (PDF and HTML source), Sun documentation |
| `vortex` | Inputs, upload steps, answer key |

## Vortex

See [vortex/README.md](vortex/README.md) for how to add each source and
[vortex/expected-extraction.md](vortex/expected-extraction.md) for what a
correct extraction finds, including 13 findings.

## License

Derived from Java Pet Store Demo 1.3.2, Copyright 2003 Sun Microsystems, Inc.
See `LICENSE.html`, `COPYRIGHT.html` and `IMAGE_COPYRIGHT.html`.
