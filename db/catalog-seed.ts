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

/**
 * Adds the rows of `seed`, replacing any row with the same key and leaving the
 * rest. Browser tests run in parallel against one server and each posts its own
 * rows, so a wholesale replace would wipe a sibling test's catalog.
 */
export function upsertCatalog(db: BunSQLiteDatabase<Record<string, unknown>>, seed: CatalogSeed) {
  db.transaction((tx) => {
    for (const id of unique(seed.categories.map((c) => c.id))) {
      tx.insert(category).values({ id }).onConflictDoNothing().run();
    }
    for (const c of seed.categories) {
      const values = { categoryId: c.id, locale: c.locale, name: c.name, image: c.image ?? null };
      tx.insert(categoryDetails)
        .values(values)
        .onConflictDoUpdate({
          target: [categoryDetails.categoryId, categoryDetails.locale],
          set: { name: values.name, image: values.image },
        })
        .run();
    }
    for (const p of seed.products) {
      tx.insert(product)
        .values({ id: p.id, categoryId: p.categoryId })
        .onConflictDoUpdate({ target: product.id, set: { categoryId: p.categoryId } })
        .run();
      const values = {
        productId: p.id,
        locale: p.locale,
        name: p.name,
        image: p.image ?? null,
        description: p.description ?? null,
      };
      tx.insert(productDetails)
        .values(values)
        .onConflictDoUpdate({
          target: [productDetails.productId, productDetails.locale],
          set: { name: values.name, image: values.image, description: values.description },
        })
        .run();
    }
    for (const i of seed.items) {
      tx.insert(item)
        .values({ id: i.id, productId: i.productId })
        .onConflictDoUpdate({ target: item.id, set: { productId: i.productId } })
        .run();
      const values = {
        itemId: i.id,
        locale: i.locale,
        listPrice: i.listPrice,
        unitCost: i.unitCost,
        image: i.image,
        description: i.description,
      };
      tx.insert(itemDetails)
        .values(values)
        .onConflictDoUpdate({
          target: [itemDetails.itemId, itemDetails.locale],
          set: {
            listPrice: values.listPrice,
            unitCost: values.unitCost,
            image: values.image,
            description: values.description,
          },
        })
        .run();
    }
    for (const row of seed.inventory ?? []) {
      tx.insert(inventory)
        .values(row)
        .onConflictDoUpdate({ target: inventory.itemId, set: { qty: row.qty } })
        .run();
    }
  });
}
