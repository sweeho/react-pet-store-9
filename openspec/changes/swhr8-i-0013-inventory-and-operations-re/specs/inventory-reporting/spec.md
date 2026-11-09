## ADDED Requirements

### Requirement: Daily low-stock inventory report

ID: SWHR8-R-0069
Recovered from: INVR-REQ-0001

The system SHALL, daily at 01:50 after the order extract, list supplier inventory items whose quantity is below the low-stock limit (default 500 units), lowest quantity first then by item id, with item id, product id, English description and quantity, to a dated file inventory_YYYYMMDD.txt, followed by the number of items tracked and the total units in stock.

#### Scenario: Items below the limit
ID: SWHR8-R-0069.01

- **GIVEN** inventory items with quantities 12, 499 and 500
- **WHEN** the report runs
- **THEN** the items with 12 and 499 are listed in that order and the item with 500 is not, followed by the items-tracked count and total units

#### Scenario: Item without English description
ID: SWHR8-R-0069.02

- **GIVEN** an item below the limit with no en_US description
- **WHEN** the report runs
- **THEN** the item is omitted from the list

### Requirement: Sample data load endpoint

ID: SWHR8-R-0070
Recovered from: IR-INT-0001

The system SHALL provide a data-load endpoint that loads sample catalog, customer and user data only when the data is not already present, and SHALL reload everything when the request carries forcefully=true.

#### Scenario: Data already present
ID: SWHR8-R-0070.01

- **GIVEN** sample data already loaded
- **WHEN** the endpoint is called with forcefully=false
- **THEN** no data is reloaded

#### Scenario: Forced reload
ID: SWHR8-R-0070.02

- **GIVEN** sample data already loaded
- **WHEN** the endpoint is called with forcefully=true
- **THEN** all sample data is reloaded

### Requirement: Admin revenue and order-quantity reports

ID: SWHR8-R-0186
Recovered from: ADM-REQ-0007

The system SHALL provide revenue (sum of amounts) and order-count (sum of quantities) summaries between a start and end date, grouped by category, or by item when a category is requested, with a grand total.

#### Scenario: No category given
ID: SWHR8-R-0186.01

- **GIVEN** orders within a date range across several categories
- **WHEN** a revenue report is requested without a category
- **THEN** one entry per category and a grand total are returned

#### Scenario: Category given
ID: SWHR8-R-0186.02

- **GIVEN** a category and a date range
- **WHEN** a revenue report is requested
- **THEN** one entry per item of that category and a grand total are returned

### Requirement: Diagnostic output switch

ID: SWHR8-R-0068
Recovered from: INVENTORY-REPORTING-REQ-0001

The system SHALL provide a diagnostic output helper whose print, println and exception-reporting operations emit nothing unless a build-time debugging switch is on, and the switch SHALL be off in the delivered build. When on, an exception report SHALL write the exception message, then the optional message if present, then the full stack trace.

#### Scenario: Switch off
ID: SWHR8-R-0068.01

- **GIVEN** the debugging switch is off
- **WHEN** a diagnostic message is printed
- **THEN** nothing is emitted

#### Scenario: Switch on and exception reported
ID: SWHR8-R-0068.02

- **GIVEN** the debugging switch is on
- **WHEN** an exception is reported with a message
- **THEN** the exception message, the message and the stack trace are written in that order

### Requirement: Low-stock threshold in the daily extract

ID: SWHR8-R-0147
Recovered from: INR-BR-0001
The system SHALL list supplier items with stock below 500 units in the daily inventory extract, taking the threshold from the low-stock configuration value.

#### Scenario: Threshold applied
ID: SWHR8-R-0147.01

- **GIVEN** the low-stock configuration value is 500
- **WHEN** the daily inventory extract runs
- **THEN** only items with fewer than 500 units are listed

### Requirement: Backup retention period

ID: SWHR8-R-0062
Recovered from: INR-BR-0002
The system SHALL delete database backups older than the configured retention period, 7 days by default.

#### Scenario: Old backup removed
ID: SWHR8-R-0062.01

- **GIVEN** a backup folder older than 7 days
- **WHEN** the backup job runs
- **THEN** that folder is deleted

### Requirement: Inventory extract file

ID: SWHR8-R-0063
Recovered from: INV-REQ-0001
The system SHALL write to inventory_YYYYMMDD.txt every supplier inventory item whose quantity is below 500, showing item, product, English description and quantity, lowest quantity first, followed by the number of items tracked and total units in stock.

#### Scenario: Extract written
ID: SWHR8-R-0063.01

- **GIVEN** supplier items with quantities 12 and 700
- **WHEN** the report runs
- **THEN** the file lists only the item with 12, followed by the items-tracked count and total units in stock

### Requirement: Catalog integrity exit code

ID: SWHR8-R-0064
Recovered from: INV-REQ-0002
The system SHALL check catalog integrity daily at 06:00 and end with exit code 4 when any of these hold: C1 a category has no product; C2 a product has no item; C3 an item has list price below unit cost; C4 an item lacks a description for a locale of its category; C5 an item has no supplier inventory row.

#### Scenario: Item priced below cost
ID: SWHR8-R-0064.01

- **GIVEN** an item whose list price is below its unit cost
- **WHEN** the catalog check runs
- **THEN** a C3 line is logged and the job ends with code 4

### Requirement: Catalog check first load request

ID: SWHR8-R-0065
Recovered from: INV-REQ-0003
The system SHALL, when the catalog tables do not exist, request the storefront to populate the catalog without forcing a reload, re-run the checks, and end with exit code 8 if the request fails.

#### Scenario: Populate request fails
ID: SWHR8-R-0065.01

- **GIVEN** the catalog tables do not exist and the populate request fails
- **WHEN** the catalog check runs
- **THEN** the job ends with code 8

### Requirement: Nightly online backup

ID: SWHR8-R-0066
Recovered from: INV-REQ-0004
The system SHALL take an online backup of the database daily at 01:00 into a folder named PetStoreDB_YYYYMMDD, and SHALL delete backup folders older than 7 days.

#### Scenario: Backup taken
ID: SWHR8-R-0066.01

- **GIVEN** the database is online
- **WHEN** the 01:00 backup job runs
- **THEN** a folder PetStoreDB\_ with today's date exists and folders older than 7 days are removed

### Requirement: Web module availability check

ID: SWHR8-R-0067
Recovered from: INV-REQ-0005
The system SHALL request the entry page of the storefront, order center, supplier and admin web modules every 10 minutes around the clock, log each module that does not answer HTTP 200 within 20 seconds, and end with exit code 8 when any fails.

#### Scenario: Module answers with an error
ID: SWHR8-R-0067.01

- **GIVEN** the admin module answers HTTP 503
- **WHEN** the check runs
- **THEN** the admin module is logged as down and the job ends with code 8
