# Design notes: legacy implementation of customer-account

## User interface

No screen records were extracted for this capability; its user interface is unspecified. The legacy forms (sign-on, create account, customer profile) exist as JSPs, but only their rules (mandatory fields, duplicate-account and error redirects) were captured as requirements.

## Legacy implementation notes

- Data: EJB 2.0 CMP beans Customer, Account, Profile, ContactInfo, Address, CreditCard under `components/customer` and `components/contactinfo`; schema in `db/schema/petstore_oracle.sql`. Relationships are cascade-delete per ejb-jar.
- Sign-on: `components/signon` (SignOnFilter, UserEJB, CreateUserServlet), protected resources listed in the petstore `signon-config.xml`. Passwords and card numbers are stored in clear text.
- Petstore web tier: SignOnEJBAction, CreateUserEJBAction, CustomerHTMLAction, CustomerEJBAction, SignOffHTMLAction, BannerHelper; session timeout in web.xml and `conf/petstore.properties` (15 minutes, two places).
- Source records are duplicated across passes with colliding keys (e.g. CUST-ENT-0001 exists in db/a and contactinfo/b); the spec picks one record per behaviour. 61 distinct keys were read in parseable pass files against 39 ingested by the server; three pass files (catalog/a, encodingfilter/b, batch/a) did not parse and contain no customer-account records of interest.
- Not written as requirements (minor, duplicated or low-reachability): contact creation variants, the empty-address default, the contact XML interchange format and the address-service-missing failure (contactinfo/b), cascade-delete of the address is covered by the Cascade removal requirement.

## Conflicts for Intent

- Form makes e-mail optional; DDL makes contact e-mail NOT NULL and address country mandatory.
- Account status "disabled" exists but no code path setting it was found.
- Session timeout configured in two places.

## Record key collisions

Several record keys are reused by different passes or modules for different behaviour (CUST-ENT-0001, CUST-ENT-0002, CUST-REQ-0002, CUST-REQ-0004 to CUST-REQ-0006, CUST-RULE-0002, CUSTOMER-ACCOUNT-REQ-0001, CUSTOMER-ACCOUNT-REQ-0002, CUSTOMER-ACCOUNT-ENTITY-0001). Each key is written once in spec.md. The sign-on and database-schema readings were used; the contact-information readings (address removal with contact, empty address on creation, XML contact exchange, address service lookup failure) share those keys and are not separately stated. The platform should give them distinct keys.
