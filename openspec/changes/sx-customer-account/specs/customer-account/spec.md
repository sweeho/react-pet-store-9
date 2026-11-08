## ADDED Requirements

### Requirement: Customer aggregate

ID: SWHR8-R-0001
Recovered from: CUST-ENT-0001
The system SHALL hold a customer as a user name linked to exactly one account (status, contact information, payment card) and exactly one profile (preferred language, favourite category, list and banner preferences), with the customer identifier equal to the sign-on user name.

#### Scenario: Customer aggregate

- **GIVEN** a customer with user name "shopper"
- **WHEN** the customer is loaded
- **THEN** it has exactly one account, one profile, and identifier "shopper"

### Requirement: Customer creation defaults

ID: SWHR8-R-0007
Recovered from: CUSTA-BR-0002
WHEN a customer is created, the system SHALL automatically create an account with status "active" and a profile with default preferences.

#### Scenario: Customer creation defaults

- **GIVEN** a customer being created
- **WHEN** creation completes
- **THEN** the customer has an active account and a default profile

### Requirement: Profile record

ID: SWHR8-R-0006
Recovered from: CUST-ENT-0002
The system SHALL keep one profile per profile identifier holding a mandatory preferred language, mandatory my-list and banner preferences, and an optional favorite category.

#### Scenario: Profile record

- **GIVEN** a profile with no favorite category
- **WHEN** it is stored
- **THEN** it is accepted; omitting language or either preference is rejected

### Requirement: Profile defaults

ID: SWHR8-R-0055
Recovered from: CUSTA-ENT-0005
The system SHALL hold for each customer a profile with preferred language, favorite category, a "my list" display preference and a banner display preference; a new profile SHALL default to language en_US, no favorite category, my list on and banner on.

#### Scenario: Profile defaults

- **GIVEN** a customer created without profile input
- **WHEN** the profile is created
- **THEN** language is en_US, favorite category is empty, my list and banner are on

### Requirement: Account status and parts

ID: SWHR8-R-0054
Recovered from: CUSTA-ENT-0003
The system SHALL hold for each account a status of either "active" or "disabled", one contact-information record and one credit-card record; a new account has empty contact and credit-card records created with it.

#### Scenario: Account status and parts

- **GIVEN** a new account
- **WHEN** it is created
- **THEN** it has status active and empty contact and credit-card records

### Requirement: Cascade removal

ID: SWHR8-R-0053
Recovered from: CUSTA-BR-0004
WHEN a customer, account or profile is removed, the system SHALL also remove its dependent account, profile, contact information, address and credit card.

#### Scenario: Cascade removal

- **GIVEN** a customer with account, profile, contact, address and card
- **WHEN** the customer is removed
- **THEN** all dependent records are removed

### Requirement: Account contact and card record

ID: SWHR8-R-0179
Recovered from: CUST-ENT-0004
The system SHALL record for each account a status, exactly one contact record (family name, given name, telephone, email, all mandatory) with a mandatory postal address, and exactly one credit card.

#### Scenario: Account contact and card record

- **GIVEN** an account being stored
- **WHEN** its contact lacks an e-mail
- **THEN** storage is rejected

### Requirement: Customer to sign-on link

ID: SWHR8-R-0180
Recovered from: CUST-ENT-0005
The system SHALL tie each customer to exactly one sign-on user, one account and one profile, with the user id as the customer's unique identifier.

#### Scenario: Customer to sign-on link

- **GIVEN** two customers
- **WHEN** both reference the same sign-on user
- **THEN** the second is rejected because the user id is unique

### Requirement: Sign-on user store

ID: SWHR8-R-0182
Recovered from: CUST-REQ-0007
The system SHALL store each user account as a unique user name (the identifier) with an associated password.

#### Scenario: Sign-on user store

- **GIVEN** a stored user "j2ee"
- **WHEN** another user named "j2ee" is stored
- **THEN** it is rejected as a duplicate

### Requirement: Single sign-on record per user name

ID: SWHR8-R-0183
Recovered from: CUST-RULE-0002
The system SHALL allow only one sign-on record per user name and SHALL require both user name and password to be present.

#### Scenario: Single sign-on record per user name

- **GIVEN** a sign-on record without a password
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: User name and password limits

