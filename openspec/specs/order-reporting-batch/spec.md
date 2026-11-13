# order-reporting-batch Specification

## Purpose

TBD - created by archiving change swhr8-i-0012-order-batch-jobs. Update Purpose after archive.

## Requirements

### Requirement: Daily order extract file

ID: SWHR8-R-0222
Recovered from: ORB-REQ-0001
The system SHALL export every purchase order placed between 00:00 (inclusive) and the following 00:00 (exclusive) of the previous day to a comma-separated file named orders_YYYYMMDD.csv, with no header row, ordered by order number, with columns order number, user name, order time (epoch milliseconds), locale, order value, number of order lines and order status.

#### Scenario: Previous day's orders exported

ID: SWHR8-R-0222.01

- **GIVEN** orders exist dated yesterday, today and the day before
- **WHEN** the daily extract runs
- **THEN** orders_YYYYMMDD.csv for yesterday contains one row per yesterday order, ordered by order number, with the seven columns and no header row

### Requirement: Order extract daily export for Finance

ID: SWHR8-R-0225
Recovered from: ORDB-RULE-0001
The system SHALL export each day the purchase orders dated from yesterday 00:00 up to but excluding today 00:00, with order id, user, date, locale, value, line count and status, ordered by order id, as a quoted comma-separated UTF-8 file named orders_YYYYMMDD.csv.

#### Scenario: Window boundaries

ID: SWHR8-R-0225.01

- **GIVEN** an order dated exactly yesterday 00:00 and an order dated exactly today 00:00
- **WHEN** the daily export runs
- **THEN** the first order is in the file and the second is not

### Requirement: Extract trailer line

ID: SWHR8-R-0223
Recovered from: ORB-REQ-0002
The system SHALL append to each order extract file a final trailer line of the form TRAILER,YYYYMMDD,<row count>, where the date is the extract day and the row count is the number of data lines before the trailer.

#### Scenario: Trailer written

ID: SWHR8-R-0223.01

- **GIVEN** an extract file with 120 order rows for 20260101
- **WHEN** the extract completes
- **THEN** the last line is "TRAILER,20260101,120"

### Requirement: Stuck-order aging report

ID: SWHR8-R-0132
Recovered from: ORB-REQ-0003
The system SHALL list, in order_aging_YYYYMMDD.txt, every order whose status is PENDING or APPROVED and whose order time is more than 24 hours old (oldest first), together with order number, user, locale, value and status, and SHALL end with exit code 4 when any such order exists.

#### Scenario: Stuck order listed

ID: SWHR8-R-0132.01

- **GIVEN** an APPROVED order placed 30 hours ago
- **WHEN** the aging report runs
- **THEN** the order is listed with number, user, locale, value and status and the job ends with code 4

#### Scenario: Nothing stuck

ID: SWHR8-R-0132.02

- **GIVEN** no PENDING or APPROVED order is older than 24 hours and no mismatch exists
- **WHEN** the aging report runs
- **THEN** no order is listed and the job does not end with code 4

### Requirement: Supplier-completed mismatch lines

ID: SWHR8-R-0133
Recovered from: ORB-REQ-0004
The system SHALL include in the aging report, as MISMATCH lines, every order whose supplier order is COMPLETED while the order manager status is not COMPLETED, and SHALL treat any MISMATCH line as a reason for exit code 4.

#### Scenario: Lost invoice message

ID: SWHR8-R-0133.01

- **GIVEN** a supplier order COMPLETED and the matching order APPROVED, placed one hour ago
- **WHEN** the aging report runs
- **THEN** a MISMATCH line for that order is listed and the job ends with code 4

### Requirement: Weekly purge of finished orders

ID: SWHR8-R-0224
Recovered from: ORB-REQ-0005
The system SHALL, once a week, delete every order whose status is COMPLETED or DENIED and whose order time is earlier than local midnight 180 days ago, together with its supplier line items, supplier order, order lines, order manager row, contact information, address and credit card, in a single transaction.

#### Scenario: Old completed order purged

ID: SWHR8-R-0224.01

- **GIVEN** a COMPLETED order dated 200 days ago
- **WHEN** the weekly purge runs
- **THEN** the order and all its dependent records are deleted in one transaction

#### Scenario: Open order kept

ID: SWHR8-R-0224.02

- **GIVEN** a PENDING order dated 400 days ago
- **WHEN** the weekly purge runs
- **THEN** the order and its dependent records remain

