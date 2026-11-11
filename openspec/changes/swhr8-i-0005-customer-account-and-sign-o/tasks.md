## 1. Data model

- [ ] 1.1 Define the customer aggregate keyed by sign-on user name with one account and one profile (SWHR8-T-0016; SWHR8-R-0001, SWHR8-R-0146, SWHR8-R-0180, SWHR8-R-0007)
- [ ] 1.2 Define account status, contact, address and payment card with mandatory fields (SWHR8-T-0016; SWHR8-R-0054, SWHR8-R-0057, SWHR8-R-0179, SWHR8-R-0184, SWHR8-R-0052)
- [ ] 1.3 Define the profile with defaults en_US, no favorite category, my list on, banner on (SWHR8-T-0016; SWHR8-R-0006, SWHR8-R-0055, SWHR8-R-0056, SWHR8-R-0048)
- [ ] 1.4 Implement cascade removal of dependents (SWHR8-T-0016; SWHR8-R-0053)
- [ ] 1.5 Define the sign-on user with unique name and mandatory password (SWHR8-T-0016; SWHR8-R-0182, SWHR8-R-0183, SWHR8-R-0045)

## 2. Registration and sign-on

- [ ] 2.1 Implement user creation with name and password limit validation (SWHR8-T-0016; SWHR8-R-0049, SWHR8-R-0176, SWHR8-R-0058)
- [ ] 2.2 Implement duplicate-account and creation-error outcomes (SWHR8-T-0016; SWHR8-R-0044, SWHR8-R-0058)
- [ ] 2.3 Implement authentication and failure handling (SWHR8-T-0016; SWHR8-R-0050)
- [ ] 2.4 Implement protected-page redirect and return to the requested page (SWHR8-T-0016; SWHR8-R-0181)
- [ ] 2.5 Implement the remember-user-name cookie (SWHR8-T-0016; SWHR8-R-0051, SWHR8-R-0061)
- [ ] 2.6 Implement sign-off and session inactivity expiry (SWHR8-T-0016; SWHR8-R-0060, SWHR8-R-0171, SWHR8-R-0172, SWHR8-R-0174, SWHR8-R-0185)

## 3. Customer profile management

- [ ] 3.1 Implement customer create and update with mandatory-field validation (SWHR8-T-0016; SWHR8-R-0173, SWHR8-R-0175)
- [ ] 3.2 Implement checkbox preference semantics (SWHR8-T-0016; SWHR8-R-0043)
- [ ] 3.3 Bind user and locale to the session on sign-on (SWHR8-T-0016; SWHR8-R-0145)
- [ ] 3.4 Implement banner selection by favourite category (SWHR8-T-0016; SWHR8-R-0046)
- [ ] 3.5 Implement post-creation sign-on and return flow (SWHR8-T-0016; SWHR8-R-0047)

## 4. Access control

- [ ] 4.1 Configure the list of pages requiring sign-on (SWHR8-T-0016; SWHR8-R-0059, SWHR8-R-0177, SWHR8-R-0178)
- [ ] 4.2 Enforce administrator role for admin and supplier functions (SWHR8-T-0016)

## 5. Verification

- [ ] 5.1 Write a scenario test per requirement in spec.md (SWHR8-T-0016)
