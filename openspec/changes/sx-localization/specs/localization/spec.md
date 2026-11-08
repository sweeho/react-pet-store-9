## ADDED Requirements

### Requirement: Locale entity keying

ID: SWHR8-R-0071
Recovered from: CATB-ENT-0002
The system SHALL store category, product and item descriptive details (name, image, description) once per locale, keyed by the entity identifier together with the locale.

#### Scenario: Same entity two locales

- **GIVEN** a product with identifier P1
- **WHEN** details are stored for en_US and ja_JP
- **THEN** both rows exist, each addressed by (P1, locale)

#### Scenario: Duplicate locale row

- **GIVEN** an item with an en_US detail row
- **WHEN** a second en_US row for the same item is stored
- **THEN** it is rejected as a duplicate

### Requirement: Locale-keyed catalog text retrieval

ID: SWHR8-R-0072
Recovered from: CATB-REQ-0007
The system SHALL serve all catalog names and descriptions in the locale supplied by the caller, using the detail rows whose locale equals the locale's string form (for example en_US), with no fallback to another locale.

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

### Requirement: Supported storefront locales

ID: SWHR8-R-0187
Recovered from: LO-REQ-0001
The system SHALL serve screens for the locales en_US, ja_JP and zh_CN, defaulting to en_US, selecting the matching screen definition and page set per locale.

#### Scenario: Shopper with no choice

- **GIVEN** a shopper who has not chosen a language
- **WHEN** a storefront page is requested
- **THEN** the page is served in en_US

#### Scenario: Japanese selected

- **GIVEN** a shopper whose locale is ja_JP
- **WHEN** a storefront page is requested
- **THEN** the Japanese screen definition and pages are used

### Requirement: UTF-8 request and response encoding

ID: SWHR8-R-0073
Recovered from: LO-REQ-0002
The system SHALL read and write all requests and responses as UTF-8.

#### Scenario: Japanese input

- **GIVEN** a form post containing Japanese text in UTF-8
- **WHEN** the request is processed
- **THEN** the text is read without corruption

### Requirement: Configured locale list

ID: SWHR8-R-0188
Recovered from: LOC-BR-0001
The system SHALL support the locales en_US, ja_JP and zh_CN, with en_US as the default.

#### Scenario: Configured locales

- **GIVEN** a configuration listing en_US, ja_JP and zh_CN with default en_US
- **WHEN** the supported locales are queried
- **THEN** all three are returned and en_US is the default

### Requirement: Reject unparseable locale code

ID: SWHR8-R-0074
Recovered from: LOC-BR-0002
Given a locale-change request whose locale code cannot be parsed, the system SHALL reject it with an error stating it was unable to change the language and SHALL leave the session locale unchanged.

#### Scenario: Code without underscore

- **GIVEN** a session with locale en_US
- **WHEN** the user submits the locale code "english"
- **THEN** an error is returned and the session locale remains en_US

#### Scenario: Missing parameter

- **GIVEN** a session with locale ja_JP
- **WHEN** the change request carries no locale
- **THEN** an error is returned and the session locale remains ja_JP

### Requirement: Locale code default

ID: SWHR8-R-0190
Recovered from: LOC-BR-0003
The system SHALL accept the locale code "default" as meaning the server's default locale.

#### Scenario: Default code

- **GIVEN** a locale-change request
- **WHEN** the code is "default"
- **THEN** the server default locale is used

### Requirement: Change session locale

ID: SWHR8-R-0075
Recovered from: LOC-REQ-0001
The system SHALL let a user change the session locale by submitting a locale code of the form language_COUNTRY and SHALL use that locale for subsequent requests in the same session.

#### Scenario: Valid change

- **GIVEN** a session with locale en_US
- **WHEN** the user submits the locale code ja_JP
- **THEN** later requests in that session use ja_JP

### Requirement: Default session locale

ID: SWHR8-R-0076
Recovered from: LOC-REQ-0002
The system SHALL set the session locale to the configured default (en_US) when any request is processed for a session with no locale.

