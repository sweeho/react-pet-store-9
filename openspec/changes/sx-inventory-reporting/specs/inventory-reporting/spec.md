## ADDED Requirements

### Requirement: Daily low-stock inventory report

Recovered from: INVR-REQ-0001

The system SHALL, daily at 01:50 after the order extract, list supplier inventory items whose quantity is below the low-stock limit (default 500 units), lowest quantity first then by item id, with item id, product id, English description and quantity, to a dated file inventory_YYYYMMDD.txt, followed by the number of items tracked and the total units in stock.

#### Scenario: Items below the limit

- **GIVEN** inventory items with quantities 12, 499 and 500
- **WHEN** the report runs
- **THEN** the items with 12 and 499 are listed in that order and the item with 500 is not, followed by the items-tracked count and total units

#### Scenario: Item without English description

- **GIVEN** an item below the limit with no en_US description
- **WHEN** the report runs
- **THEN** the item is omitted from the list

### Requirement: Catalog integrity checks

Recovered from: INVR-REQ-0002

The system SHALL, daily at 06:00, run five catalog integrity checks and end with code 4 if any returns rows: C1 category with no product; C2 product with no item; C3 item whose list price is below unit cost; C4 item with no description in a locale of its category; C5 item with no supplier inventory record. The output SHALL be appended to the catalog check log.

#### Scenario: A check finds rows

- **GIVEN** a product that has no item
- **WHEN** the catalog check runs
- **THEN** a C2 line is logged and the job ends with code 4

#### Scenario: No problems

- **GIVEN** a consistent catalog
- **WHEN** the catalog check runs
- **THEN** the job ends successfully

### Requirement: Catalog first-load recovery

Recovered from: INVR-REQ-0003

GIVEN the catalog tables do not exist, WHEN the catalog check runs, THEN the system SHALL request a non-forced first load of the sample catalog data and re-run the checks, and SHALL end with code 8 if that request fails.

#### Scenario: Tables missing and load succeeds

- **GIVEN** the catalog tables do not exist
- **WHEN** the catalog check runs
- **THEN** a non-forced load is requested and the checks are run again

#### Scenario: Load fails

- **GIVEN** the catalog tables do not exist and the load request fails
- **WHEN** the catalog check runs
- **THEN** the job ends with code 8

### Requirement: Sample data load endpoint

Recovered from: IR-INT-0001

The system SHALL provide a data-load endpoint that loads sample catalog, customer and user data only when the data is not already present, and SHALL reload everything when the request carries forcefully=true.

#### Scenario: Data already present

- **GIVEN** sample data already loaded
- **WHEN** the endpoint is called with forcefully=false
- **THEN** no data is reloaded

#### Scenario: Forced reload

- **GIVEN** sample data already loaded
- **WHEN** the endpoint is called with forcefully=true
- **THEN** all sample data is reloaded

### Requirement: Daily database backup with retention

Recovered from: INVR-REQ-0004

The system SHALL, daily at 01:00, take an online backup of the store database into a dated folder PetStoreDB_YYYYMMDD, delete backup folders older than the retention period (default 7 days), and end with code 8 if the backup fails.

#### Scenario: Successful backup

- **GIVEN** backup folders older than 7 days exist
- **WHEN** the backup job runs
- **THEN** a folder for today's date is created and the older folders are deleted

#### Scenario: Backup failure

- **GIVEN** the database backup fails
- **WHEN** the backup job runs
- **THEN** the job ends with code 8

### Requirement: Web module health probe

Recovered from: INVR-REQ-0005

The system SHALL, every 10 minutes all day, request the entry page of the storefront, order processing, supplier and admin web modules, log each module that does not answer HTTP 200 within 20 seconds, and end with code 8 if any failed.

#### Scenario: A module is down

- **GIVEN** the supplier module does not answer within 20 seconds
- **WHEN** the probe runs
- **THEN** the supplier module is logged as failed and the job ends with code 8

### Requirement: Admin revenue and order-quantity reports

Recovered from: ADM-REQ-0007

The system SHALL provide revenue (sum of amounts) and order-count (sum of quantities) summaries between a start and end date, grouped by category, or by item when a category is requested, with a grand total.

#### Scenario: No category given

- **GIVEN** orders within a date range across several categories
- **WHEN** a revenue report is requested without a category
- **THEN** one entry per category and a grand total are returned

#### Scenario: Category given

- **GIVEN** a category and a date range
- **WHEN** a revenue report is requested
- **THEN** one entry per item of that category and a grand total are returned

### Requirement: Admin data request error handling

Recovered from: AOM-REQ-0009

The system SHALL answer an admin data request that arrives with no existing session with an error saying the session timed out and the user must log in again, and SHALL answer an unknown request type with an error.

#### Scenario: No session

- **GIVEN** an admin data request without a session
- **WHEN** it is processed
- **THEN** a session-timed-out error is returned

### Requirement: Diagnostic output switch

Recovered from: INVENTORY-REPORTING-REQ-0001

The system SHALL provide a diagnostic output helper whose print, println and exception-reporting operations emit nothing unless a build-time debugging switch is on, and the switch SHALL be off in the delivered build. When on, an exception report SHALL write the exception message, then the optional message if present, then the full stack trace.

#### Scenario: Switch off

- **GIVEN** the debugging switch is off
- **WHEN** a diagnostic message is printed
- **THEN** nothing is emitted

#### Scenario: Switch on and exception reported

- **GIVEN** the debugging switch is on
- **WHEN** an exception is reported with a message
- **THEN** the exception message, the message and the stack trace are written in that order