### Requirement: Nightly batch chain and dependencies

ID: SWHR8-R-0134
Recovered from: ORB-REQ-0006
The system SHALL run the nightly chain in this order: database backup at 01:00, order extract at 01:30 only after the backup succeeded, then the aging report (01:45), inventory report (01:50) and, on Sundays only, the order purge (02:00), each only after that day's order extract succeeded.

#### Scenario: Backup fails

ID: SWHR8-R-0134.01

- **GIVEN** the 01:00 backup failed
- **WHEN** the schedule proceeds
- **THEN** the extract, aging report, inventory report and purge do not run

#### Scenario: Normal Sunday

ID: SWHR8-R-0134.02

- **GIVEN** backup and extract succeed on a Sunday
- **WHEN** the chain runs
- **THEN** the aging report, inventory report and purge run at 01:45, 01:50 and 02:00

### Requirement: Batch failure notifications

ID: SWHR8-R-0135
Recovered from: ORB-REQ-0007
The system SHALL notify the responsible mailbox when a batch job fails or finds a problem: ps-ops when the database backup fails or when the aging report ends with code 4, and ps-finance when the order extract fails.

#### Scenario: Extract fails

ID: SWHR8-R-0135.01

- **GIVEN** the order extract ends in failure
- **WHEN** the failure is detected
- **THEN** a failure mail is sent to ps-finance

#### Scenario: Aging report finds stuck orders

ID: SWHR8-R-0135.02

- **GIVEN** the aging report ends with code 4
- **WHEN** the job completes
- **THEN** a mail is sent to ps-ops

### Requirement: Order retention period setting

ID: SWHR8-R-0024
Recovered from: ORB-BR-0001
The system SHALL purge completed and denied orders older than 180 days, with their dependent records, and SHALL read the retention period from the batch environment.

#### Scenario: Retention applied

ID: SWHR8-R-0024.01

- **GIVEN** the retention setting is 180 days
- **WHEN** the purge computes its cutoff
- **THEN** only COMPLETED or DENIED orders older than 180 days are eligible

### Requirement: Stuck-order threshold

ID: SWHR8-R-0131
Recovered from: ORB-BR-0002
The system SHALL report orders that remain pending or approved for more than 24 hours as stuck.

#### Scenario: Order just under threshold

ID: SWHR8-R-0131.01

- **GIVEN** a PENDING order placed 23 hours ago
- **WHEN** the aging report runs
- **THEN** the order is not reported as stuck

### Requirement: Order retrieval by date range

ID: SWHR8-R-0015
Recovered from: ORDER-REPORTING-BATCH-REQ-0005
The system SHALL allow retrieval of purchase orders whose order date lies between a begin and an end timestamp (inclusive).

#### Scenario: Orders within range

ID: SWHR8-R-0015.01

- **GIVEN** orders dated before, on and after a begin and an end timestamp
- **WHEN** orders are requested for that range
- **THEN** orders dated from begin to end inclusive are returned

### Requirement: Purge removes address of purged order

ID: SWHR8-R-0219
Recovered from: ORDER-REPORTING-BATCH-BR-0001
The system SHALL delete the addresses of an order together with the order when a completed or denied order older than 180 days is purged.

#### Scenario: Address deleted

ID: SWHR8-R-0219.01

- **GIVEN** a COMPLETED order older than 180 days with an address
- **WHEN** the purge runs
- **THEN** the address is deleted

### Requirement: Purge removes contact information of purged order

ID: SWHR8-R-0220
Recovered from: ORDER-REPORTING-BATCH-REQ-0001
The weekly purge SHALL delete the contact information of COMPLETED and DENIED orders older than 180 days together with the order.

#### Scenario: Contact deleted

ID: SWHR8-R-0220.01

- **GIVEN** a DENIED order older than 180 days with contact information
- **WHEN** the weekly purge runs
- **THEN** the contact information is deleted

### Requirement: Purge removes payment card of purged order

ID: SWHR8-R-0221
Recovered from: ORDRPT-REQ-0001
The system SHALL delete stored payment cards together with an order when the weekly purge removes a COMPLETED or DENIED order older than 180 days.

#### Scenario: Card deleted

ID: SWHR8-R-0221.01

- **GIVEN** a COMPLETED order older than 180 days with a stored payment card
- **WHEN** the weekly purge runs
- **THEN** the payment card is deleted
