// The one catalog module (design C1). HTTP routes and in-process callers both
// go through it, so every access path returns the same results.

export const CATALOG_PAGE_SIZE = 2;

export class CatalogError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CatalogError";
  }
}

export interface Category {
  id: string;
  name: string;
  locale: string;
  image?: string;
}
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  locale: string;
  image?: string;
  description?: string;
}
export interface Item {
  id: string;
  productId: string;
  locale: string;
  listPrice: number;
  unitCost: number;
  image: string;
  description: string;
}

export interface Page<T> {
  rows: T[];
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PageRequest {
  start: number;
  count?: number;
}

export type Table = "category" | "product" | "item";
type Row = Record<string, unknown>;

/** Rows of one table; implementations may pre-filter by locale, the catalog filters again. */
export interface CatalogSource {
  select(table: Table, locale: string): Promise<Row[]>;
}

export function paginate<T>(rows: T[], start: number, count: number): Page<T> {
  if (!Number.isInteger(start) || start < 0 || start >= rows.length) {
    return { rows: [], hasNext: false, hasPrevious: false };
  }
  return {
    rows: rows.slice(start, start + count),
    hasNext: start + count < rows.length,
    hasPrevious: start > 0,
  };
}

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const byName = (a: { name: string }, b: { name: string }) => collator.compare(a.name, b.name);
const byId = (a: { id: string }, b: { id: string }) => collator.compare(a.id, b.id);

export interface Catalog {
  listCategories(locale: string): Promise<Category[]>;
  getCategory(id: string, locale: string): Promise<Category | undefined>;
  listProducts(categoryId: string, locale: string, page: PageRequest): Promise<Page<Product>>;
  getProduct(id: string, locale: string): Promise<Product | undefined>;
  listItems(productId: string, locale: string, page: PageRequest): Promise<Page<Item>>;
  getItem(id: string, locale: string): Promise<Item | undefined>;
  searchItems(query: string, locale: string, page: PageRequest): Promise<Page<Item>>;
}

export function createCatalog(opts: { source: CatalogSource }): Catalog {
  async function read<T>(table: Table, locale: string): Promise<T[]> {
    try {
      const rows = await opts.source.select(table, locale);
      return rows.filter((r) => r.locale === locale) as T[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new CatalogError(`Catalog data access failed: ${message}`, { cause: error });
    }
  }
  const size = (page: PageRequest) => page.count ?? CATALOG_PAGE_SIZE;

  return {
    async listCategories(locale) {
      return (await read<Category>("category", locale)).sort(byName);
    },
    async getCategory(id, locale) {
      return (await read<Category>("category", locale)).find((c) => c.id === id);
    },
    async listProducts(categoryId, locale, page) {
      const rows = (await read<Product>("product", locale))
        .filter((p) => p.categoryId === categoryId)
        .sort(byName);
      return paginate(rows, page.start, size(page));
    },
    async getProduct(id, locale) {
      return (await read<Product>("product", locale)).find((p) => p.id === id);
    },
    async listItems(productId, locale, page) {
      const rows = (await read<Item>("item", locale))
        .filter((i) => i.productId === productId)
        .sort(byId);
      return paginate(rows, page.start, size(page));
    },
    async getItem(id, locale) {
      return (await read<Item>("item", locale)).find((i) => i.id === id);
    },
    async searchItems(query, locale, page) {
      // Distinct lowercased keywords; none means nothing to look for, so the
      // source is not read at all (design C4).
      const keywords = [...new Set(query.trim().toLowerCase().split(/\s+/).filter(Boolean))];
      if (keywords.length === 0) return paginate([], 0, size(page));
      const products = new Map((await read<Product>("product", locale)).map((p) => [p.id, p]));
      const items = await read<Item>("item", locale);
      const matches = items
        .filter((item) => {
          const parent = products.get(item.productId);
          const haystacks = [
            item.description,
            parent?.name ?? "",
            // Matches the category identifier, not its name (design D4).
            parent?.categoryId ?? "",
          ].map((s) => s.toLowerCase());
          return keywords.some((k) => haystacks.some((h) => h.includes(k)));
        })
        .sort(byId);
      return paginate(matches, page.start, size(page));
    },
  };
}
