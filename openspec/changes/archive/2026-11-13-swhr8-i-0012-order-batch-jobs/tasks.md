## 1. Order extract

- [x] 1.1 Implement the daily previous-day order export with the seven columns and no header (SWHR8-T-0048; SWHR8-R-0222, SWHR8-R-0225)
- [x] 1.2 Append the trailer line and send the finance failure mail (SWHR8-T-0048; SWHR8-R-0223, SWHR8-R-0135)
- [x] 1.3 Hold the extract until the backup has succeeded (SWHR8-T-0048; SWHR8-R-0134)

## 2. Aging report

- [x] 2.1 List PENDING/APPROVED orders older than the stuck-order limit (SWHR8-T-0048; SWHR8-R-0132, SWHR8-R-0131)
- [x] 2.2 List supplier-COMPLETED mismatches regardless of age (SWHR8-T-0048; SWHR8-R-0133)
- [x] 2.3 Include order counts per status (SWHR8-T-0048; SWHR8-R-0132)
- [x] 2.4 End with code 4 when anything is listed (SWHR8-T-0048; SWHR8-R-0132, SWHR8-R-0133, SWHR8-R-0135)

## 3. Weekly purge

- [x] 3.1 Purge COMPLETED/DENIED orders older than retention with all dependent records in one transaction (SWHR8-T-0048; SWHR8-R-0224, SWHR8-R-0219, SWHR8-R-0220, SWHR8-R-0221)
- [x] 3.2 Never purge PENDING or APPROVED orders (SWHR8-T-0048; SWHR8-R-0224)
- [x] 3.3 Run only on Sundays after a successful extract (SWHR8-T-0048; SWHR8-R-0134)

## 4. Scheduling and settings

- [x] 4.1 Implement the nightly chain, schedule and dependencies (SWHR8-T-0048; SWHR8-R-0134)
- [x] 4.2 Provide batch settings and the 0/4/8 exit code contract (SWHR8-T-0048; SWHR8-R-0024, SWHR8-R-0131)

## 5. Order retrieval

- [x] 5.1 Retrieve orders by inclusive date range (SWHR8-T-0048; SWHR8-R-0015)
- [x] 5.2 Expose the retention and stuck-order settings (180 days, 24 hours) from batch configuration (SWHR8-T-0048; SWHR8-R-0024, SWHR8-R-0131)
