# Design check — SWHR8-T-0002

Screenshots in `design-check/`. Built screens rendered from the dev server with Playwright. Icons are lucide-react equivalents; colours and radii use the existing `src/index.css` tokens, which equal the mockup values.

## SWHR8-MCK-1 Landing page

Route/state: /. Viewport: 1440.

- Mockup: `design-check/landing-desktop-mockup.png`
- Built: `design-check/landing-desktop-built.png`
- Differences left: Hero lacks the catalog/search buttons, language chips and Catalog/Cart chips (areas not built, D1); grid has one card (Language).

## SWHR8-MCK-2 Landing page · Mobile

Route/state: /. Viewport: 390.

- Mockup: `design-check/landing-mobile-mockup.png`
- Built: `design-check/landing-mobile-built.png`
- Differences left: Same omissions as MCK-1; art panel hidden below lg.

## SWHR8-MCK-3 Site shell

Route/state: /localization. Viewport: 1440.

- Mockup: `design-check/shell-desktop-mockup.png`
- Built: `design-check/shell-desktop-built.png`
- Differences left: Nav shows Home and Language only (D1). Footer has one Explore column from PRIMARY_AREAS instead of Shop / You.

## SWHR8-MCK-4 Site shell · Mobile

Route/state: /localization. Viewport: 390.

- Mockup: `design-check/shell-mobile-mockup.png`
- Built: `design-check/shell-mobile-built.png`
- Differences left: Nav collapsed to menu button, as drawn; drawer lists Home and Language only.

## SWHR8-MCK-5 Empty state

Route/state: /localization with /api/locales returning []. Viewport: 1440.

- Mockup: `design-check/empty-desktop-mockup.png`
- Built: `design-check/empty-desktop-built.png`
- Differences left: Mockup draws a 'Page title' breadcrumb and placeholder copy; built page shows the Language heading and 'No languages available'.

## SWHR8-MCK-6 Empty state · Mobile

Route/state: /localization with []. Viewport: 390.

- Mockup: `design-check/empty-mobile-mockup.png`
- Built: `design-check/empty-mobile-built.png`
- Differences left: Same as MCK-5.

## SWHR8-MCK-7 Error state

Route/state: /localization with /api/locales failing (500). Viewport: 1440.

- Mockup: `design-check/error-desktop-mockup.png`
- Built: `design-check/error-desktop-built.png`
- Differences left: Mockup page title placeholder replaced by Language heading; Try again reloads data instead of the page.

## SWHR8-MCK-8 Error state · Mobile

Route/state: /localization with a 500. Viewport: 390.

- Mockup: `design-check/error-mobile-mockup.png`
- Built: `design-check/error-mobile-built.png`
- Differences left: Same as MCK-7.
