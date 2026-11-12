import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

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

// Order checkout (change swhr8-i-0007, design O2). Separate from the customer tables:
// an order's card is mandatory (R-0201), a customer's may be empty. Contact columns are
// nullable because saveContact may store a partial contact; checkout enforces the
// required fields in server/checkout/service.ts.
export const orderContact = sqliteTable("order_contact", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  email: text("email"),
  address1: text("address1"),
  address2: text("address2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
});

export const orderCreditCard = sqliteTable(
  "order_credit_card",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cardNumber: text("card_number").notNull(),
    cardType: text("card_type").notNull(),
    expiryDate: text("expiry_date").notNull(),
  },
  (t) => [check("order_credit_card_expiry_len", sql`length(${t.expiryDate}) <= 10`)],
);

export const purchaseOrder = sqliteTable(
  "purchase_order",
  {
    orderId: text("order_id").primaryKey(),
    userId: text("user_id"),
    email: text("email"),
    orderDate: integer("order_date", { mode: "timestamp_ms" }).notNull(),
    locale: text("locale").notNull(),
    total: real("total").notNull(),
    billContactId: integer("bill_contact_id")
      .notNull()
      .references(() => orderContact.id),
    shipContactId: integer("ship_contact_id")
      .notNull()
      .references(() => orderContact.id),
    creditCardId: integer("credit_card_id")
      .notNull()
      .references(() => orderCreditCard.id),
  },
  (t) => [
    index("purchase_order_user_idx").on(t.userId),
    index("purchase_order_date_idx").on(t.orderDate),
  ],
);

export const orderLineItem = sqliteTable(
  "order_line_item",
  {
    orderId: text("order_id")
      .notNull()
      .references(() => purchaseOrder.orderId),
    lineNumber: integer("line_number").notNull(),
    categoryId: text("category_id").notNull(),
    productId: text("product_id").notNull(),
    itemId: text("item_id").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: real("unit_price").notNull(),
    quantityShipped: integer("quantity_shipped").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.orderId, t.lineNumber] }),
    check("order_line_item_quantity_check", sql`${t.quantity} > 0`),
    check("order_line_item_shipped_check", sql`${t.quantityShipped} <= ${t.quantity}`),
  ],
);

export const idCounter = sqliteTable("id_counter", {
  name: text("name").primaryKey(),
  value: integer("value").notNull(),
});

export const orderStatus = sqliteTable("order_status", {
  orderId: text("order_id")
    .primaryKey()
    .references(() => purchaseOrder.orderId),
  status: text("status").notNull(),
});

export const orderMessage = sqliteTable("order_message", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull(),
  sessionId: text("session_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

// Generic transactional outbox for the shared asynchronous send (change swhr8-i-0008, design P3).
export const queueMessage = sqliteTable("queue_message", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  queue: text("queue").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
