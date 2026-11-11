import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";

import {
  category,
  categoryDetails,
  inventory,
  item,
  itemDetails,
  product,
  productDetails,
} from "./schema";

/** Flat per-locale catalog rows: the shape of db/seed/catalog.json and of POST /api/test/seed. */
export interface CatalogSeed {
  categories: { id: string; name: string; locale: string; image?: string | null }[];
  products: {
    id: string;
    categoryId: string;
    name: string;
    locale: string;
    image?: string | null;
    description?: string | null;
  }[];
  items: {
    id: string;
    productId: string;
    description: string;
    locale: string;
    listPrice: number;
    unitCost: number;
    image: string;
  }[];
  inventory?: { itemId: string; qty: number }[];
}

const unique = <T>(values: T[]): T[] => [...new Set(values)];

/** Replaces the whole catalog with `seed`, in one transaction. */
export function replaceCatalog(db: BunSQLiteDatabase<Record<string, unknown>>, seed: CatalogSeed) {
  db.transaction((tx) => {
    tx.delete(inventory).run();
    tx.delete(itemDetails).run();
    tx.delete(item).run();
    tx.delete(productDetails).run();
    tx.delete(product).run();
    tx.delete(categoryDetails).run();
    tx.delete(category).run();

    const categoryIds = unique(seed.categories.map((c) => c.id));
    for (const id of categoryIds) tx.insert(category).values({ id }).run();
    for (const c of seed.categories) {
      tx.insert(categoryDetails)
        .values({ categoryId: c.id, locale: c.locale, name: c.name, image: c.image ?? null })
        .run();
    }
    const parents = new Map(seed.products.map((p) => [p.id, p.categoryId]));
    for (const [id, categoryId] of parents) tx.insert(product).values({ id, categoryId }).run();
    for (const p of seed.products) {
      tx.insert(productDetails)
        .values({
          productId: p.id,
          locale: p.locale,
          name: p.name,
          image: p.image ?? null,
          description: p.description ?? null,
        })
        .run();
    }
    const itemParents = new Map(seed.items.map((i) => [i.id, i.productId]));
    for (const [id, productId] of itemParents) tx.insert(item).values({ id, productId }).run();
    for (const i of seed.items) {
      tx.insert(itemDetails)
        .values({
          itemId: i.id,
          locale: i.locale,
          listPrice: i.listPrice,
          unitCost: i.unitCost,
          image: i.image,
          description: i.description,
        })
        .run();
    }
    for (const row of seed.inventory ?? []) {
      tx.insert(inventory).values({ itemId: row.itemId, qty: row.qty }).run();
    }
  });
}