ID: SWHR8-R-0049
Recovered from: CUST-REQ-0002
The system SHALL reject creation of a user account when the user name exceeds 25 characters, when the password exceeds the maximum password length, or when the user name contains the character '%' or '\*'.

#### Scenario: User name and password limits

- **GIVEN** a user name of 26 characters, or one containing "\*"
- **WHEN** account creation is attempted
- **THEN** creation is rejected

### Requirement: New sign-on user

ID: SWHR8-R-0176
Recovered from: CA-REQ-0001
The system SHALL create a new sign-on user from a submitted user name and password and SHALL treat the new user as the current user of the session.

#### Scenario: New sign-on user

- **GIVEN** a valid user name and password
- **WHEN** the creation request is submitted
- **THEN** the user exists and is the current user of the session

### Requirement: Duplicate-account screen

ID: SWHR8-R-0044
Recovered from: CA-BR-0002
GIVEN a user name that cannot be created, WHEN a visitor registers, THEN the system SHALL show the duplicate-account screen.

#### Scenario: Duplicate-account screen

- **GIVEN** a user name that already exists
- **WHEN** a visitor registers with it
- **THEN** the duplicate-account screen is shown and no user is created

### Requirement: Registration needs name and password

ID: SWHR8-R-0058
Recovered from: CUSTOMER-ACCOUNT-REQ-0001
The system SHALL create a sign-on user only when a user name and password are supplied, and WHEN the user name cannot be created (for example it already exists) the system SHALL show the "duplicate account" screen.

#### Scenario: Registration needs name and password

- **GIVEN** a registration without a password
- **WHEN** the customer submits
- **THEN** no user is created; a name that already exists shows the duplicate-account screen

### Requirement: Protected resource redirect

ID: SWHR8-R-0181
Recovered from: CUST-REQ-0004
The system SHALL, for a customer who is not signed on and who requests a resource configured as protected, remember the requested address, show the sign-on page, and after successful sign-on redirect the customer to the remembered address.

#### Scenario: Protected resource redirect

- **GIVEN** a signed-out customer requesting a protected page
- **WHEN** the customer signs on successfully
- **THEN** the customer lands on the originally requested page

### Requirement: Sign-on failure

ID: SWHR8-R-0050
Recovered from: CUST-REQ-0005
The system SHALL redirect the customer to the configured sign-on error page WHEN authentication fails, and SHALL keep the customer not signed on.

#### Scenario: Sign-on failure

- **GIVEN** wrong credentials
- **WHEN** sign-on is submitted
- **THEN** the error page is shown and the session is not signed on

### Requirement: Remember user name cookie

ID: SWHR8-R-0051
Recovered from: CUST-REQ-0006
The system SHALL, WHEN the customer ticks the remember-user-name option at sign-on, store the user name in a cookie lasting 2678400 seconds (31 days); WHEN the option is not ticked the system SHALL expire any existing remember-user-name cookie.

#### Scenario: Remember user name cookie

- **GIVEN** a sign-on with the option ticked
- **WHEN** sign-on succeeds
- **THEN** a cookie holding the user name is set for 31 days; unticked, an existing cookie is expired

### Requirement: Remember cookie name

ID: SWHR8-R-0061
Recovered from: CUSTOMER-ACCOUNT-REQUIREMENT-0003
The system SHALL remember the user name of a returning customer in a browser cookie named bp_signon.

#### Scenario: Remember cookie name

- **GIVEN** a customer who asked to be remembered
- **WHEN** the customer returns
- **THEN** the user name is read from the bp_signon cookie

### Requirement: Pages requiring sign-on

ID: SWHR8-R-0059
Recovered from: CUSTOMER-ACCOUNT-REQ-0002
The system SHALL require sign-on before showing the customer account page, processing account changes, the order information page and the sign-on welcome page; all other pages SHALL be available without signing on.

#### Scenario: Pages requiring sign-on

- **GIVEN** a signed-out visitor
- **WHEN** the visitor requests the catalog or the customer account page
- **THEN** the catalog is shown; the account page requires sign-on

### Requirement: Sign-on required for profile and order entry

ID: SWHR8-R-0177
Recovered from: CA-REQ-0003
The system SHALL require sign-on before showing the customer profile screen, accepting a customer profile change, entering order information, or showing the sign-on welcome screen.

#### Scenario: Sign-on required for profile and order entry

