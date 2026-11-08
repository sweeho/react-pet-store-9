## ADDED Requirements

### Requirement: Supported storefront locales

Recovered from: LO-REQ-0001

The system SHALL serve the storefront in the locales en_US, ja_JP and zh_CN, defaulting to en_US, selecting the matching screen definitions and pages per locale.

#### Scenario: Shopper with no choice

- **GIVEN** a shopper who has not chosen a language
- **WHEN** a storefront page is requested
- **THEN** the page is served in en_US

#### Scenario: Japanese selected

- **GIVEN** a shopper whose locale is ja_JP
- **WHEN** a storefront page is requested
- **THEN** the Japanese screen definition and pages are used

### Requirement: Locale configuration conflicts with documentation

Recovered from: LOCALIZATION-REQUIREMENT-0001

The system SHALL expose the configured locale list en_US, ja_JP and zh_CN with en_US as the default locale.

#### Scenario: Configured locales

- **GIVEN** the configuration lists en_US, ja_JP and zh_CN with default en_US
- **WHEN** the supported locales are queried
- **THEN** all three are returned and en_US is the default

### Requirement: Screens and catalog text follow session locale

Recovered from: LOCALIZATION-REQ-0001

The system SHALL select screen definitions and catalog text by the session locale.

#### Scenario: Locale drives catalog and screens

- **GIVEN** a session locale of zh_CN
- **WHEN** a catalog page is shown
- **THEN** zh_CN screens and zh_CN catalog text are used

### Requirement: Default session locale

Recovered from: LOC-BR-0004

The system SHALL set the session locale to the configured default (en_US) when a request arrives for a session with no locale.

#### Scenario: New session

- **GIVEN** a session with no locale set
- **WHEN** any request is processed
- **THEN** the session locale becomes en_US

### Requirement: Change session locale

Recovered from: LOC-REQ-0001

The system SHALL let a user change the session locale by submitting a locale code of the form language_COUNTRY and SHALL use that locale for subsequent requests in the same session.

#### Scenario: Valid change

- **GIVEN** a session with locale en_US
- **WHEN** the user submits the locale code ja_JP
- **THEN** later requests in that session use ja_JP

### Requirement: Reject unparseable locale code

Recovered from: LOC-BR-0002

The system SHALL reject a locale-change request whose code cannot be parsed with an error stating the language could not be changed, and SHALL leave the session locale unchanged.

#### Scenario: Code without underscore

- **GIVEN** a session with locale en_US
- **WHEN** the user submits the locale code "english"
- **THEN** an error is returned and the session locale remains en_US

#### Scenario: Missing parameter

- **GIVEN** a session with locale ja_JP
- **WHEN** the change request carries no locale
- **THEN** an error is returned and the session locale remains ja_JP

### Requirement: Locale code "default"

Recovered from: LOC-BR-0003

The system SHALL accept the locale code "default" as meaning the server's default locale.

#### Scenario: Default code

- **GIVEN** a locale-change request
- **WHEN** the code is "default"
- **THEN** the server default locale is used

### Requirement: Screen language selection and fallback

Recovered from: LOC-BR-0005

The system SHALL choose the screen language from an explicit locale request parameter if present, otherwise the session locale; if the chosen locale has no screen definitions it SHALL use the default locale, and a screen missing in the chosen locale SHALL be taken from the default locale.

#### Scenario: Request parameter overrides session

- **GIVEN** a session locale of en_US and a request parameter locale=ja_JP
- **WHEN** a page is requested
- **THEN** the Japanese screen is used

#### Scenario: Locale without screens

- **GIVEN** a chosen locale with no screen definitions
- **WHEN** a page is requested
- **THEN** the default locale screens are shown

#### Scenario: Screen missing in locale

- **GIVEN** a locale whose definitions lack the requested screen
- **WHEN** that screen is requested
- **THEN** the screen is taken from the default locale

### Requirement: Locale follows customer preferred language

Recovered from: LOCALIZATION-REQ-0002

The system SHALL change the active locale to the customer's preferred language whenever the customer profile is created or updated.

#### Scenario: Profile saved

- **GIVEN** a customer saving a profile with preferred language ja_JP
- **WHEN** the profile is saved
- **THEN** subsequent pages are served in ja_JP

### Requirement: Locale selection screen

Recovered from: LOC-REQ-0008

The locale selection screen SHALL list US English (en_US), German (de_DE), Japanese (ja_JP) and Simplified Chinese (zh_CN), SHALL submit the chosen locale as a change-locale request, and SHALL then show the resulting session locale.

#### Scenario: Screen displayed

- **GIVEN** the locale selection screen is opened
- **WHEN** it is displayed
- **THEN** four choices en_US, de_DE, ja_JP and zh_CN are offered with a submit control

