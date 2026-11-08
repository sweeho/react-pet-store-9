## ADDED Requirements

### Requirement: Customer aggregate

ID: SWHR8-R-0001
Recovered from: CUST-ENT-0001
The system SHALL hold a customer as a user name linked to exactly one account (status, contact information, payment card) and exactly one profile (preferred language, favourite category, list and banner preferences), with the customer identifier equal to the sign-on user name.

#### Scenario: Customer aggregate

- **GIVEN** a customer with user name "shopper"
- **WHEN** the customer is loaded
- **THEN** it has exactly one account, exactly one profile, and its identifier is "shopper"

### Requirement: Customer creation defaults

ID: SWHR8-R-0007
Recovered from: CUSTA-BR-0002
WHEN a customer is created, the system SHALL automatically create an account with status "active", and SHALL create a profile with default preferences.

#### Scenario: Customer creation defaults

- **GIVEN** a new customer being created
- **WHEN** creation completes
- **THEN** the customer has an active account and a profile holding default preferences

### Requirement: Profile record

ID: SWHR8-R-0006
Recovered from: CUST-ENT-0002
The system SHALL keep one profile per profile identifier holding a mandatory preferred language, mandatory my-list and banner preferences, and an optional favorite category.

#### Scenario: Profile record

- **GIVEN** a profile with no favorite category
- **WHEN** it is stored
- **THEN** it is accepted; omitting language or either preference is rejected

### Requirement: Profile defaults

Recovered from: CUSTA-ENT-0005
The system SHALL default a new profile to language en_US, no favorite category, my list on and banner on.

#### Scenario: Profile defaults

- **GIVEN** a customer created without profile input
- **WHEN** the profile is created
- **THEN** language is en_US, favorite category is empty, my list and banner are on

### Requirement: Account status and parts

Recovered from: CUSTA-ENT-0003
The system SHALL hold for each account a status of either "active" or "disabled", one contact-information record and one credit-card record; a new account has empty contact and credit-card records created with it.

#### Scenario: Account status and parts

- **GIVEN** a new account
- **WHEN** it is created
- **THEN** it has status active and empty contact and credit-card records

### Requirement: Cascade removal

Recovered from: CUSTA-BR-0004
WHEN a customer, account or profile is removed, the system SHALL also remove its dependent account, profile, contact information, address and credit card.

#### Scenario: Cascade removal

- **GIVEN** a customer with account, profile, contact, address and card
- **WHEN** the customer is removed
- **THEN** all dependent records are removed

### Requirement: Account contact and card mandatory fields

Recovered from: CUSB-ENT-0005
The system SHALL hold for each account a status, a contact (family name, given name, telephone, e-mail, all mandatory, plus an address with street, city, state, zip and country mandatory) and one payment card (number, type, expiry text, all mandatory); second street line is optional.

#### Scenario: Account contact and card mandatory fields

- **GIVEN** an account being stored
- **WHEN** the contact lacks e-mail or the address lacks a postal code
- **THEN** storage is rejected

### Requirement: Customer to sign-on link

Recovered from: CUST-ENT-0005
The system SHALL tie each customer to exactly one sign-on user, one account and one profile, with the user id as the customer's unique identifier.

#### Scenario: Customer to sign-on link

- **GIVEN** two customers
- **WHEN** both reference the same sign-on user
- **THEN** the second is rejected because the user id is unique

### Requirement: Sign-on user store

Recovered from: CUST-REQ-0007
The system SHALL store each user account as a unique user name (the identifier) with an associated password, and SHALL require both to be present.

#### Scenario: Sign-on user store

- **GIVEN** a stored user "j2ee"
- **WHEN** another user named "j2ee" is stored
- **THEN** it is rejected as a duplicate

### Requirement: Authentication

Recovered from: CUST-REQ-0001
The system SHALL authenticate a sign-on attempt by looking up the user by user name and comparing the supplied password with the stored password for exact equality, and SHALL treat an unknown user name as a failed authentication.

#### Scenario: Authentication

- **GIVEN** a user "j2ee" with password "j2ee"
- **WHEN** sign-on is attempted with an unknown name or a wrong password
- **THEN** authentication fails

### Requirement: User name and password limits

