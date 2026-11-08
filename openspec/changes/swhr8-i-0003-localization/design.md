# Legacy implementation notes: localization

- Locale list and default live in web.xml init-params/env-entries (`locales`, `default_locale`) and in `conf/petstore.properties` (`catalog.locales`, `catalog.defaultLocale`); the properties file header says web.xml holds the live values. The deployed template servlet lists `locales=en_US` only, so other locales currently fall back to the default screens.
- Per-locale screen definition files (en_US, ja_JP, zh_CN) and per-locale page directories exist under the petstore app.
- `changelocale.do` is mapped to ChangeLocaleHTMLAction (stores the Locale in the session attribute under WebKeys.LOCALE and emits a ChangeLocaleEvent). `changelocale.jsp` / `changelocalesuccess.jsp` are WAF demo pages; reachability from the storefront was not established.
- `MainServlet.doProcess` sets the default session locale; `TemplateServlet` resolves request parameter, then session, then default.
- `I18nUtil.getLocaleFromString` (also copied as the order-processing `LocaleUtil` and in CatalogHelper) never assigns variantIndex, so variants are lost and `en_US_x` yields a null country; a string with no underscore yields null. Catalog DAO then dereferences the locale (NPE).
- `I18nUtil.convertJISEncoding` swallows unsupported-encoding errors and returns null; `parseKeywords` returns null on error. No caller seen in the module.
- `EncodingFilter` field default "ASCII" is always overwritten in init() by the init-param (null when absent), so the default is dead. Deployed config supplies UTF-8, mapped to `/*`. Record LOC-BR-0002 (encoding filter pass) is described here rather than as a requirement because its key collides with the WAF record of the same key.
- `CustomerEJBAction.updateCustomer` sets a literal "locale" attribute key where other code uses PetstoreKeys.LOCALE; equivalence unverified.
- Catalog `*_details` tables are keyed (id, locale), locale varchar2(10); the value set is not constrained in DDL.
- Order e-mail stylesheet chosen by locale in MailContentXDE via LocaleUtil.
- Session timeout 30 minutes is a bare web.xml literal.
- Screen record LOC-REQ-0005 (pass a) and LOC-REQ-0008 (pass b) describe the same locale selection page.