- **GIVEN** a signed-out visitor
- **WHEN** order information entry is requested
- **THEN** sign-on is required first

### Requirement: Protected screens

ID: SWHR8-R-0178
Recovered from: CUA-BR-0001
The system SHALL require sign-on before a customer can reach the customer profile screen and action, the order information entry screen, and the sign-on welcome screen.

#### Scenario: Protected screens

- **GIVEN** a signed-out customer
- **WHEN** the customer profile screen is requested
- **THEN** the sign-on form is shown

### Requirement: Session timeout 15 minutes

ID: SWHR8-R-0172
Recovered from: CA-REQ-0004
The system SHALL end a web session after 15 minutes of inactivity.

#### Scenario: Session timeout 15 minutes

- **GIVEN** a session idle for 15 minutes
- **WHEN** the next request arrives
- **THEN** the session has ended

### Requirement: Signed-on session expiry

ID: SWHR8-R-0171
Recovered from: CUA-BR-0002
The system SHALL expire a signed-on session after 15 minutes.

#### Scenario: Signed-on session expiry

- **GIVEN** a signed-on session idle for 15 minutes
- **WHEN** the customer acts
- **THEN** the customer is no longer signed on

### Requirement: Idle session expiry

ID: SWHR8-R-0174
Recovered from: ACCT-REQ-0006
The system SHALL expire an idle web session after 15 minutes.

#### Scenario: Idle session expiry

- **GIVEN** an idle session
- **WHEN** 15 minutes pass
- **THEN** it expires

### Requirement: Signed-on session inactivity

ID: SWHR8-R-0185
Recovered from: CUSTOMER-ACCOUNT-REQUIREMENT-0002
The system SHALL end a signed-on session after 15 minutes of inactivity.

#### Scenario: Signed-on session inactivity

- **GIVEN** a signed-on session idle for 15 minutes
- **WHEN** the next request arrives
- **THEN** the customer must sign on again

### Requirement: Locale after sign-on

ID: SWHR8-R-0145
Recovered from: CA-REQ-0005
The system SHALL, after sign-on, set the session locale and the cart locale from the customer's preferred language.

#### Scenario: Locale after sign-on

- **GIVEN** a customer whose preferred language is ja_JP
- **WHEN** the customer signs on
- **THEN** session and cart locale are ja_JP

### Requirement: Sign-off

ID: SWHR8-R-0060
Recovered from: CUSTOMER-ACCOUNT-REQ-0007
The system SHALL, on sign-off, discard the whole session (cart and sign-on state) while keeping the current locale for the next session.

#### Scenario: Sign-off

- **GIVEN** a signed-on customer with a cart
- **WHEN** the customer signs off
- **THEN** cart and sign-on state are gone and the locale is kept

### Requirement: Customer form mandatory fields

ID: SWHR8-R-0175
Recovered from: CA-BR-0007
The system SHALL require last name, first name, street address, city, state or province, postal code and telephone number on the customer form, treat address line 2 as optional, and treat e-mail as optional.

#### Scenario: Customer form mandatory fields

- **GIVEN** a customer form with no city
- **WHEN** it is submitted
- **THEN** it is rejected naming the missing field

### Requirement: Customer data stored and updated

ID: SWHR8-R-0173
Recovered from: CA-REQ-0006
The system SHALL create and update a customer record holding name, telephone, e-mail, postal address, payment card number, type and expiry, preferred language, favourite category, and the My List and banner preferences.

#### Scenario: Customer data stored and updated

- **GIVEN** an existing customer
- **WHEN** the customer updates the form
- **THEN** all contact, card and preference fields are replaced

### Requirement: Profile preference checkboxes

ID: SWHR8-R-0043
Recovered from: ACCT-REQ-0004
The system SHALL store per customer a profile of preferred language, favourite category, my-list preference and banner preference, and SHALL treat the my-list and banner preferences as on only when their checkbox is submitted.

#### Scenario: Profile preference checkboxes

- **GIVEN** a profile form with the banner checkbox cleared
- **WHEN** it is submitted
- **THEN** the banner preference is off

### Requirement: After profile creation

ID: SWHR8-R-0047
Recovered from: CA-WF-0008
GIVEN a customer profile has just been created, WHEN creation completes, THEN the system SHALL mark the session signed on and return the customer to the page they originally requested, or to the main screen if that page was the customer profile.

