# Proposal: localization

## Why

The legacy storefront serves shoppers in en_US, ja_JP and zh_CN. Locale selection, per-locale catalog text, formatting, text encoding and notification language are spread over several modules and must be preserved in the rebuild.

## What changes

- Specifies locale support and default, session locale handling, locale change, and screen-language fallback.
- Specifies locale-keyed catalog text storage and retrieval.
- Specifies UTF-8 request decoding, locale-aware number/currency formatting, and per-locale order e-mails.
- Specifies the locale selection screen (disputed reachability).

## Open conflicts

- The admin guide documents only English and Japanese; code and configuration ship zh_CN too.
- The framework demo selection page offers de_DE, which has no screen definitions.
