## ADDED Requirements

### Requirement: Catalog page size

ID: SWHR8-R-0167
Recovered from: CAB-BR-0001
The system SHALL show catalog listings in pages of 2 items.

#### Scenario: Catalog page size

- **GIVEN** a category with 5 products
- **WHEN** its product list is displayed
- **THEN** 2 products are shown

### Requirement: MyList favourites

ID: SWHR8-R-0030
Recovered from: CATALOG-BROWSING-REQ-0005
The system SHALL show a signed-in customer who has MyList enabled the products of their favourite category, up to 10 entries.

#### Scenario: MyList favourites

- **GIVEN** a signed-in customer with MyList enabled
- **WHEN** the sidebar is displayed
- **THEN** up to 10 products of the favourite category are shown

### Requirement: Catalog consistency check

ID: SWHR8-R-0168
Recovered from: CATB-BR-0003
The catalog check SHALL report, with a failing exit code, every category with no product (C1), every product with no item (C2), every item priced below cost in any locale (C3), every item lacking a description in a locale of its category (C4), and every item with no supplier inventory row (C5).

#### Scenario: Catalog consistency check

- **GIVEN** a product with no item
- **WHEN** the check runs
- **THEN** the product is reported under C2 and the job exits non-zero

### Requirement: Out-of-range page

ID: SWHR8-R-0031
Recovered from: CATB-BR-0004
The system SHALL return an empty page when a page request has a negative start or a start beyond the last row.

#### Scenario: Out-of-range page

- **GIVEN** a list request
- **WHEN** the start offset is -1
- **THEN** an empty page is returned

### Requirement: Empty search query

ID: SWHR8-R-0032
Recovered from: CATB-BR-0006
The system SHALL return an empty page without querying the database when a search query is empty or only whitespace.

#### Scenario: Empty search query

- **GIVEN** a query of spaces only
- **WHEN** a search is made
- **THEN** an empty page is returned and the database is not queried

### Requirement: Catalog structure

ID: SWHR8-R-0033
Recovered from: CATB-ENT-0001
The system SHALL hold the catalog as category, product and item, each product belonging to exactly one category and each item to exactly one product, with localised name, image and description held per locale.

#### Scenario: Catalog structure

- **GIVEN** a product with no category
- **WHEN** it is stored
- **THEN** the store rejects it

### Requirement: Locale-specific listing

ID: SWHR8-R-0034
Recovered from: CATB-REQ-0001
The system SHALL list catalog categories, products within a category, and items within a product, each in the requested locale and ordered by name (items in unspecified order).

#### Scenario: Locale-specific listing

- **GIVEN** categories in several locales
- **WHEN** categories are listed for en_US
- **THEN** only en_US entries are returned ordered by name

### Requirement: Single entry lookup

ID: SWHR8-R-0035
Recovered from: CATB-REQ-0002
The system SHALL return a single category, product or item by identifier in the requested locale, and SHALL return no result when the identifier does not exist.

#### Scenario: Single entry lookup

- **GIVEN** an unknown item identifier
- **WHEN** the item is looked up
- **THEN** no result is returned and no error is raised

### Requirement: Paged lists

ID: SWHR8-R-0036
Recovered from: CATB-REQ-0003
The system SHALL return list results as pages defined by a start offset and a count, and each page SHALL indicate whether a next page and a previous page exist.

#### Scenario: Paged lists

- **GIVEN** a list of 6 rows and page size 2
- **WHEN** the page at offset 2 is requested
- **THEN** 2 rows are returned with next and previous indicated

### Requirement: Keyword search

ID: SWHR8-R-0037
Recovered from: CATB-REQ-0005
The system SHALL search items by free-text query split on whitespace into distinct keywords, matching an item when any keyword is contained in the product name, the category identifier or the item description, in the requested locale.

#### Scenario: Keyword search

- **GIVEN** items matching either of two keywords
- **WHEN** a search is made with both words
- **THEN** items matching at least one word are returned

### Requirement: Access modes

ID: SWHR8-R-0038
Recovered from: CATB-REQ-0008
The system SHALL support a direct-to-database access mode and an EJB access mode for catalog queries, selected per helper instance, both returning identical results.

#### Scenario: Access modes

- **GIVEN** the same catalog query
- **WHEN** it runs in each mode
- **THEN** identical results are returned

### Requirement: Database-specific SQL

ID: SWHR8-R-0039
Recovered from: CATB-REQ-0009
The system SHALL support database-specific SQL for Cloudscape and Oracle selected by configuration, and SHALL load the DAO implementation class named in configuration.

#### Scenario: Database-specific SQL

- **GIVEN** configuration naming Oracle
- **WHEN** a catalog query runs
- **THEN** the Oracle statements are used

### Requirement: Data-access failure

ID: SWHR8-R-0040
Recovered from: CATB-REQ-0010
The system SHALL raise a catalog error carrying the underlying message to the caller when a data-access failure occurs while catalog data is requested.

#### Scenario: Data-access failure

- **GIVEN** a failing database
- **WHEN** catalog data is requested
- **THEN** a catalog error with the underlying message is raised

