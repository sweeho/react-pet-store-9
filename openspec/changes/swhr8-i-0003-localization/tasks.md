## 1. Locale model and configuration

- [ ] 1.1 Define supported locales (en_US, ja_JP, zh_CN) and default en_US as configuration
- [ ] 1.2 Implement locale code parsing (language_COUNTRY, "default") with rejection of invalid codes
- [ ] 1.3 Keep the session locale and set the default when absent
- [ ] 1.4 Apply session timeout of 30 minutes

## 2. Locale change and screen selection

- [ ] 2.1 Implement the change-locale operation with error on unparseable code
- [ ] 2.2 Implement screen-language selection with default fallback
- [ ] 2.3 Switch locale when the customer profile preferred language is saved
- [ ] 2.4 Build the locale selection screen

## 3. Catalog text

- [ ] 3.1 Store category, product and item details per locale with the legacy constraints
- [ ] 3.2 Return catalog text for the requested locale and define null-locale behaviour

## 4. Encoding and formatting

- [ ] 4.1 Decode all requests as UTF-8
- [ ] 4.2 Implement locale-aware currency, number and keyword formatting
- [ ] 4.3 Decide on SJIS/JIS decoding support

## 5. Notifications

- [ ] 5.1 Select the order e-mail template by the order locale and fail when none exists
