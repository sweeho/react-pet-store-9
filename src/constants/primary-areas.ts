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
    slug: "localization",
    label: "Language",
    href: "/locale",
    description: "Choose the language you shop in.",
  },
];