### Requirement: Item locale record mandatory fields

ID: SWHR8-R-0169
Recovered from: CATB-RULE-0002
The system SHALL require every item locale record to carry a list price, a unit cost, an image and a description.

#### Scenario: Item locale record mandatory fields

- **GIVEN** an item locale record without a list price
- **WHEN** it is stored
- **THEN** the store rejects it

### Requirement: Locale-specific catalog display

ID: SWHR8-R-0005
Recovered from: CB-REQ-0001
The system SHALL list categories, the products of a category and the items of a product in the shopper's locale, ordered by name where a list is returned, and SHALL show a single category, product or item in that locale.

#### Scenario: Locale-specific catalog display

- **GIVEN** a shopper locale of en_US
- **WHEN** categories are listed
- **THEN** categories in en_US are shown ordered by name

### Requirement: Default page size and navigation

ID: SWHR8-R-0041
Recovered from: CB-REQ-0002
The system SHALL page catalog lists, showing 2 rows per page by default with Next and Previous navigation.

#### Scenario: Default page size and navigation

- **GIVEN** a category with 5 products
- **WHEN** its product list is first displayed
- **THEN** 2 products are shown with a Next control and no Previous control

### Requirement: Case-insensitive any-word search

ID: SWHR8-R-0042
Recovered from: CB-REQ-0003
The system SHALL search items case-insensitively, matching each entered word as a substring of the product name, the category identifier or the item description in the shopper's locale, and SHALL return an item that matches any of the words.

#### Scenario: Case-insensitive any-word search

- **GIVEN** an item whose description contains "Fish"
- **WHEN** a search is made for "fish"
- **THEN** the item is returned

### Requirement: Item page prices

ID: SWHR8-R-0170
Recovered from: CB-REQ-0004
The system SHALL show two prices on the item page, the list price and the member price taken from the item's unit cost, each formatted as currency.

#### Scenario: Item page prices

- **GIVEN** an item with list price 16.50 and unit cost 12.00
- **WHEN** the item page is displayed
- **THEN** both prices are shown as formatted currency

### Requirement: Shopper navigation

Recovered from: CAT-REQ-0001
The system SHALL let a shopper navigate from a category to its products, from a product to its items, and from an item to its detail, in the shopper's selected locale.

#### Scenario: Shopper navigation

- **GIVEN** a category page
- **WHEN** the shopper selects a product
- **THEN** the items of that product are listed in the same locale

### Requirement: Search words in shopper UI

Recovered from: CAT-REQ-0002
The system SHALL search items case-insensitively by matching each entered word against product name, category identifier and item description, returning items that match ANY of the words.

#### Scenario: Search words in shopper UI

- **GIVEN** items matching either of two words
- **WHEN** both words are searched
- **THEN** items matching at least one word are returned

### Requirement: Two rows per page with navigation

Recovered from: CAT-REQ-0003
The system SHALL list categories, products and items two rows per page with Next and Previous navigation.

#### Scenario: Two rows per page with navigation

- **GIVEN** a list of 5 rows
- **WHEN** the second page is displayed
- **THEN** 2 rows are shown with Previous and Next controls

### Requirement: Item page list and member price

Recovered from: CAT-REQ-0004
The system SHALL show on the item page both the list price and the member ("your") price of the item, formatted as currency for the locale.

#### Scenario: Item page list and member price

- **GIVEN** an item
- **WHEN** the item page is displayed
- **THEN** list price and member price are both shown in locale currency

### Requirement: Two rows at a time

Recovered from: CATALOG-BROWSING-REQ-0001
The system SHALL list categories, products and items two rows at a time with Next and Previous controls.

#### Scenario: Two rows at a time

- **GIVEN** a category with 5 products
- **WHEN** the list is displayed
- **THEN** 2 rows are shown with a Next control

### Requirement: Any-word search

Recovered from: CATALOG-BROWSING-REQ-0002
The system SHALL search items case-insensitively by any of the entered words matching the product name, category or item description, returning items that match at least one word.

#### Scenario: Any-word search

- **GIVEN** two entered words
- **WHEN** a search is made
- **THEN** items matching at least one word are returned

### Requirement: Name ordering in session locale

Recovered from: CATALOG-BROWSING-REQ-0003
The system SHALL present categories and products ordered by name, in the language of the session locale.

#### Scenario: Name ordering in session locale

- **GIVEN** a session locale of ja_JP
- **WHEN** categories are presented
- **THEN** they are in Japanese ordered by name

### Requirement: Category banner

Recovered from: CATALOG-BROWSING-REQ-0004
The system SHALL show the banner image matching the category being viewed (dogs, cats, reptiles, birds, fish), and the dogs banner for any other category.

#### Scenario: Category banner

- **GIVEN** a category not among the five
- **WHEN** its page is displayed
- **THEN** the dogs banner is shown

### Requirement: Seed data load

Recovered from: CATALOG-BROWSING-REQ-0006
The system SHALL be able to load initial catalog, customer and account data from an XML seed file through an unauthenticated /Populate endpoint, for the database named in its configuration.

