# Discovery report SX-0001

Legacy: Java Pet Store 1.3.2 (J2EE/EJB 2.0, JMS, JSP, custom WAF). 572 files under `legacy-source/`.

## Structure

- 4 applications: petstore (storefront), opc (order processing center, MDBs), supplier (fulfillment/inventory), admin (Swing client).
- 18 components (EJB/helper), WAF framework, DDL in `db/schema`, 7 batch jobs plus `db/batch` SQL, Control-M export, `conf`.
- Flow: storefront -> JMS -> OPC approval -> supplier -> invoice -> OPC.

## Risk ranking

Highest: opc (approval logic, state transitions), petstore (screens, validation, order entry), purchaseorder, supplier, signon, db constraints, batch (retention thresholds as literals). See `risk-scores.csv`. Locale JSP copies (`zh/`, `ja/`) are counted once in screens.

## Exclusions

- Third-party/boilerplate: `app/src/lib` (JSTL TLDs, base64), build scripts (`build.xml/.sh/.bat`), `setup.*`.
- Licence HTML, populate DTDs and sample data XML (reference only).
- Localised JSP duplicates (`zh/`, `ja/`) are read only for message differences.
- `clientstatetag_test.jsp` and `waf` test/demo pages: likely dead, flag if used.

## Notes for later stages

- README states approval limits (US 500, JP 50000) but these were not verified here; confirm in code/properties and mark low confidence if bare literals.
- Batch purge retention 180 days appears in SQL/Control-M; check against script and `conf/petstore.properties` for disagreement.
- Capability list is closed at 11 keys in `capabilities.csv`.
- Module LOC are approximate (java + jsp/xml/sql/sh lines).
