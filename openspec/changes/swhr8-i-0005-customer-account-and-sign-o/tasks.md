## 1. Data model

- [ ] 1.1 Define the customer aggregate keyed by sign-on user name with one account and one profile
- [ ] 1.2 Define account status, contact, address and payment card with mandatory fields
- [ ] 1.3 Define the profile with defaults en_US, no favorite category, my list on, banner on
- [ ] 1.4 Implement cascade removal of dependents
- [ ] 1.5 Define the sign-on user with unique name and mandatory password

## 2. Registration and sign-on

- [ ] 2.1 Implement user creation with name and password limit validation
- [ ] 2.2 Implement duplicate-account and creation-error outcomes
- [ ] 2.3 Implement authentication and failure handling
- [ ] 2.4 Implement protected-page redirect and return to the requested page
- [ ] 2.5 Implement the remember-user-name cookie
- [ ] 2.6 Implement sign-off and session inactivity expiry

## 3. Customer profile management

- [ ] 3.1 Implement customer create and update with mandatory-field validation
- [ ] 3.2 Implement checkbox preference semantics
- [ ] 3.3 Bind user and locale to the session on sign-on
- [ ] 3.4 Implement banner selection by favourite category
- [ ] 3.5 Implement post-creation sign-on and return flow

## 4. Access control

- [ ] 4.1 Configure the list of pages requiring sign-on
- [ ] 4.2 Enforce administrator role for admin and supplier functions

## 5. Verification

- [ ] 5.1 Write a scenario test per requirement in spec.md
