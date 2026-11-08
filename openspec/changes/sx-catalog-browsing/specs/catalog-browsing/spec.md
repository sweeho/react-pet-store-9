## ADDED Requirements

### Requirement: Locale-specific catalog listing

ID: SWHR8-R-0005
Recovered from: CB-REQ-0001
The system SHALL list categories, the products of a category and the items of a product in the shopper's locale, ordered by name where a list is returned, and SHALL show a single category, product or item in that locale.

#### Scenario: Category list in locale

- **GIVEN** a shopper locale of en_US
- **WHEN** categories are listed
- **THEN** only categories with a description in en_US are returned, ordered by name

### Requirement: Shopper navigation

Recovered from: CAT-REQ-0001
The system SHALL let a shopper navigate from a category to its products, from a product to its items, and from an item to its detail, in the shopper's selected locale.

#### Scenario: Drill down from category

- **GIVEN** a category page
- **WHEN** the shopper selects a product
- **THEN** the items of that product are listed in the same locale

### Requirement: Item detail

Recovered from: CATBR-REQ-0002
The system SHALL show the detail of a single item comprising category, product, name, image, description, five attributes, list price and unit cost, in the requested locale.

#### Scenario: Item detail requested

- **GIVEN** an existing item
- **WHEN** its detail is requested
- **THEN** all listed fields are returned for the locale

### Requirement: Absent identifier

Recovered from: CATBR-REQ-0008
The system SHALL return no result, rather than an error, when a category, product or item identifier has no entry in the requested locale.

#### Scenario: Unknown item id

- **GIVEN** an item identifier with no entry in the locale
- **WHEN** the item is looked up
- **THEN** no result is returned and no error is raised

### Requirement: Paged lists

Recovered from: CATBR-REQ-0003
The system SHALL present catalog lists in pages defined by a start offset and a count, and each page SHALL report whether a next page exists (more rows after the page) and whether a previous page exists (start offset greater than zero).

#### Scenario: Middle page

- **GIVEN** a list of 6 rows and page size 2
- **WHEN** the page starting at offset 2 is requested
- **THEN** 2 rows are returned, with a next page and a previous page indicated

### Requirement: Out-of-range page

Recovered from: CATBR-REQ-0007
The system SHALL return an empty page rather than an error when the start offset is negative or beyond the last row.

#### Scenario: Negative start

- **GIVEN** a list request
- **WHEN** the start offset is -1
- **THEN** an empty page is returned

### Requirement: Default page size

Recovered from: CB-REQ-0002
The system SHALL show catalog lists two rows per page by default, starting at offset 0, with Next and Previous navigation controls.

#### Scenario: First page

- **GIVEN** a category with 5 products
- **WHEN** its product list is first displayed
- **THEN** 2 products are shown with a Next control and no Previous control

### Requirement: Keyword search

Recovered from: CB-REQ-0003
The system SHALL search items case-insensitively by one or more whitespace-separated keywords, returning every item in the requested locale whose product name, category identifier or item description contains ANY keyword as a substring.

#### Scenario: Two keywords

- **GIVEN** items matching either of two keywords
- **WHEN** a search is made for both words
- **THEN** items matching at least one word are returned

### Requirement: Empty search

Recovered from: CATBR-REQ-0006
The system SHALL return an empty result page when the search query is empty or contains only whitespace, without querying the database.

#### Scenario: Blank query

- **GIVEN** a query of spaces only
- **WHEN** a search is requested
- **THEN** an empty page is returned

### Requirement: Item page prices

Recovered from: CB-REQ-0004
The item page SHALL show both the list price and the member price (taken from the item's unit cost), each formatted as currency for the locale.

#### Scenario: Item page displayed

- **GIVEN** an item with list price 16.50 and unit cost 12.00
- **WHEN** the item page is displayed
- **THEN** both prices are shown as formatted currency

### Requirement: Category banner

Recovered from: CATALOG-BROWSING-REQ-0004
The system SHALL show the banner image matching the category being viewed (dogs, cats, reptiles, birds, fish), and the dogs banner for any other category.

#### Scenario: Unlisted category

- **GIVEN** a category not among the five
- **WHEN** its page is displayed
- **THEN** the dogs banner is shown

### Requirement: MyList favourites

Recovered from: CATALOG-BROWSING-REQ-0005
The system SHALL show a signed-in customer who has MyList enabled the products of their favourite category, up to 10 entries.

#### Scenario: MyList enabled

- **GIVEN** a signed-in customer with MyList enabled
- **WHEN** the sidebar is displayed
- **THEN** up to 10 products of the favourite category are shown

### Requirement: Seed data load

The system SHALL load initial catalog, customer and account data from an XML seed file through an unauthenticated /Populate endpoint, for the configured database.

Recovered from: CATALOG-BROWSING-REQ-0006

#### Scenario: Populate invoked

- **GIVEN** an empty database and a seed file
- **WHEN** the /Populate endpoint is called
- **THEN** catalog, customer and account data are loaded

### Requirement: Access modes

Recovered from: CATBR-INT-0010
The system SHALL allow callers to read the catalog either through the catalog service or directly from the database, with identical results.

#### Scenario: Either mode

- **GIVEN** the same catalog query
- **WHEN** it is run in each mode
- **THEN** identical results are returned

### Requirement: Database-specific SQL

Recovered from: CATB-REQ-0009
The system SHALL select the Cloudscape or Oracle query set by configuration, and SHALL load the data-access implementation named in configuration.

#### Scenario: Oracle configured

- **GIVEN** configuration naming Oracle
- **WHEN** a catalog query runs
- **THEN** the Oracle statements are used

### Requirement: Data-access failure

Recovered from: CATB-REQ-0010
The system SHALL raise a catalog error carrying the underlying message to the caller when a data-access failure occurs.

#### Scenario: Database unavailable

- **GIVEN** a failing database
- **WHEN** catalog data is requested
- **THEN** a catalog error with the underlying message is raised

### Requirement: Catalog structure

Recovered from: CATB-ENT-0001
The system SHALL hold the catalog as category, product and item, where each product belongs to exactly one category and each item to exactly one product, with names, descriptions and images held per locale.

#### Scenario: Orphan product

- **GIVEN** a product with no category
- **WHEN** it is stored
- **THEN** the store rejects it

### Requirement: Item locale record

Recovered from: CATB-ENT-0002
The system MUST require every item locale record to carry a list price and unit cost (two decimals, up to 10 digits), an image and a description, and MAY carry up to five attributes.

#### Scenario: Missing price

- **GIVEN** an item locale record without a list price
- **WHEN** it is stored
- **THEN** the store rejects it

### Requirement: Catalog consistency check

Recovered from: CATB-BR-0003
The catalog check SHALL report every category with no product (C1), every product with no item (C2), every item priced below cost (C3), every item missing a description in a locale of its category (C4) and every item with no supplier inventory row (C5), and SHALL fail with a non-zero exit code when any is found.

#### Scenario: Product without items

- **GIVEN** a product with no item
- **WHEN** the check runs
- **THEN** the product is reported under C2 and the job fails
