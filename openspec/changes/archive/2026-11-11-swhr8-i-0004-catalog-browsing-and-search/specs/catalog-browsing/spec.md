## ADDED Requirements

### Requirement: Catalog page size

ID: SWHR8-R-0167
Recovered from: CAB-BR-0001
The system SHALL show catalog listings in pages of 2 items.

#### Scenario: Catalog page size
ID: SWHR8-R-0167.01

- **GIVEN** a category with 5 products
- **WHEN** its product list is displayed
- **THEN** 2 products are shown

### Requirement: MyList favourites

ID: SWHR8-R-0030
Recovered from: CATALOG-BROWSING-REQ-0005
The system SHALL show a signed-in customer who has MyList enabled the products of their favourite category, up to 10 entries.

#### Scenario: MyList favourites
ID: SWHR8-R-0030.01

- **GIVEN** a signed-in customer with MyList enabled
- **WHEN** the sidebar is displayed
- **THEN** up to 10 products of the favourite category are shown

### Requirement: Catalog consistency check

ID: SWHR8-R-0168
Recovered from: CATB-BR-0003
The catalog check SHALL report, with a failing exit code, every category with no product (C1), every product with no item (C2), every item priced below cost in any locale (C3), every item lacking a description in a locale of its category (C4), and every item with no supplier inventory row (C5).

#### Scenario: Catalog consistency check
ID: SWHR8-R-0168.01

- **GIVEN** a product with no item
- **WHEN** the check runs
- **THEN** the product is reported under C2 and the job exits non-zero

### Requirement: Out-of-range page

ID: SWHR8-R-0031
Recovered from: CATB-BR-0004
The system SHALL return an empty page when a page request has a negative start or a start beyond the last row.

#### Scenario: Out-of-range page
ID: SWHR8-R-0031.01

- **GIVEN** a list request
- **WHEN** the start offset is -1
- **THEN** an empty page is returned

### Requirement: Empty search query

ID: SWHR8-R-0032
Recovered from: CATB-BR-0006
The system SHALL return an empty page without querying the database when a search query is empty or only whitespace.

#### Scenario: Empty search query
ID: SWHR8-R-0032.01

- **GIVEN** a query of spaces only
- **WHEN** a search is made
- **THEN** an empty page is returned and the database is not queried

### Requirement: Catalog structure

ID: SWHR8-R-0033
Recovered from: CATB-ENT-0001
The system SHALL hold the catalog as category, product and item, each product belonging to exactly one category and each item to exactly one product, with localised name, image and description held per locale.

#### Scenario: Catalog structure
ID: SWHR8-R-0033.01

- **GIVEN** a product with no category
- **WHEN** it is stored
- **THEN** the store rejects it

### Requirement: Locale-specific listing

ID: SWHR8-R-0034
Recovered from: CATB-REQ-0001
The system SHALL list catalog categories, products within a category, and items within a product, each in the requested locale and ordered by name (items in unspecified order).

#### Scenario: Locale-specific listing
ID: SWHR8-R-0034.01

- **GIVEN** categories in several locales
- **WHEN** categories are listed for en_US
- **THEN** only en_US entries are returned ordered by name

### Requirement: Single entry lookup

ID: SWHR8-R-0035
Recovered from: CATB-REQ-0002
The system SHALL return a single category, product or item by identifier in the requested locale, and SHALL return no result when the identifier does not exist.

#### Scenario: Single entry lookup
ID: SWHR8-R-0035.01

- **GIVEN** an unknown item identifier
- **WHEN** the item is looked up
- **THEN** no result is returned and no error is raised

### Requirement: Paged lists

ID: SWHR8-R-0036
Recovered from: CATB-REQ-0003
The system SHALL return list results as pages defined by a start offset and a count, and each page SHALL indicate whether a next page and a previous page exist.

#### Scenario: Paged lists
ID: SWHR8-R-0036.01

- **GIVEN** a list of 6 rows and page size 2
- **WHEN** the page at offset 2 is requested
- **THEN** 2 rows are returned with next and previous indicated