#### Scenario: New session

- **GIVEN** a session with no locale set
- **WHEN** any request is processed
- **THEN** the session locale becomes en_US

### Requirement: Screen language selection and fallback

ID: SWHR8-R-0077
Recovered from: LOC-REQ-0003
The system SHALL choose the screen language from an explicit locale request parameter if present, otherwise from the session locale, and SHALL fall back to the default locale when no screen definitions exist for the chosen locale.

#### Scenario: Request parameter overrides session

- **GIVEN** a session locale of en_US and a request parameter locale=ja_JP
- **WHEN** a page is requested
- **THEN** the Japanese screen is used

#### Scenario: Locale without screens

- **GIVEN** a chosen locale with no screen definitions
- **WHEN** a page is requested
- **THEN** the default locale screens are shown

### Requirement: Locale-aware number formatting

ID: SWHR8-R-0078
Recovered from: LOC-REQ-0004
The system SHALL format currency amounts and numbers according to the locale, using a caller-supplied number of fraction digits.

#### Scenario: Currency formatting

- **GIVEN** the amount 1234.5 and locale en_US with 2 fraction digits
- **WHEN** it is formatted as currency
- **THEN** the result uses the en_US currency style with two fraction digits

### Requirement: Locale selection screen

ID: SWHR8-R-0189
Recovered from: LOC-REQ-0005
The locale selection screen SHALL offer US English (en_US), German (de_DE), Japanese (ja_JP) and Simplified Chinese (zh_CN), SHALL submit the chosen locale as a change-locale request, and SHALL show the resulting session locale after the change.

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

### Requirement: Japanese legacy encoding decoding

ID: SWHR8-R-0191
Recovered from: LOC-REQ-0007
The system SHALL decode Japanese text submitted in SJIS or JIS encoding into Unicode.

#### Scenario: SJIS input

- **GIVEN** text submitted in SJIS
- **WHEN** it is converted
- **THEN** the Unicode text is returned

### Requirement: Session inactivity timeout

ID: SWHR8-R-0192
Recovered from: LOC-REQ-0009
The system SHALL keep a customer session alive for 30 minutes of inactivity, after which the session and its locale choice expire.

#### Scenario: Idle session

- **GIVEN** a session idle for 30 minutes
- **WHEN** the next request arrives
- **THEN** the session is new and the default locale applies

### Requirement: Order e-mail language

ID: SWHR8-R-0079
Recovered from: LOC-RULE-0001
The system SHALL render customer e-mails using the locale stored on the purchase order, choosing the stylesheet named for that locale (en_US, ja_JP, zh_CN), and SHALL fail to produce the mail if no stylesheet exists for that locale.

#### Scenario: Japanese order

- **GIVEN** an order with locale ja_JP
- **WHEN** the confirmation mail is produced
- **THEN** the ja_JP stylesheet is used

#### Scenario: No stylesheet

- **GIVEN** an order with a locale for which no stylesheet exists
- **WHEN** the mail is produced
- **THEN** production fails

### Requirement: Notification locale derivation

ID: SWHR8-R-0080
Recovered from: LOCAL-RULE-0001
The system SHALL derive the notification locale from the order's stored locale string of the form language_country, treating "default" as the server default and an unparseable value as no locale.

#### Scenario: Default string

- **GIVEN** an order locale string "default"
- **WHEN** the notification locale is derived
- **THEN** the server default locale is used

#### Scenario: Unparseable string

- **GIVEN** an order locale string without an underscore
- **WHEN** the notification locale is derived
- **THEN** no locale is produced

### Requirement: Locale follows customer preferred language

ID: SWHR8-R-0081
Recovered from: LOCALIZATION-REQ-0002
The system SHALL change the active locale to the customer's preferred language whenever the customer's profile is created or updated.

#### Scenario: Profile saved

- **GIVEN** a customer saving a profile with preferred language ja_JP
- **WHEN** the profile is saved
- **THEN** subsequent pages are served in ja_JP
