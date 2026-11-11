## 1. Data model

- [x] 1.1 Define category, product and item with parent foreign keys (SWHR8-T-0012; SWHR8-R-0033)
- [x] 1.2 Define per-locale detail records with mandatory item prices, image and description (SWHR8-T-0012; SWHR8-R-0169, SWHR8-R-0033)
- [x] 1.3 Implement the catalog consistency check C1 to C5 with failing exit code (SWHR8-T-0012; SWHR8-R-0168)

## 2. Catalog queries

- [x] 2.1 Implement locale-filtered category, product and item lists ordered by name (SWHR8-T-0012; SWHR8-R-0034, SWHR8-R-0005)
- [x] 2.2 Implement single category, product and item lookup returning absent when missing (SWHR8-T-0012; SWHR8-R-0035)
- [x] 2.3 Implement paging with next/previous flags and empty page for out-of-range start (SWHR8-T-0012; SWHR8-R-0036, SWHR8-R-0031)
- [x] 2.4 Implement multi-keyword case-insensitive search with empty-query short circuit (SWHR8-T-0012; SWHR8-R-0037, SWHR8-R-0042, SWHR8-R-0032)
- [x] 2.5 Wrap data-access failures in a catalog error carrying the message (SWHR8-T-0012; SWHR8-R-0040)

## 3. Presentation

- [x] 3.1 Show category, product and item lists two per page with Next and Previous (SWHR8-T-0012; SWHR8-R-0041, SWHR8-R-0167)
- [x] 3.2 Show list and member price on the item page as currency (SWHR8-T-0012; SWHR8-R-0170)
- [x] 3.3 Show category banner with dogs fallback (SWHR8-T-0012)
- [x] 3.4 Show MyList favourite-category products up to 10 (SWHR8-T-0012; SWHR8-R-0030)

## 4. Configuration and seed

- [x] 4.1 Select database-specific query set by configuration (SWHR8-T-0012; SWHR8-R-0039, SWHR8-R-0038)
- [x] 4.2 Provide the seed data load (SWHR8-T-0012; SWHR8-R-0033)
