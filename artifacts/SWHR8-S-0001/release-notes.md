---
artifact: release-notes
spec: 1
status: complete
author_role: planning
sprint: SWHR8-S-0001
capability_brief: SWHR8-I-0002
branch: vortex/sprint/swhr8-s-0001-adec0dd3
upstream: [artifacts/SWHR8-S-0001/qa-test-report.md]
---

# Release notes — SWHR8-S-0001

## Added

- Opening the store's root address now shows a Pet Store landing page. It introduces the store and links to each primary area. (SWHR8-T-0002)
- Every page shares one header, navigation and footer. Selecting the store name or "Home" returns to the landing page, and on small screens the navigation collapses into a menu. (SWHR8-T-0002)
- When a page has nothing to show, is loading, or fails to load, it shows a shared message. A failed load offers a **Try again** button that reloads the data. (SWHR8-T-0002)
- A Language page lists the languages the store supports. (SWHR8-T-0002)

## Changed

- The template home page and its placeholder links are gone. "Page not found" and the error screen now appear inside the shared frame. (SWHR8-T-0002)

## Upgrade notes

- No migrations, configuration or feature flags. A new read-only endpoint, `GET /api/locales`, returns the supported locale codes. (SWHR8-T-0002)

## Not included

- The mockups show navigation entries for Catalog, Search, Cart, Account and Administration. These are not shown yet and will appear as each of those areas ships.
- The landing page's catalog/search buttons and the language chips from the mockup are not included, because the areas they lead to do not exist yet.
- Choosing a language is not included yet. It arrives with the Localization capability (SWHR8-I-0003).

## Verification

Verified at integration QA: all 5 scenarios pass, no defects. See `artifacts/SWHR8-S-0001/qa-test-report.md`.

## Compliance / Control Evidence

| Control                      | Evidence        | Location                                   | Status    | Exception |
| ---------------------------- | --------------- | ------------------------------------------ | --------- | --------- |
| Release contents recorded    | this file       | `artifacts/SWHR8-S-0001/release-notes.md`  | Satisfied | —         |
| Release verified before land | QA PASS verdict | `artifacts/SWHR8-S-0001/qa-test-report.md` | Satisfied | —         |
