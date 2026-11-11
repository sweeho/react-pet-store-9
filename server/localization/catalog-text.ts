import type { DetailRow, DetailsStore } from "./details";

export interface LocalizedCatalog {
  listCategories(locale: string): Promise<DetailRow[]>;
  getProduct(id: string, locale: string): Promise<DetailRow | undefined>;
}

function requireLocale(locale: unknown): asserts locale is string {
  if (typeof locale !== "string" || locale === "") {
    throw new Error("A locale is required to read catalog text");
  }
}

/**
 * Catalog text for one locale. Rows of any other locale are never substituted
 * (design L7), and a missing locale fails the request.
 */
export function createLocalizedCatalog(opts: { store: DetailsStore }): LocalizedCatalog {
  return {
    async listCategories(locale) {
      requireLocale(locale);
      return (await opts.store.list("category")).filter((row) => row.locale === locale);
    },
    async getProduct(id, locale) {
      requireLocale(locale);
      return opts.store.get("product", id, locale);
    },
  };
}