#### Scenario: After profile creation

- **GIVEN** a visitor who registered after requesting the order page
- **WHEN** creation completes
- **THEN** the visitor is signed on and returned to the order page

### Requirement: Banner by category

ID: SWHR8-R-0046
Recovered from: CA-REQ-0009
The system SHALL show a banner image chosen by the customer's category (dogs, cats, reptiles, birds or fish), with the dogs banner for any other category.

#### Scenario: Banner by category

- **GIVEN** a customer whose favourite category is fish
- **WHEN** a page is shown with banners on
- **THEN** the fish banner is shown; an unknown category shows the dogs banner

### Requirement: Sample users

ID: SWHR8-R-0045
Recovered from: CA-ENT-0010
The system SHALL maintain sample users j2ee and shopper, with a customer record for shopper, when sample data is loaded.

#### Scenario: Sample users

- **GIVEN** sample data is loaded
- **WHEN** loading completes
- **THEN** users j2ee and shopper exist and shopper has a customer record

### Requirement: Contact record

ID: SWHR8-R-0184
Recovered from: CUSTOMER-ACCOUNT-ENTITY-0001
The system SHALL store a contact record holding given name, family name, telephone and e-mail, linked to exactly one postal address.

#### Scenario: Contact record

- **GIVEN** a contact record
- **WHEN** it is stored
- **THEN** it is linked to exactly one address

### Requirement: Address and contact mandatory fields

ID: SWHR8-R-0052
Recovered from: CUST-RULE-0003
The system SHALL require every address to carry first street line, city, state, postal code and country, and every contact record to carry family name, given name, telephone, e-mail and an address.

#### Scenario: Address and contact mandatory fields

- **GIVEN** an address without a postal code
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Profile mandatory fields

ID: SWHR8-R-0048
Recovered from: CUSB-ENT-0006
The system SHALL hold per customer a profile with a mandatory preferred language, an optional favourite category, and mandatory my-list and banner preference flags.

#### Scenario: Profile mandatory fields

- **GIVEN** a profile without a banner flag
- **WHEN** it is stored
- **THEN** it is rejected

### Requirement: Customer record

ID: SWHR8-R-0146
Recovered from: CUSTA-ENT-0001
The system SHALL represent a customer as an identified record keyed by a user id, owning exactly one account and exactly one profile.

#### Scenario: Customer record

- **GIVEN** a customer with user id "shopper"
- **WHEN** it is loaded
- **THEN** it owns one account and one profile

### Requirement: Profile fields

ID: SWHR8-R-0056
Recovered from: CUSTACCT-ENT-0003
The system SHALL hold for each profile a preferred language, a favorite category, a my-list preference and a banner preference.

#### Scenario: Profile fields

- **GIVEN** a profile
- **WHEN** it is read
- **THEN** it exposes those four values

### Requirement: Account statuses

ID: SWHR8-R-0057
Recovered from: CUSTACCT-RULE-0002
The system SHALL give an account one of two statuses, "active" or "disabled".

#### Scenario: Account statuses

- **GIVEN** an account
- **WHEN** its status is set
- **THEN** only active or disabled is accepted

### Requirement: Admin application access

Recovered from: AOM-REQ-0005
The system SHALL restrict the admin application's request servlet to authenticated users in the administrator role using form-based login, and SHALL reject data requests that arrive without an established session with a "Session Timed Out" error.

#### Scenario: Admin application access

- **GIVEN** a request without a session
- **WHEN** data is requested
- **THEN** a "Session Timed Out" error is returned

### Requirement: Admin client delivery

Recovered from: AOM-REQ-0006
The system SHALL deliver the admin client to administrators as a Java Web Start launch descriptor generated when the user chooses manageorders, and SHALL forward to a logout page when the user chooses logout.

#### Scenario: Admin client delivery

- **GIVEN** an administrator
- **WHEN** manageorders is chosen
- **THEN** a launch descriptor is delivered; logout forwards to the logout page

### Requirement: Sample data load endpoint

Recovered from: IR-INT-0001
The system SHALL provide a data-load endpoint that loads sample catalog, customer and user data only when the data is not already present, and reloads everything when the request carries forcefully=true.

#### Scenario: Sample data load endpoint

