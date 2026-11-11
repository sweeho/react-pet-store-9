## 1. Locale model and configuration

- [ ] 1.1 Define supported locales (en_US, ja_JP, zh_CN) and default en_US as configuration (SWHR8-T-0008; SWHR8-R-0188, SWHR8-R-0187)
- [ ] 1.2 Implement locale code parsing (language_COUNTRY, "default") with rejection of invalid codes (SWHR8-T-0008; SWHR8-R-0074, SWHR8-R-0190, SWHR8-R-0080)
- [ ] 1.3 Keep the session locale and set the default when absent (SWHR8-T-0008; SWHR8-R-0076)
- [ ] 1.4 Apply session timeout of 30 minutes (SWHR8-T-0008; SWHR8-R-0192)

## 2. Locale change and screen selection

- [ ] 2.1 Implement the change-locale operation with error on unparseable code (SWHR8-T-0008; SWHR8-R-0075, SWHR8-R-0074, SWHR8-R-0190)
- [ ] 2.2 Implement screen-language selection with default fallback (SWHR8-T-0008; SWHR8-R-0077, SWHR8-R-0187)
- [ ] 2.3 Switch locale when the customer profile preferred language is saved (SWHR8-T-0008; SWHR8-R-0081)
- [ ] 2.4 Build the locale selection screen (SWHR8-T-0008; SWHR8-R-0189)

## 3. Catalog text

- [ ] 3.1 Store category, product and item details per locale with the legacy constraints (SWHR8-T-0008; SWHR8-R-0071)
- [ ] 3.2 Return catalog text for the requested locale and define null-locale behaviour (SWHR8-T-0008; SWHR8-R-0072)

## 4. Encoding and formatting

- [ ] 4.1 Decode all requests as UTF-8 (SWHR8-T-0008; SWHR8-R-0073)
- [ ] 4.2 Implement locale-aware currency, number and keyword formatting (SWHR8-T-0008; SWHR8-R-0078)
- [ ] 4.3 Decide on SJIS/JIS decoding support (SWHR8-T-0008; SWHR8-R-0191)

## 5. Notifications

- [ ] 5.1 Select the order e-mail template by the order locale and fail when none exists (SWHR8-T-0008; SWHR8-R-0079, SWHR8-R-0080)