### Requirement: Keyword search

ID: SWHR8-R-0037
Recovered from: CATB-REQ-0005
The system SHALL search items by free-text query split on whitespace into distinct keywords, matching an item when any keyword is contained in the product name, the category identifier or the item description, in the requested locale.

#### Scenario: Keyword search
ID: SWHR8-R-0037.01

- **GIVEN** items matching either of two keywords
- **WHEN** a search is made with both words
- **THEN** items matching at least one word are returned

### Requirement: Access modes

ID: SWHR8-R-0038
Recovered from: CATB-REQ-0008
The system SHALL support a direct-to-database access mode and an EJB access mode for catalog queries, selected per helper instance, both returning identical results.

#### Scenario: Access modes
ID: SWHR8-R-0038.01

- **GIVEN** the same catalog query
- **WHEN** it runs in each mode
- **THEN** identical results are returned

### Requirement: Database-specific SQL

ID: SWHR8-R-0039
Recovered from: CATB-REQ-0009
The system SHALL support database-specific SQL for Cloudscape and Oracle selected by configuration, and SHALL load the DAO implementation class named in configuration.

#### Scenario: Database-specific SQL
ID: SWHR8-R-0039.01

- **GIVEN** configuration naming Oracle
- **WHEN** a catalog query runs
- **THEN** the Oracle statements are used

### Requirement: Data-access failure

ID: SWHR8-R-0040
Recovered from: CATB-REQ-0010
The system SHALL raise a catalog error carrying the underlying message to the caller when a data-access failure occurs while catalog data is requested.

#### Scenario: Data-access failure
ID: SWHR8-R-0040.01

- **GIVEN** a failing database
- **WHEN** catalog data is requested
- **THEN** a catalog error with the underlying message is raised

### Requirement: Item locale record mandatory fields

ID: SWHR8-R-0169
Recovered from: CATB-RULE-0002
The system SHALL require every item locale record to carry a list price, a unit cost, an image and a description.

#### Scenario: Item locale record mandatory fields
ID: SWHR8-R-0169.01

- **GIVEN** an item locale record without a list price
- **WHEN** it is stored
- **THEN** the store rejects it

### Requirement: Locale-specific catalog display

ID: SWHR8-R-0005
Recovered from: CB-REQ-0001
The system SHALL list categories, the products of a category and the items of a product in the shopper's locale, ordered by name where a list is returned, and SHALL show a single category, product or item in that locale.

#### Scenario: Locale-specific catalog display
ID: SWHR8-R-0005.01

- **GIVEN** a shopper locale of en_US
- **WHEN** categories are listed
- **THEN** categories in en_US are shown ordered by name

### Requirement: Default page size and navigation

ID: SWHR8-R-0041
Recovered from: CB-REQ-0002
The system SHALL page catalog lists, showing 2 rows per page by default with Next and Previous navigation.

#### Scenario: Default page size and navigation
ID: SWHR8-R-0041.01

- **GIVEN** a category with 5 products
- **WHEN** its product list is first displayed
- **THEN** 2 products are shown with a Next control and no Previous control

### Requirement: Case-insensitive any-word search

ID: SWHR8-R-0042
Recovered from: CB-REQ-0003
The system SHALL search items case-insensitively, matching each entered word as a substring of the product name, the category identifier or the item description in the shopper's locale, and SHALL return an item that matches any of the words.

#### Scenario: Case-insensitive any-word search
ID: SWHR8-R-0042.01

- **GIVEN** an item whose description contains "Fish"
- **WHEN** a search is made for "fish"
- **THEN** the item is returned

### Requirement: Item page prices

ID: SWHR8-R-0170
Recovered from: CB-REQ-0004
The system SHALL show two prices on the item page, the list price and the member price taken from the item's unit cost, each formatted as currency.

#### Scenario: Item page prices
ID: SWHR8-R-0170.01

- **GIVEN** an item with list price 16.50 and unit cost 12.00
- **WHEN** the item page is displayed
- **THEN** both prices are shown as formatted currency
