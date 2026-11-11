# Design System

See [PRODUCT.md](./PRODUCT.md) for what this is, [ARCHITECTURE.md](./ARCHITECTURE.md) for how it's built.

## Tokens

OKLCH custom properties in `src/index.css` (`:root` light, `.dark` dark), mapped to Tailwind utilities via `@theme inline`. Add a token in both places + the theme block, or Tailwind won't generate a class for it.

| Token                                                | Tailwind class                                       |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `--background` / `--foreground`                      | `bg-background` / `text-foreground`                  |
| `--primary` / `--secondary` / `--muted` / `--accent` | `bg-*`                                               |
| `--destructive`                                      | `bg-destructive`                                     |
| `--border` / `--input` / `--ring`                    | `border-border` / `border-input` / `outline-ring/50` |
| `--radius` (+ `sm`/`md`/`lg`/`xl`)                   | `rounded-*`                                          |

Known bug: light-mode `--destructive-foreground` duplicates `--destructive` (text would be invisible). Dark mode has it right.

## Theming

Dark-mode tokens exist but no toggle is wired up — nothing sets `.dark` on `<html>` yet.

## Components

Pattern (see `src/components/ui/button.tsx` + `button-variants.ts`):

- Variants via `class-variance-authority`
- Class merging via `cn()` (`clsx` + `tailwind-merge`) — always last, so callers can override
- Polymorphism via Radix `Slot` (`asChild` prop)
- Variants exported from a separate `*-variants.ts` file, not the component file (avoids an `eslint-plugin-react-refresh` warning)

New shared components go in `src/components/ui/`, follow this pattern, get a `*.test.tsx`.

## Site shell and state frames

Every page renders inside one shell (route → `src/pages/_layout.tsx`; requirements → `openspec/specs/site-shell/`):

- **Header** (`banner`): the store name, linking to `/`, and a language control (globe icon + current language) linking to the Language page `/locale`.
- **Account control** (header, right of the language control): a "Sign in" link to `/signon` when signed out; when signed on, a "Hi, <user name> ▾" menu with "My account" (`/account`) and "Sign off". It is the only sign-on entry in the chrome; requirements → `openspec/specs/customer-account/`.
- **Global navigation** (`nav aria-label="Global"`): "Home" plus one entry per primary area. The "Cart" entry carries a badge with the number of distinct cart lines when it is above zero; it is the only cart entry in the chrome. Below the `lg` breakpoint it collapses behind a menu button into a `@headlessui/react` `Dialog`.
- **Main** (`main`): the page's own content; pages draw no chrome of their own.
- **Footer** (`contentinfo`): identical on every page, including a "Change language" link to `/locale`.

State frames (`src/components/shell/`) replace page-local placeholders:

| Frame          | When               | Contract                                                                          |
| -------------- | ------------------ | --------------------------------------------------------------------------------- |
| `LoadingFrame` | content on its way | `role="status"`, `data-testid="loading-frame"`                                    |
| `EmptyFrame`   | nothing to show    | `data-testid="empty-frame"`, title + message, optional "Back to home"             |
| `ErrorFrame`   | the load failed    | `role="alert"`, `data-testid="error-frame"`, "Try again" button calling `onRetry` |

Forms (sign-on, registration, profile) label every field, mark optional fields "(optional)" in the label rather than marking required ones, and on a rejected submit show one summary naming the missing fields above the form.

Reference mockups for each are exported per sprint under `artifacts/<sprint>/design/`.

## Lists and search

- **Paged lists.** A long list shows one page at a time, with a **Next** link when more rows follow and a **Previous** link after the first page. Links carry the page start in the URL, so a page can be bookmarked. A page past either end shows `EmptyFrame`, never an error.
- **Search box.** One keyword search box sits at the top of the Catalog and Search pages and submits to the search results page; the shell header has no search box. A blank search shows nothing and makes no request.
- **Prices.** Money is shown with the locale's currency format (see Language and localized text). When two prices sit together, each carries its own label. Exception: the cart page shows every amount in US dollars whatever the locale (requirement of `openspec/specs/shopping-cart/`).

## Language and localized text

- Every user-facing string, shell chrome included, comes from the per-locale screen dictionaries via `useScreen()` (`src/i18n/`). en_US is the fallback for a locale without a dictionary.
- `<html lang>` always carries the resolved locale code.
- Language choices are shown by their native names (English (US), Deutsch, 日本語, 简体中文) with the code beside them.
- A rejected change shows an `role="alert"` message saying the language could not be changed. The current language stays visible.
- Prices and numbers are formatted per locale. The screen sets the number of fraction digits.

## Icons

`lucide-react` for general use, `@heroicons/react` for `@headlessui/react` overlays (nav dialog).

## Animation

`tw-animate-css` — Tailwind v4-compatible successor to `tailwindcss-animate`.
