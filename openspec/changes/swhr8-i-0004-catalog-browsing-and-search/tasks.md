## 1. Data model

- [ ] 1.1 Define category, product and item with parent foreign keys
- [ ] 1.2 Define per-locale detail records with mandatory item prices, image and description
- [ ] 1.3 Implement the catalog consistency check C1 to C5 with failing exit code

## 2. Catalog queries

- [ ] 2.1 Implement locale-filtered category, product and item lists ordered by name
- [ ] 2.2 Implement single category, product and item lookup returning absent when missing
- [ ] 2.3 Implement paging with next/previous flags and empty page for out-of-range start
- [ ] 2.4 Implement multi-keyword case-insensitive search with empty-query short circuit
- [ ] 2.5 Wrap data-access failures in a catalog error carrying the message

## 3. Presentation

- [ ] 3.1 Show category, product and item lists two per page with Next and Previous
- [ ] 3.2 Show list and member price on the item page as currency
- [ ] 3.3 Show category banner with dogs fallback
- [ ] 3.4 Show MyList favourite-category products up to 10

## 4. Configuration and seed

- [ ] 4.1 Select database-specific query set by configuration
- [ ] 4.2 Provide the seed data load