Recovered from: CUST-REQ-0002
The system SHALL reject creation of a user account when the user name exceeds 25 characters, when the password exceeds the maximum password length, or when the user name contains the character '%' or '\*'.

#### Scenario: User name and password limits

- **GIVEN** a user name of 26 characters, or one containing "\*"
- **WHEN** account creation is attempted
- **THEN** creation is rejected

### Requirement: Account creation outcome

Recovered from: CUST-REQ-0003
The system SHALL create a new user account from a submitted user name and password and, on success, redirect the customer onward; WHEN creation fails the system SHALL redirect the customer to a user-creation error page.

#### Scenario: Account creation outcome

- **GIVEN** valid credentials
- **WHEN** the creation request is submitted
- **THEN** the account exists and the customer is redirected onward; on failure the error page is shown

### Requirement: Duplicate-account screen

Recovered from: CUSTOMER-ACCOUNT-REQ-0001
The system SHALL create a sign-on user only when a user name and password are supplied, and GIVEN the user name cannot be created (for example it already exists) WHEN the customer submits THEN the system SHALL show the "duplicate account" screen.

#### Scenario: Duplicate-account screen

- **GIVEN** a user name that already exists
- **WHEN** a visitor registers with it
- **THEN** the duplicate-account screen is shown and no user is created

### Requirement: Protected resource redirect

Recovered from: CUST-REQ-0004
The system SHALL, for a customer who is not signed on and who requests a resource configured as protected, remember the requested address, show the sign-on page, and after successful sign-on redirect the customer to the remembered address.

#### Scenario: Protected resource redirect

- **GIVEN** a signed-out customer requesting a protected page
- **WHEN** the customer signs on successfully
- **THEN** the customer lands on the originally requested page

### Requirement: Sign-on failure

Recovered from: CUST-REQ-0005
The system SHALL redirect the customer to the configured sign-on error page WHEN authentication fails, and SHALL keep the customer not signed on.

#### Scenario: Sign-on failure

- **GIVEN** wrong credentials
- **WHEN** sign-on is submitted
- **THEN** the error page is shown and the session is not signed on

### Requirement: Remember user name cookie

Recovered from: CUST-REQ-0006
The system SHALL, WHEN the customer ticks the remember-user-name option at sign-on, store the user name in a cookie lasting 2678400 seconds (31 days); WHEN the option is not ticked the system SHALL expire any existing remember-user-name cookie.

#### Scenario: Remember user name cookie

- **GIVEN** a sign-on with the option ticked
- **WHEN** sign-on succeeds
- **THEN** a cookie holding the user name is set for 31 days

### Requirement: Remember cookie name

Recovered from: CUSTOMER-ACCOUNT-REQUIREMENT-0003
The system SHALL remember the user name of a returning customer in a browser cookie named bp_signon.

#### Scenario: Remember cookie name

- **GIVEN** a customer who asked to be remembered
- **WHEN** the customer returns
- **THEN** the sign-on form is prefilled from the bp_signon cookie

### Requirement: Pages requiring sign-on

Recovered from: CUSTOMER-ACCOUNT-REQ-0002
The system SHALL require sign-on before showing the customer account page, processing account changes, the order information page and the sign-on welcome page; all other pages SHALL be available without signing on.

#### Scenario: Pages requiring sign-on

- **GIVEN** a signed-out visitor
- **WHEN** the visitor requests the catalog or the customer account page
- **THEN** the catalog is shown; the account page requires sign-on

### Requirement: Sign-on form display

Recovered from: CUSTOMER-ACCOUNT-REQUIREMENT-0001
The system SHALL show the sign-on form (or the sign-on error page after a failed sign-on) when the user is not signed on and requests a protected screen.

#### Scenario: Sign-on form display

- **GIVEN** a signed-out visitor requesting a protected screen
- **WHEN** the request is made
- **THEN** the sign-on form is shown, or the error page after a failed attempt

### Requirement: Session inactivity timeout

Recovered from: CUSTOMER-ACCOUNT-REQ-0008
The system SHALL expire an inactive web session after 15 minutes.

#### Scenario: Session inactivity timeout

- **GIVEN** a session idle for 15 minutes
- **WHEN** the next request arrives
- **THEN** the session has ended and the customer is no longer signed on

### Requirement: Sign-on session binding

