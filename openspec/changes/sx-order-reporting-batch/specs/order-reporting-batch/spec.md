## ADDED Requirements

### Requirement: Daily order extract for Finance

Recovered from: ORDB-REQ-0001
The system SHALL, daily at 01:30 and only after the database backup has succeeded, export all purchase orders dated from yesterday 00:00 (inclusive) to today 00:00 (exclusive) server time, ordered by order id, to a file named orders_YYYYMMDD.csv (YYYYMMDD = yesterday) with columns order id, user name, order time in epoch milliseconds, locale, order total, number of order lines and order status, and with no header row.

#### Scenario: Previous day's orders exported

- **GIVEN** the backup succeeded and orders exist dated yesterday
- **WHEN** the extract runs at 01:30
- **THEN** orders_YYYYMMDD.csv for yesterday contains one row per order, ordered by order id, with the seven columns and no header

#### Scenario: Backup failed

- **GIVEN** the database backup did not succeed
- **WHEN** 01:30 arrives
- **THEN** the extract does not run

### Requirement: Extract trailer and failure notification

Recovered from: ORDB-REQ-0002
The system SHALL append a final trailer line "TRAILER,YYYYMMDD,<row count>" to the order extract file, where the count is the number of lines in the file before the trailer was added, and SHALL mail the finance team when the extract fails.

#### Scenario: Trailer written

- **GIVEN** an extract file with 120 order rows for 20260101
- **WHEN** the extract completes
- **THEN** the last line is "TRAILER,20260101,120"

#### Scenario: Extract fails

- **GIVEN** the extract job ends in failure
- **WHEN** the failure is detected
- **THEN** a failure mail is sent to the finance team

### Requirement: Stuck-order aging report

Recovered from: ORDB-REQ-0003
The system SHALL, daily at 01:45 after a successful order extract, list every order whose status is PENDING or APPROVED and whose order time is older than the stuck-order limit (24 hours) to order_aging_YYYYMMDD.txt, ordered by order time, showing order id, user, locale, value and status, and SHALL end with warning code 4 when any such order is listed.

#### Scenario: Stuck orders listed

- **GIVEN** an APPROVED order placed 30 hours ago
- **WHEN** the aging report runs
- **THEN** the order is listed with id, user, locale, value and status and the job ends with code 4

#### Scenario: No stuck orders

- **GIVEN** no PENDING or APPROVED order is older than 24 hours and no mismatch exists
- **WHEN** the aging report runs
- **THEN** no order is listed and the job ends with code 0

### Requirement: Supplier-completed mismatch detection

Recovered from: ORDB-REQ-0004
GIVEN a supplier order with status COMPLETED whose order-center order status is not COMPLETED, WHEN the aging report runs, THEN the system SHALL list it as a MISMATCH line (order id, order status, supplier status), regardless of the order's age, and the job SHALL end with warning code 4.

#### Scenario: Lost invoice message

- **GIVEN** a supplier order COMPLETED and the matching order APPROVED, placed one hour ago
- **WHEN** the aging report runs
- **THEN** a MISMATCH line with order id, APPROVED and COMPLETED is listed and the job ends with code 4

### Requirement: Order count per status in aging report

Recovered from: ORDB-REQ-0005
The system SHALL include in the aging report a count of orders per status.

#### Scenario: Counts included

- **GIVEN** orders exist in several statuses
- **WHEN** the aging report runs
- **THEN** the report shows each status with its order count, ordered by status

### Requirement: Weekly purge of finished orders

Recovered from: ORDB-REQ-0006
The system SHALL, on Sundays at 02:00 and only after the day's order extract has succeeded, permanently delete every order with status COMPLETED or DENIED whose order time is before midnight 180 days ago, together with its order lines, supplier orders and supplier lines, contact information, address and payment card, in a single transaction.

#### Scenario: Old completed order purged

- **GIVEN** a COMPLETED order dated 200 days ago and it is Sunday after a successful extract
- **WHEN** the purge runs
- **THEN** the order and its lines, supplier records, contact, address and card are deleted in one transaction