#### Scenario: Seed data load

- **GIVEN** an empty database and a seed file
- **WHEN** the /Populate endpoint is called
- **THEN** catalog, customer and account data are loaded

### Requirement: Configured page size

Recovered from: CATALOG-BROWSING-REQUIREMENT-0001
The system SHALL list catalog results two items per page.

#### Scenario: Configured page size

- **GIVEN** a result of 3 items
- **WHEN** it is listed
- **THEN** 2 items appear on the first page

### Requirement: Locale list ordering and filtering

Recovered from: CATBR-REQ-0001
The system SHALL list categories ordered by name, and list the products of a category ordered by name, showing only entries that have a description in the requested locale.

#### Scenario: Locale list ordering and filtering

- **GIVEN** a category with no description in the requested locale
- **WHEN** categories are listed
- **THEN** that category is not returned

### Requirement: Items and item detail

Recovered from: CATBR-REQ-0002
The system SHALL list the items of a product, and show the detail of a single item (category, product, name, image, description, five attributes, list price, unit cost), in the requested locale.

#### Scenario: Items and item detail

- **GIVEN** an existing item
- **WHEN** its detail is requested
- **THEN** all listed fields are returned for the locale

### Requirement: Page next and previous indicators

Recovered from: CATBR-REQ-0003
The system SHALL present catalog lists in pages, and a page SHALL report whether a next page exists (more rows after the page) and whether a previous page exists (start offset greater than zero).

#### Scenario: Page next and previous indicators

- **GIVEN** a page starting at offset 0
- **WHEN** it is requested
- **THEN** no previous page is indicated

### Requirement: Default page size at offset zero

Recovered from: CATBR-BR-0004
The system SHALL show catalog lists two rows per page by default, starting at offset 0.

#### Scenario: Default page size at offset zero

- **GIVEN** no explicit page size
- **WHEN** a list is requested
- **THEN** 2 rows from offset 0 are returned

### Requirement: Search by whitespace-separated keywords

Recovered from: CATBR-REQ-0005
The system SHALL search items by one or more whitespace-separated keywords, case-insensitively, returning every item in the requested locale whose product name, category identifier or item description contains ANY of the keywords as a substring.

#### Scenario: Search by whitespace-separated keywords

- **GIVEN** keywords "gold fish"
- **WHEN** a search is made
- **THEN** items containing either keyword are returned

### Requirement: Blank search returns empty page

Recovered from: CATBR-REQ-0006
The system SHALL return an empty result page when a search query is empty or contains only whitespace.

#### Scenario: Blank search returns empty page

- **GIVEN** a query of spaces
- **WHEN** a search is requested
- **THEN** an empty page is returned

### Requirement: Out-of-range list or search page

Recovered from: CATBR-REQ-0007
The system SHALL return an empty page rather than an error when the page start offset is negative or beyond the last row for a list or search.

#### Scenario: Out-of-range list or search page

- **GIVEN** a start offset beyond the last row
- **WHEN** a list is requested
- **THEN** an empty page is returned and no error is raised

### Requirement: Absent identifier

Recovered from: CATBR-REQ-0008
The system SHALL return no result rather than an error when a category, product or item identifier has no entry in the requested locale.

#### Scenario: Absent identifier

- **GIVEN** an identifier with no entry in the locale
- **WHEN** it is looked up
- **THEN** no result is returned and no error is raised

### Requirement: Service or direct database read

Recovered from: CATBR-INT-0010
The system SHALL allow callers to read the catalog either through the catalog service or directly from the database, with identical results, and SHALL select the database vendor-specific query set by configuration.

#### Scenario: Service or direct database read

- **GIVEN** the same catalog query
- **WHEN** it is run through the service and directly
- **THEN** identical results are returned

### Requirement: Item price and text precision

Recovered from: CATB-ENT-0002
The system SHALL store, for each item and locale, a list price and a unit cost (both mandatory, two decimals, up to 10 digits), an image and description (mandatory) and up to five optional attributes.

#### Scenario: Item price and text precision

- **GIVEN** an item locale record with a price of 12.345
- **WHEN** it is stored
- **THEN** the price is limited to two decimals

### Requirement: Catalog consistency check rules

Recovered from: CATB-RULE-0003
The catalog consistency check SHALL report every category with no product (C1), every product with no item (C2), every item whose list price is below its unit cost (C3), every item missing a description in a locale served for its category (C4), and every item with no supplier inventory record (C5), and SHALL fail the job when any such row is found.

#### Scenario: Catalog consistency check rules

- **GIVEN** an item priced below cost
- **WHEN** the check runs
- **THEN** the item is reported under C3 and the job fails

### Requirement: Hierarchy organisation

Recovered from: CATALOG-ENT-0001
The system SHALL organise the catalog as category, product and item, where every product belongs to exactly one category and every item belongs to exactly one product.

#### Scenario: Hierarchy organisation

- **GIVEN** an item with no product
- **WHEN** it is stored
- **THEN** the store rejects it