- **GIVEN** data already present
- **WHEN** the endpoint is called without forcefully=true
- **THEN** nothing is reloaded; with forcefully=true everything is reloaded

### Requirement: Sign-on before profile or order entry

Recovered from: ACCT-REQ-0001
The system SHALL require sign-on before a shopper can view or edit the customer profile, or enter order information.

#### Scenario: Sign-on before profile or order entry

- **GIVEN** a signed-out shopper
- **WHEN** the profile is requested
- **THEN** sign-on is required

### Requirement: Account creation failure screen

Recovered from: ACCT-REQ-0002
The system SHALL create a user account from a user name and password, and WHEN the account cannot be created (name taken, bad name or password) it SHALL show the duplicate-account screen.

#### Scenario: Account creation failure screen

- **GIVEN** a taken user name
- **WHEN** registration is submitted
- **THEN** the duplicate-account screen is shown

### Requirement: Account form mandatory fields

Recovered from: ACCT-REQ-0003
The system SHALL capture, on account creation and update, family name, given name, street address, city, state or province, postal code and telephone as mandatory, with second address line and email optional.

#### Scenario: Account form mandatory fields

- **GIVEN** a form without a telephone
- **WHEN** it is submitted
- **THEN** it is rejected

### Requirement: Profile load on sign-on

Recovered from: ACCT-REQ-0005
The system SHALL, when a customer signs on, load their profile and set the session locale and the cart locale to the customer's preferred language.

#### Scenario: Profile load on sign-on

- **GIVEN** a customer with a stored profile
- **WHEN** the customer signs on
- **THEN** the profile is loaded and locales are set

### Requirement: Supported storefront locales

Recovered from: LOC-REQ-0001
The system SHALL serve the storefront in en_US, ja_JP and zh_CN with en_US as default, using per-locale screen definitions and pages, and SHALL allow the locale to be changed by the shopper.

#### Scenario: Supported storefront locales

- **GIVEN** a new visitor
- **WHEN** the storefront is opened
- **THEN** it is served in en_US; the shopper may switch to ja_JP or zh_CN

### Requirement: Customer account mandatory fields

Recovered from: CUSTOMER-ACCOUNT-REQ-0003
The system SHALL require last name, first name, street address, city, state or province, postal code and telephone number when a customer account is created or updated, and SHALL treat a blank second street line as absent.

#### Scenario: Customer account mandatory fields

- **GIVEN** a blank second street line
- **WHEN** the form is submitted
- **THEN** the line is treated as absent

### Requirement: Customer account data

Recovered from: CUSTOMER-ACCOUNT-REQ-0004
The system SHALL store, for each customer, contact details (name, address, phone, e-mail), a credit card (number, type, expiry as month/year) and profile preferences (preferred language, favourite category, MyList on/off, banner on/off), and SHALL apply the same fields on update.

#### Scenario: Customer account data

- **GIVEN** a customer
- **WHEN** the account is updated
- **THEN** all fields are replaced

### Requirement: Sign-on after account creation

Recovered from: CUSTOMER-ACCOUNT-REQ-0005
The system SHALL, after a new account has been created, mark the customer as signed on and return them to the page they originally asked for, or to the main page if that page was the account page.

#### Scenario: Sign-on after account creation

- **GIVEN** a newly registered customer
- **WHEN** creation completes
- **THEN** the customer is signed on and returned to the requested page

### Requirement: Session binding at sign-on

Recovered from: CUSTOMER-ACCOUNT-REQ-0006
The system SHALL, when a customer signs on, bind their user id to the shopping session, load their stored profile and set the session and cart locale from the preferred language.

#### Scenario: Session binding at sign-on

- **GIVEN** a customer whose preferred language is ja_JP
- **WHEN** the customer signs on
- **THEN** the user id is bound and locales are ja_JP

### Requirement: Inactive session expiry

Recovered from: CUSTOMER-ACCOUNT-REQ-0008
The system SHALL expire an inactive web session after 15 minutes.

#### Scenario: Inactive session expiry

- **GIVEN** an inactive session
- **WHEN** 15 minutes pass
- **THEN** it expires

### Requirement: MyList and banner checkboxes

Recovered from: CUSTOMER-ACCOUNT-REQ-0009
The system SHALL treat the MyList and banner preferences as on only when their checkbox is submitted, and off otherwise.

#### Scenario: MyList and banner checkboxes

