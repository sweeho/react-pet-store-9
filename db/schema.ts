import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

// Catalog (change swhr8-i-0004, design C2): base tables hold identity and the
// parent link; per-locale text and prices live in the *_details tables.
export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
});

export const categoryDetails = sqliteTable(
  "category_details",
  {
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    image: text("image"),
  },
  (t) => [primaryKey({ columns: [t.categoryId, t.locale] })],
);

export const product = sqliteTable("product", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id),
});

export const productDetails = sqliteTable(
  "product_details",
  {
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    image: text("image"),
    description: text("description"),
  },
  (t) => [primaryKey({ columns: [t.productId, t.locale] })],
);

export const item = sqliteTable("item", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => product.id),
});

export const itemDetails = sqliteTable(
  "item_details",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => item.id),
    locale: text("locale").notNull(),
    listPrice: real("list_price").notNull(),
    unitCost: real("unit_cost").notNull(),
    image: text("image").notNull(),
    description: text("description").notNull(),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.locale] })],
);

// Created here because the catalog check (C5) needs it; fulfillment
// (SWHR8-I-0010) extends it.
export const inventory = sqliteTable("inventory", {
  itemId: text("item_id")
    .primaryKey()
    .references(() => item.id),
  qty: integer("qty").notNull(),
});
