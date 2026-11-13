export interface PrimaryArea {
  slug: string;
  label: string;
  href: string;
  description: string;
}

/**
 * Every primary area of the application. The global navigation, the footer and
 * the landing page all render from this list, so a capability that adds an area
 * adds one entry here and nowhere else.
 */
export const PRIMARY_AREAS: readonly PrimaryArea[] = [
  {
    slug: "catalog",
    label: "Catalog",
    href: "/catalog",
    description: "Browse categories, products and items, or search the catalog.",
  },
  {
    slug: "cart",
    label: "Cart",
    href: "/cart",
    description: "Review the items you have added and change their quantities.",
  },
  {
    slug: "account",
    label: "Account",
    href: "/account",
    description: "Sign on, create an account and manage your profile.",
  },
  {
    slug: "localization",
    label: "Language",
    href: "/locale",
    description: "Choose the language you shop in.",
  },
  {
    slug: "administration",
    label: "Administration",
    href: "/admin",
    description: "Sign in to manage supplier stock.",
  },
];