- **GIVEN** a form with MyList unticked
- **WHEN** it is submitted
- **THEN** MyList is off

### Requirement: XML seed load endpoint

Recovered from: CATALOG-BROWSING-REQ-0006
The system SHALL be able to load initial catalog, customer and account data from an XML seed file through an unauthenticated /Populate endpoint, for the database named in its configuration.

#### Scenario: XML seed load endpoint

- **GIVEN** an empty database
- **WHEN** /Populate is called
- **THEN** the seed data is loaded

### Requirement: Supplier update role

Recovered from: customer-account-BR-0001
The system SHALL require sign-on with the administrator role to use the supplier inventory update function.

#### Scenario: Supplier update role

- **GIVEN** a user without the administrator role
- **WHEN** the supplier update is requested
- **THEN** access is denied

### Requirement: Sign-on form display

Recovered from: CUSTOMER-ACCOUNT-REQUIREMENT-0001
The system SHALL require sign-on to reach the customer screen, the customer action, the enter-order-information screen and the sign-on welcome screen, and SHALL show the sign-on form (or the sign-on error page after a failed sign-on) when the user is not signed on.

#### Scenario: Sign-on form display

- **GIVEN** a signed-out visitor
- **WHEN** a protected screen is requested
- **THEN** the sign-on form is shown

### Requirement: Purge contact information with old orders

Recovered from: ORDER-REPORTING-BATCH-REQ-0001
The weekly purge SHALL delete the contact information of COMPLETED and DENIED orders older than 180 days together with the order.

#### Scenario: Purge contact information with old orders

- **GIVEN** a COMPLETED order older than 180 days
- **WHEN** the weekly purge runs
- **THEN** the order and its contact information are deleted

### Requirement: Customer identity

Recovered from: CUSTACCT-ENT-0001
The system SHALL represent a customer as a record identified by a user id, owning exactly one account and exactly one profile.

#### Scenario: Customer identity

- **GIVEN** a customer
- **WHEN** it is loaded
- **THEN** it has one account and one profile

### Requirement: Customer creation attaches account and profile

Recovered from: CUSTACCT-RULE-0001
WHEN a customer is created, the system SHALL create an account in status "active" and a profile with default preferences, and attach both to the customer.

#### Scenario: Customer creation attaches account and profile

- **GIVEN** a new customer
- **WHEN** creation completes
- **THEN** both are attached

### Requirement: Account parts

Recovered from: CUSTACCT-ENT-0002
The system SHALL hold for each account a status, one contact-information record and one credit card record, each created with the account.

#### Scenario: Account parts

- **GIVEN** a new account
- **WHEN** it is created
- **THEN** contact and credit card records exist

### Requirement: Profile defaults (rule)

Recovered from: CUSTACCT-RULE-0003
The system SHALL default a new profile to language "en_US", no favorite category, my-list preference on and banner preference on.

#### Scenario: Profile defaults (rule)

- **GIVEN** a new profile
- **WHEN** it is created
- **THEN** defaults apply

### Requirement: Authentication

Recovered from: CUST-REQ-0001
The system SHALL authenticate a sign-on attempt by looking up the user by user name and comparing the supplied password with the stored password for exact equality, and SHALL treat an unknown user name as a failed authentication.

#### Scenario: Authentication

- **GIVEN** a user "j2ee"
- **WHEN** sign-on uses an unknown name or wrong password
- **THEN** authentication fails

### Requirement: Account creation outcome

Recovered from: CUST-REQ-0003
The system SHALL create a new user account from a submitted user name and password and, on success, redirect the customer onward; WHEN creation fails the system SHALL redirect the customer to a user-creation error page.

#### Scenario: Account creation outcome

- **GIVEN** valid credentials
- **WHEN** the creation request is submitted
- **THEN** the customer is redirected onward; on failure the error page is shown

### Requirement: Protected resource detection

Recovered from: CUST-WF-0004
GIVEN a user who is not signed on WHEN the user requests a protected resource listed in the sign-on configuration THEN the system SHALL remember the requested address and show the sign-on page; GIVEN the user is signed on or the resource is not protected THEN the request SHALL proceed unchanged.

#### Scenario: Protected resource detection

- **GIVEN** a signed-on user
- **WHEN** a protected resource is requested
- **THEN** the request proceeds unchanged

