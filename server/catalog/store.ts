// An in-process validating writer for the catalog. It enforces the same rules
// as the database constraints (design C2): a product needs a stored category,
// and an item locale record needs every mandatory field.

export interface ItemLocaleRecord {
  itemId: string;
  locale: string;
  listPrice: number | undefined;
  unitCost: number | undefined;
  image: string | undefined;
  description: string | undefined;
}

export interface CatalogStore {
  addCategory(category: { id: string }): void;
  addProduct(product: { id: string; categoryId: string | undefined }): void;
  addItemLocale(record: ItemLocaleRecord): void;
  categories(): string[];
  products(): { id: string; categoryId: string }[];
  itemLocales(): ItemLocaleRecord[];
}

function required<T>(value: T | undefined | null | "", name: string): T {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function createCatalogStore(): CatalogStore {
  const categories = new Set<string>();
  const products: { id: string; categoryId: string }[] = [];
  const locales: ItemLocaleRecord[] = [];

  return {
    addCategory({ id }) {
      categories.add(required(id, "category id"));
    },
    addProduct({ id, categoryId }) {
      required(id, "product id");
      const parent = required(categoryId, "product category");
      if (!categories.has(parent)) throw new Error(`Unknown category ${parent}`);
      products.push({ id, categoryId: parent });
    },
    addItemLocale(record) {
      required(record.itemId, "item id");
      required(record.locale, "locale");
      required(record.listPrice, "list price");
      required(record.unitCost, "unit cost");
      required(record.image, "image");
      required(record.description, "description");
      locales.push(record);
    },
    categories: () => [...categories],
    products: () => [...products],
    itemLocales: () => [...locales],
  };
}