Recovered from: CUSTOMER-ACCOUNT-REQ-0006
The system SHALL, when a customer signs on, bind their user id to the shopping session, load their stored profile and set the session and cart locale from the preferred language.

#### Scenario: Sign-on session binding

- **GIVEN** a customer whose preferred language is ja_JP
- **WHEN** the customer signs on
- **THEN** the session and the cart locale are ja_JP

### Requirement: Sign-off

Recovered from: CUSTOMER-ACCOUNT-REQ-0007
The system SHALL, on sign-off, discard the whole session (cart and sign-on state) while keeping the current locale for the next session.

#### Scenario: Sign-off

- **GIVEN** a signed-on customer with a cart
- **WHEN** the customer signs off
- **THEN** the cart and sign-on state are gone and the locale is kept

### Requirement: Customer form mandatory fields

Recovered from: CUSTOMER-ACCOUNT-REQ-0003
The system SHALL require last name, first name, street address, city, state or province, postal code and telephone number when a customer account is created or updated, and SHALL treat a blank second street line as absent. E-mail is optional on the form.

#### Scenario: Customer form mandatory fields

- **GIVEN** a customer form with no city
- **WHEN** it is submitted
- **THEN** it is rejected naming the missing field

### Requirement: Customer data stored and updated

Recovered from: CUSTOMER-ACCOUNT-REQ-0004
The system SHALL store, for each customer, contact details (name, address, phone, e-mail), a credit card (number, type, expiry as month/year) and profile preferences (preferred language, favourite category, MyList on/off, banner on/off), and SHALL apply the same fields on update.

#### Scenario: Customer data stored and updated

- **GIVEN** an existing customer
- **WHEN** the customer updates the form
- **THEN** all contact, card and preference fields are replaced

### Requirement: Preference checkboxes

Recovered from: CUSTOMER-ACCOUNT-REQ-0009
The system SHALL treat the MyList and banner preferences as on only when their checkbox is submitted, and off otherwise.

#### Scenario: Preference checkboxes

- **GIVEN** a profile form with the banner checkbox cleared
- **WHEN** it is submitted
- **THEN** the banner preference is off

### Requirement: After account creation

Recovered from: CUSTOMER-ACCOUNT-REQ-0005
The system SHALL, after a new account has been created, mark the customer as signed on and return them to the page they originally asked for, or to the main page if that page was the account page.

#### Scenario: After account creation

- **GIVEN** a visitor who registered after requesting the order page
- **WHEN** creation completes
- **THEN** the visitor is signed on and returned to the order page

### Requirement: Banner by category

Recovered from: CA-REQ-0009
The system SHALL show a banner image chosen by the customer's favourite category (dogs, cats, reptiles, birds or fish), with the dogs banner for any other category.

#### Scenario: Banner by category

- **GIVEN** a customer whose favourite category is fish
- **WHEN** a page is shown with banners on
- **THEN** the fish banner is displayed; an unknown category shows the dogs banner

### Requirement: Sample users

Recovered from: CA-ENT-0010
The system SHALL maintain sample users j2ee and shopper, with a customer record for shopper, when sample data is loaded.

#### Scenario: Sample users

- **GIVEN** sample data is loaded
- **WHEN** it completes
- **THEN** users j2ee and shopper exist and shopper has a customer record

### Requirement: Admin application access

Recovered from: AOM-REQ-0005
The system SHALL restrict the admin application's request servlet to authenticated users in the administrator role using form-based login, and SHALL reject data requests that arrive without an established session with a "Session Timed Out" error.

#### Scenario: Admin application access

- **GIVEN** a request without a session
- **WHEN** data is requested
- **THEN** a "Session Timed Out" error is returned

### Requirement: Supplier access role

Recovered from: customer-account-BR-0001
The system SHALL require sign-on with the administrator role to use the supplier inventory update function.

#### Scenario: Supplier access role

- **GIVEN** a user without the administrator role
- **WHEN** the supplier update function is requested
- **THEN** access is denied

### Requirement: Contact record

Recovered from: CUSTOMER-ACCOUNT-ENTITY-0001
The system SHALL store a contact record holding given name, family name, telephone and e-mail, linked to exactly one postal address.

#### Scenario: Contact record

- **GIVEN** a contact record
- **WHEN** it is stored
- **THEN** it is linked to exactly one address
