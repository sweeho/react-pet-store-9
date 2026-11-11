import { sql } from "drizzle-orm";
import { check, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

// Customer account and sign-on (change swhr8-i-0005, design A2). Contact, address
// and card columns are nullable because a new customer owns empty rows (R-0054);
// mandatory fields are enforced in server/customer/model.ts.
export const signonUser = sqliteTable("signon_user", {
  userName: text("user_name").primaryKey(),
  password: text("password").notNull(),
});

export const address = sqliteTable("address", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  address1: text("address1"),
  address2: text("address2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
});

export const contact = sqliteTable("contact", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  email: text("email"),
  addressId: integer("address_id")
    .notNull()
    .unique()
    .references(() => address.id),
});

export const creditCard = sqliteTable("credit_card", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardNumber: text("card_number"),
  cardType: text("card_type"),
  cardExpiry: text("card_expiry"),
});

export const customer = sqliteTable("customer", {
  userName: text("user_name")
    .primaryKey()
    .references(() => signonUser.userName, { onDelete: "cascade" }),
});

export const account = sqliteTable(
  "account",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userName: text("user_name")
      .notNull()
      .unique()
      .references(() => signonUser.userName, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"),
    contactId: integer("contact_id")
      .notNull()
      .references(() => contact.id),
    creditCardId: integer("credit_card_id")
      .notNull()
      .references(() => creditCard.id),
  },
  (t) => [check("account_status_check", sql`${t.status} in ('active', 'disabled')`)],
);

export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userName: text("user_name")
    .unique()
    .references(() => signonUser.userName, { onDelete: "cascade" }),
  language: text("language").notNull(),
  favoriteCategory: text("favorite_category"),
  myList: integer("my_list", { mode: "boolean" }).notNull(),
  banner: integer("banner", { mode: "boolean" }).notNull(),
});