#### Scenario: Extract not successful

- **GIVEN** the day's extract did not succeed
- **WHEN** 02:00 on Sunday arrives
- **THEN** the purge does not run

### Requirement: Open orders never purged

Recovered from: ORDB-REQ-0007
The system SHALL never purge orders with status PENDING or APPROVED, whatever their age.

#### Scenario: Old open order kept

- **GIVEN** a PENDING order dated 400 days ago
- **WHEN** the purge runs
- **THEN** the order and its dependent records remain

### Requirement: Nightly batch chain and schedule

Recovered from: ORDB-REQ-0008
The system SHALL run the nightly batch chain as: database backup 01:00 (critical, up to 2 reruns), then order extract 01:30 (1 rerun), then, on extract success, order aging report 01:45, inventory report 01:50 and (Sundays only) order purge 02:00; the catalog check SHALL run daily at 06:00 and the health check every 10 minutes from 00:00 to 23:59. A failed backup SHALL hold the extract and so the jobs that depend on it.

#### Scenario: Backup fails

- **GIVEN** the 01:00 backup failed after its reruns
- **WHEN** the schedule proceeds
- **THEN** the extract, aging report, inventory report and purge do not run

#### Scenario: Normal night

- **GIVEN** backup and extract succeed
- **WHEN** the chain runs
- **THEN** aging report 01:45 and inventory report 01:50 run, and on Sundays the purge runs at 02:00

### Requirement: Batch settings and exit codes

Recovered from: ORDB-REQ-0009
The system SHALL use batch settings of: order retention 180 days, backup retention 7 days, stuck-order limit 24 hours, low-stock limit 500 units; and SHALL end batch jobs with code 0 for success, 4 when a report or check found something, and 8 for a SQL, file or HTTP error.

#### Scenario: Job hits an SQL error

- **GIVEN** a batch job whose SQL statement fails
- **WHEN** the job ends
- **THEN** it ends with code 8

### Requirement: Order retrieval by date range

ID: SWHR8-R-0015
Recovered from: ORDER-REPORTING-BATCH-REQ-0005
The system SHALL allow retrieval of purchase orders whose order date lies between a begin and an end timestamp (inclusive).

#### Scenario: Orders within range

- **GIVEN** orders dated before, on and after a begin and end timestamp
- **WHEN** orders are requested for that range
- **THEN** orders dated from begin to end inclusive are returned

### Requirement: Purge removes address of purged order

Recovered from: ORDER-REPORTING-BATCH-BR-0001
The system SHALL delete the address of an order together with the order when a completed or denied order older than 180 days is purged.

#### Scenario: Address deleted

- **GIVEN** a COMPLETED order older than 180 days with an address
- **WHEN** the purge runs
- **THEN** the address is deleted

### Requirement: Purge removes contact information of purged order

Recovered from: ORDER-REPORTING-BATCH-REQ-0001
The weekly purge SHALL delete the contact information of COMPLETED and DENIED orders older than 180 days together with the order.

#### Scenario: Contact deleted

- **GIVEN** a DENIED order older than 180 days with contact information
- **WHEN** the weekly purge runs
- **THEN** the contact information is deleted

### Requirement: Purge removes payment card of purged order

Recovered from: ORDRPT-REQ-0001
The system SHALL delete stored payment cards together with an order when the weekly purge removes a COMPLETED or DENIED order older than 180 days.

#### Scenario: Card deleted

- **GIVEN** a COMPLETED order older than 180 days with a stored payment card
- **WHEN** the weekly purge runs
- **THEN** the payment card is deleted

### Requirement: Order lookup by user and date

Recovered from: REPORT-REQ-0010
The system SHALL support retrieval of purchase orders by user and by order date, and any such retrieval SHALL return only the orders matching the given user or date.

#### Scenario: Lookup by user

- **GIVEN** orders from many users
- **WHEN** orders are requested for one user
- **THEN** only that user's orders are returned
