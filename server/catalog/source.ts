import { eq } from "drizzle-orm";

import { db } from "../../db/client";
import { categoryDetails, item, itemDetails, product, productDetails } from "../../db/schema";
import type { CatalogSource, Table } from "./catalog";

/** The SQLite-backed catalog source: flat per-locale rows, filtered by locale in SQL. */
export const sqliteSource: CatalogSource = {
  async select(table: Table, locale: string) {
    switch (table) {
      case "category":
        return db
          .select({
            id: categoryDetails.categoryId,
            name: categoryDetails.name,
            image: categoryDetails.image,
            locale: categoryDetails.locale,
          })
          .from(categoryDetails)
          .where(eq(categoryDetails.locale, locale))
          .all();
      case "product":
        return db
          .select({
            id: productDetails.productId,
            categoryId: product.categoryId,
            name: productDetails.name,
            image: productDetails.image,
            description: productDetails.description,
            locale: productDetails.locale,
          })
          .from(productDetails)
          .innerJoin(product, eq(product.id, productDetails.productId))
          .where(eq(productDetails.locale, locale))
          .all();
      case "item":
        return db
          .select({
            id: itemDetails.itemId,
            productId: item.productId,
            listPrice: itemDetails.listPrice,
            unitCost: itemDetails.unitCost,
            image: itemDetails.image,
            description: itemDetails.description,
            locale: itemDetails.locale,
          })
          .from(itemDetails)
          .innerJoin(item, eq(item.id, itemDetails.itemId))
          .where(eq(itemDetails.locale, locale))
          .all();
    }
  },
};