#### Scenario: Choice submitted

- **GIVEN** the user selects ja_JP
- **WHEN** the form is submitted
- **THEN** the session locale is changed and a confirmation screen shows the new session locale

#### Scenario: Unparseable choice

- **GIVEN** a submission that cannot be parsed into a locale
- **WHEN** the form is submitted
- **THEN** an error is shown and the session locale is unchanged

### Requirement: Locale-keyed catalog text retrieval

Recovered from: CATB-REQ-0007

The system SHALL return all catalog names, descriptions and images from the detail rows matching the caller-supplied locale, using the locale's string form (e.g. en_US) as the match key, with no fallback to another locale.

#### Scenario: Matching locale

- **GIVEN** a category with details in en_US and ja_JP
- **WHEN** the catalog is requested for ja_JP
- **THEN** the ja_JP names and descriptions are returned

#### Scenario: No details for locale

- **GIVEN** a product with details only in en_US
- **WHEN** it is requested for zh_CN
- **THEN** no zh_CN text is returned and no other locale is substituted

#### Scenario: Null locale

- **GIVEN** a caller supplying no locale
- **WHEN** catalog data is requested
- **THEN** the request fails, as the legacy system raised an unhandled error

### Requirement: Locale-keyed catalog string form

Recovered from: CATLOC-REQ-0009

The system SHALL match catalog detail rows on the locale string form language_COUNTRY.

#### Scenario: Locale match key

- **GIVEN** the locale ja_JP
- **WHEN** a catalog query is run
- **THEN** rows whose locale column equals "ja_JP" are selected

### Requirement: Localized detail storage

Recovered from: CATALOG-REQ-0002

The system SHALL hold one localized description per category, product and item for each locale, with name mandatory for category and product, and price, cost, image and description mandatory for item, prices being stored per locale row.

#### Scenario: Missing mandatory name

- **GIVEN** a category detail without a name
- **WHEN** it is stored
- **THEN** it is rejected

#### Scenario: Duplicate locale row

- **GIVEN** an item with an en_US detail row
- **WHEN** a second en_US row for the same item is stored
- **THEN** it is rejected as a duplicate

### Requirement: Locale entity keying

Recovered from: CATB-ENT-0002

The system SHALL identify category, product and item details by entity identifier together with locale.

#### Scenario: Same entity two locales

- **GIVEN** a product with identifier P1
- **WHEN** details are stored for en_US and ja_JP
- **THEN** both rows exist, each addressed by (P1, locale)

### Requirement: UTF-8 request decoding

Recovered from: LO-REQ-0002

The system SHALL read every incoming request, body and parameters, using UTF-8 before later processing reads them, and SHALL write responses as UTF-8.

#### Scenario: Japanese input

- **GIVEN** a form post containing Japanese text in UTF-8
- **WHEN** the request is processed
- **THEN** the text is read without corruption

### Requirement: Locale-aware number and keyword formatting

Recovered from: LOC-REQ-0006

The system SHALL format currency and numbers for a locale with a caller-specified number of fraction digits, and SHALL split a search string into keywords using the locale's word boundaries.

#### Scenario: Currency formatting

- **GIVEN** the amount 1234.5 and locale en_US with 2 fraction digits
- **WHEN** it is formatted as currency
- **THEN** the result uses the en_US currency style with two fraction digits

#### Scenario: Keyword split failure

- **GIVEN** a search string that cannot be split
- **WHEN** keywords are parsed
- **THEN** no keywords are returned

### Requirement: Japanese legacy encoding decoding

Recovered from: LOC-REQ-0007

The system SHALL decode Japanese text submitted in SJIS or JIS encoding into Unicode.

#### Scenario: SJIS input

- **GIVEN** text submitted in SJIS
- **WHEN** it is converted
- **THEN** the Unicode text is returned

### Requirement: Session inactivity timeout

Recovered from: LOC-REQ-0009

The system SHALL expire a customer session, including its locale choice, after 30 minutes of inactivity.

#### Scenario: Idle session

- **GIVEN** a session idle for 30 minutes
- **WHEN** the next request arrives
- **THEN** the session is new and the default locale applies

### Requirement: Order e-mail language

Recovered from: LOCAL-RULE-0001

The system SHALL render customer e-mails using the locale stored on the purchase order, treating "default" as the server default locale and an unparseable value as no locale, and SHALL fail to produce the mail if no template exists for the locale.

#### Scenario: Japanese order

- **GIVEN** an order with locale ja_JP
- **WHEN** the confirmation mail is produced
- **THEN** the ja_JP template is used

#### Scenario: No template

- **GIVEN** an order with a locale for which no template exists
- **WHEN** the mail is produced
- **THEN** production fails