### Requirement: Sign-on submission outcome

Recovered from: CUST-WF-0005
GIVEN a sign-on submission WHEN authentication succeeds THEN the system SHALL mark the session as signed on, record the user name in the session and redirect to the originally requested address; WHEN authentication fails THEN the system SHALL redirect to the configured sign-on error page and leave the session not signed on.

#### Scenario: Sign-on submission outcome

- **GIVEN** valid credentials
- **WHEN** sign-on is submitted
- **THEN** the session is signed on and the customer is redirected to the requested address

### Requirement: Account creation redirect

Recovered from: CUST-WF-0007
GIVEN a new user name and password WHEN account creation is submitted and succeeds THEN the system SHALL redirect the user onward; WHEN creation is refused THEN the system SHALL redirect to the user-creation error page.

#### Scenario: Account creation redirect

- **GIVEN** a refused creation
- **WHEN** the request completes
- **THEN** the user-creation error page is shown

### Requirement: Sign-on account record

Recovered from: CUST-ENT-0008
The system SHALL hold, for each sign-on account, a user name (the key) and a password, stored as supplied.

#### Scenario: Sign-on account record

- **GIVEN** a sign-on account
- **WHEN** it is stored
- **THEN** the password is kept as supplied

### Requirement: Sign-on credentials and customer links

Recovered from: CUSB-ENT-0004
The system SHALL store sign-on credentials as one row per unique user name with a mandatory password, and each customer SHALL reference exactly one sign-on user, one account and one profile.

#### Scenario: Sign-on credentials and customer links

- **GIVEN** a customer
- **WHEN** it is stored
- **THEN** it references one sign-on user, one account and one profile

### Requirement: Account contact and card mandatory fields

Recovered from: CUSB-ENT-0005
The system SHALL hold for each account a status, a contact (family name, given name, telephone, e-mail, all mandatory, plus an address with street, city, state, zip and country mandatory) and one payment card (number, type, expiry text, all mandatory).

#### Scenario: Account contact and card mandatory fields

- **GIVEN** an account whose contact lacks an e-mail
- **WHEN** it is stored
- **THEN** storage is rejected

### Requirement: Daily database backup

Recovered from: INVB-BR-0016
The system SHALL take a daily online backup of the database, keep it in a dated folder, and delete backups older than 7 days.

#### Scenario: Daily database backup

- **GIVEN** a backup older than 7 days
- **WHEN** the daily backup runs
- **THEN** the old backup is deleted

### Requirement: Order status view

Recovered from: ADMO-ENT-0001
The system SHALL provide an order status view giving, per order, its identifier, user, date, value and approval status.

#### Scenario: Order status view

- **GIVEN** an order
- **WHEN** the view is read
- **THEN** it shows identifier, user, date, value and approval status

### Requirement: Account contact and card (DDL)

Recovered from: CUSTOMER-ENT-0003
The system SHALL record for each account a status, exactly one contact (family name, given name, telephone, email, all mandatory) with a mandatory address (street 1, city, state, zip, country; street 2 optional), and exactly one credit card.

#### Scenario: Account contact and card (DDL)

- **GIVEN** an address without street 2
- **WHEN** it is stored
- **THEN** it is accepted

### Requirement: Customer links (DDL)

Recovered from: CUSTOMER-ENT-0005
The system SHALL link each customer to exactly one sign-on user, one account and one profile, with the customer identified by the sign-on user name.

#### Scenario: Customer links (DDL)

- **GIVEN** a customer
- **WHEN** it is stored
- **THEN** it is identified by the sign-on user name

### Requirement: Order status listing

Recovered from: ORDC-REQ-0001
The system SHALL expose an order status listing joining each purchase order (id, user, date, value) with its current status from the order manager, listing only orders that have a status record.

#### Scenario: Order status listing

- **GIVEN** an order without a status record
- **WHEN** the listing is read
- **THEN** it is not listed

### Requirement: Profile storage limits

Recovered from: CUSTOMER-ACCOUNT-ENTITY-0002
The system SHALL keep one profile per profile id with a mandatory preferred language (max 10 characters), an optional favorite category, and mandatory my-list and banner preference flags.

#### Scenario: Profile storage limits

- **GIVEN** a language of 11 characters
- **WHEN** the profile is stored
- **THEN** it is rejected
