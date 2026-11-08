## Context

Legacy implementation notes for catalog browsing. Each requirement in the spec names the extraction record it was recovered from.

## Legacy implementation

- Queries: `CatalogDAOSQL.xml` (GET_CATEGORY(IES), GET_PRODUCT(S), GET_ITEM(S), search fragments) for Cloudscape and Oracle; `CloudscapeCatalogDAO` and a generic DAO hold the paging loop and search keyword splitting.
- `CatalogHelper` bean has a direct-database path and an EJB path; page size default 2 is a bare literal in the JSPs and helper (the home sidebar uses 5 for its own list).
- Locale is set by each page's sidebar (en_US, ja_JP under ja/).
- Search matches the category identifier, not the category name, although the user guide says "category".
- The item page shows list price and unit cost (labelled as member price); no discount logic was found in this module.
- Schema: category, product, item with `_details` tables per locale; the consistency check is a SQL job with checks C1 to C5.

## User interface

No `kind: screen` records were extracted for this capability (screen count 0); its user interface is unspecified. Display behaviour that was recorded as requirements (page size, banner, item prices, MyList) is in the spec.

## Open questions

- Page size 2 and the `/Populate` unauthenticated endpoint look like demo settings.
- Requirement text spans 41 pass records; the spec uses one representative record key per behaviour.
