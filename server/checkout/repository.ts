// The only module that touches the order tables (change swhr8-i-0007, design O1-O3).
import { and, asc, eq, gte, lt } from "drizzle-orm";

import { db } from "../../db/client";
import {
  idCounter,
  orderContact,
  orderCreditCard,
  orderLineItem,
  orderStatus,
  purchaseOrder,
} from "../../db/schema";
import {
  isRecognisedStatus,
  NotFoundError,
  type RecordMap,
  type StatusRecord,
} from "../approval/service";
import { generateIdentifier } from "./identifiers";
import type { Card, Contact, Order } from "./model";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Db = typeof db | Tx;

export interface ContactInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface LineRecord {
  orderId: string;
  lineNumber: number;
  categoryId: string;
  productId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  quantityShipped: number;
}

export interface PurchaseOrderInput {
  orderId: string;
  userId?: string | null;
  email?: string | null;
  orderDate: Date;
  locale: string;
  total: number;
  contactId?: number;
  billContactId?: number;
  shipContactId?: number;
  creditCardId: number;
  lines?: LineRecord[];
}

const insertContact = (d: Db, c: ContactInput): number =>
  d.insert(orderContact).values(c).returning({ id: orderContact.id }).get().id;

const insertCard = (d: Db, c: Card): number =>
  d
    .insert(orderCreditCard)
    .values({ cardNumber: c.cardNumber, cardType: c.cardType, expiryDate: c.expiryDate })
    .returning({ id: orderCreditCard.id })
    .get().id;

function insertOrder(d: Db, o: PurchaseOrderInput): void {
  d.insert(purchaseOrder)
    .values({
      orderId: o.orderId,
      userId: o.userId ?? null,
      email: o.email ?? null,
      orderDate: o.orderDate,
      locale: o.locale,
      total: o.total,
      billContactId: (o.billContactId ?? o.contactId) as number,
      shipContactId: (o.shipContactId ?? o.contactId) as number,
      creditCardId: o.creditCardId,
    })
    .run();
  if (o.lines?.length) d.insert(orderLineItem).values(o.lines).run();
}

export async function saveContact(contact: ContactInput): Promise<{ id: number }> {
  return { id: insertContact(db, contact) };
}

/** Rejects a missing field or an expiry over 10 characters (R-0201, R-0199). */
export async function saveCreditCard(card: Card): Promise<{ id: number }> {
  return { id: insertCard(db, card) };
}

export async function getCreditCard(id: number): Promise<Card | undefined> {
  return db
    .select({
      cardNumber: orderCreditCard.cardNumber,
      cardType: orderCreditCard.cardType,
      expiryDate: orderCreditCard.expiryDate,
    })
    .from(orderCreditCard)
    .where(eq(orderCreditCard.id, id))
    .get();
}

/** Stores the order and its lines in one transaction; an unknown contact or card is refused. */
export async function savePurchaseOrder(order: PurchaseOrderInput): Promise<void> {
  db.transaction((tx) => insertOrder(tx, order));
}

export async function getPurchaseOrder(orderId: string) {
  return db.select().from(purchaseOrder).where(eq(purchaseOrder.orderId, orderId)).get();
}

export async function getOrderLines(orderId: string): Promise<LineRecord[]> {
  return db
    .select()
    .from(orderLineItem)
    .where(eq(orderLineItem.orderId, orderId))
    .orderBy(asc(orderLineItem.lineNumber))
    .all();
}

export async function findPurchaseOrdersByUser(userId: string) {
  return db.select().from(purchaseOrder).where(eq(purchaseOrder.userId, userId)).all();
}

/** Orders placed on the given local calendar day. */
export async function findPurchaseOrdersByDate(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return db
    .select()
    .from(purchaseOrder)
    .where(and(gte(purchaseOrder.orderDate, start), lt(purchaseOrder.orderDate, end)))
    .all();
}

/** Needs no user or role (R-0202). Quantity must be positive and shipped at most the quantity. */
export async function saveLineItem(line: LineRecord): Promise<void> {
  db.insert(orderLineItem).values(line).run();
}

/** All-or-nothing: one failing line stores none (R-0093). */
export async function saveLineItems(lines: LineRecord[]): Promise<void> {
  if (lines.length) db.transaction((tx) => void tx.insert(orderLineItem).values(lines).run());
}

export async function readLineItem(
  orderId: string,
  lineNumber: number,
): Promise<LineRecord | undefined> {
  return db
    .select()
    .from(orderLineItem)
    .where(and(eq(orderLineItem.orderId, orderId), eq(orderLineItem.lineNumber, lineNumber)))
    .get();
}

const counterStore = (d: Db) => ({
  get: (name: string): number | undefined =>
    d.select().from(idCounter).where(eq(idCounter.name, name)).get()?.value,
  set: (name: string, value: number): void =>
    void d
      .insert(idCounter)
      .values({ name, value })
      .onConflictDoUpdate({ target: idCounter.name, set: { value } })
      .run(),
});

/** The next identifier for the prefix, drawn from its own counter in one transaction (R-0096). */
export async function nextIdentifier(prefix: string): Promise<string> {
  return db.transaction((tx) => generateIdentifier({ prefix, store: counterStore(tx) }) as string);
}

export async function getCounter(prefix: string): Promise<number | undefined> {
  return counterStore(db).get(prefix);
}

/** The counter named "1001" starts so the first order number is 1001 (design O3, S1). */
export async function nextOrderNumber(): Promise<number> {
  return db.transaction((tx) => {
    const store = counterStore(tx);
    const next = (store.get("1001") ?? 1000) + 1;
    store.set("1001", next);
    return next;
  });
}

export async function getOrderStatus(orderId: string): Promise<string | undefined> {
  return db
    .select({ status: orderStatus.status })
    .from(orderStatus)
    .where(eq(orderStatus.orderId, orderId))
    .get()?.status;
}

/** Writes one order's status; an unknown order or a status outside the vocabulary is refused. */
export function updateOrderStatus(d: Db, orderId: string, status: string): void {
  if (!isRecognisedStatus(status)) throw new Error(`Unrecognised order status: ${status}`);
  const changed = d
    .update(orderStatus)
    .set({ status })
    .where(eq(orderStatus.orderId, orderId))
    .returning({ id: orderStatus.orderId })
    .all();
  if (!changed.length) throw new NotFoundError(`No status record for order ${orderId}`);
}

export function findOrderIdsByStatus(d: Db, status: string): StatusRecord[] {
  return d.select().from(orderStatus).where(eq(orderStatus.status, status)).all();
}

/** Orders that have a status record (inner join), with the fields the admin listing shows. */
export function listOrderStatusRows(d: Db) {
  return d
    .select({
      orderId: purchaseOrder.orderId,
      userId: purchaseOrder.userId,
      date: purchaseOrder.orderDate,
      value: purchaseOrder.total,
      status: orderStatus.status,
    })
    .from(purchaseOrder)
    .innerJoin(orderStatus, eq(orderStatus.orderId, purchaseOrder.orderId))
    .orderBy(asc(purchaseOrder.orderId))
    .all();
}

/** The status store the approval rules run over, backed by `order_status`. */
export function statusRecords(d: Db): RecordMap {
  const read = (orderId: string) =>
    d.select().from(orderStatus).where(eq(orderStatus.orderId, orderId)).get();
  return {
    get: read,
    has: (orderId) => read(orderId) !== undefined,
    set: (orderId, record) => {
      if (read(orderId)) updateOrderStatus(d, orderId, record.status);
      else d.insert(orderStatus).values({ orderId, status: record.status }).run();
    },
    values: () => d.select().from(orderStatus).all(),
  };
}

const contactRow = (c: Contact): ContactInput => ({
  firstName: c.firstName,
  lastName: c.lastName,
  phone: c.phone,
  email: c.email ?? "",
  address1: c.address1,
  address2: c.address2 ?? "",
  city: c.city,
  state: c.state,
  postalCode: c.postalCode,
  country: c.country ?? "",
});

/**
 * Stores a received order as PENDING in one transaction: card, both contacts, order, lines and
 * status (R-0092). An order id that is already stored is left alone, so redelivery never duplicates.
 */
export async function storeReceivedOrder(
  order: Order,
  afterStore?: (tx: Tx) => void,
): Promise<void> {
  db.transaction((tx) => {
    if (tx.select().from(purchaseOrder).where(eq(purchaseOrder.orderId, order.orderId)).get()) {
      return;
    }
    const creditCardId = insertCard(tx, order.creditCard);
    const billContactId = insertContact(tx, contactRow(order.billing));
    const shipContactId = insertContact(tx, contactRow(order.shipping));
    insertOrder(tx, {
      orderId: order.orderId,
      userId: order.userId,
      email: order.email,
      orderDate: order.orderDate,
      locale: order.locale,
      total: order.total,
      billContactId,
      shipContactId,
      creditCardId,
      lines: order.lines.map((l) => ({ ...l, orderId: order.orderId })),
    });
    tx.insert(orderStatus).values({ orderId: order.orderId, status: "PENDING" }).run();
    afterStore?.(tx);
  });
}

export interface PurchaseOrderDependentsInput {
  id: number | string;
  contact: ContactInput;
  creditCard: { number: string; type: string; expiry: string };
  lines: {
    lineNumber: number;
    category: string;
    product: string;
    item: string;
    quantity: number;
    unitPrice: number;
  }[];
}

/** Stores an order with its one contact, its card and its lines in one transaction (design F6). */
export async function createPurchaseOrderWithDependents(
  input: PurchaseOrderDependentsInput,
): Promise<void> {
  const orderId = String(input.id);
  db.transaction((tx) => {
    const contactId = insertContact(tx, input.contact);
    const creditCardId = insertCard(tx, {
      cardNumber: input.creditCard.number,
      cardType: input.creditCard.type,
      expiryDate: input.creditCard.expiry,
    });
    insertOrder(tx, {
      orderId,
      orderDate: new Date(),
      locale: "en_US",
      total: input.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
      contactId,
      creditCardId,
      lines: input.lines.map((l) => ({
        orderId,
        lineNumber: l.lineNumber,
        categoryId: l.category,
        productId: l.product,
        itemId: l.item,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        quantityShipped: 0,
      })),
    });
  });
}

/** Deletes the order with its line items, status, contacts and card, in one transaction (R-0113). */
export async function deletePurchaseOrder(id: number | string): Promise<void> {
  const orderId = String(id);
  db.transaction((tx) => {
    const order = tx.select().from(purchaseOrder).where(eq(purchaseOrder.orderId, orderId)).get();
    if (!order) return;
    tx.delete(orderLineItem).where(eq(orderLineItem.orderId, orderId)).run();
    tx.delete(orderStatus).where(eq(orderStatus.orderId, orderId)).run();
    tx.delete(purchaseOrder).where(eq(purchaseOrder.orderId, orderId)).run();
    for (const contactId of new Set([order.billContactId, order.shipContactId])) {
      tx.delete(orderContact).where(eq(orderContact.id, contactId)).run();
    }
    tx.delete(orderCreditCard).where(eq(orderCreditCard.id, order.creditCardId)).run();
  });
}

export async function findPurchaseOrderDependents(id: number | string) {
  const orderId = String(id);
  const order = db.select().from(purchaseOrder).where(eq(purchaseOrder.orderId, orderId)).get();
  return {
    contact: order
      ? db.select().from(orderContact).where(eq(orderContact.id, order.shipContactId)).get()
      : undefined,
    creditCard: order
      ? db.select().from(orderCreditCard).where(eq(orderCreditCard.id, order.creditCardId)).get()
      : undefined,
    lines: await getOrderLines(orderId),
  };
}

export interface FulfillmentOrder {
  orderId: string;
  userId: string | null;
  orderDate: Date;
  status: string | undefined;
  shipping: ContactInput | undefined;
  lines: LineRecord[];
}

function shippingContact(d: Db, id: number): ContactInput | undefined {
  const row = d.select().from(orderContact).where(eq(orderContact.id, id)).get();
  if (!row) return undefined;
  return {
    firstName: row.firstName ?? undefined,
    lastName: row.lastName ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address1: row.address1 ?? undefined,
    address2: row.address2 ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    postalCode: row.postalCode ?? undefined,
    country: row.country ?? undefined,
  };
}

/** An order with its shipping contact, lines and status, for the supplier hand-off and invoices. */
export function readOrderForFulfillment(d: Db, orderId: string): FulfillmentOrder | undefined {
  const order = d.select().from(purchaseOrder).where(eq(purchaseOrder.orderId, orderId)).get();
  if (!order) return undefined;
  return {
    orderId,
    userId: order.userId,
    orderDate: order.orderDate,
    status: d.select().from(orderStatus).where(eq(orderStatus.orderId, orderId)).get()?.status,
    shipping: shippingContact(d, order.shipContactId),
    lines: d
      .select()
      .from(orderLineItem)
      .where(eq(orderLineItem.orderId, orderId))
      .orderBy(asc(orderLineItem.lineNumber))
      .all(),
  };
}

/** Writes the shipped quantity of each line (never above the ordered quantity, by CHECK). */
export function writeShippedQuantities(
  d: Db,
  orderId: string,
  shipped: { lineNumber: number; shipped: number }[],
): void {
  for (const s of shipped) {
    d.update(orderLineItem)
      .set({ quantityShipped: s.shipped })
      .where(and(eq(orderLineItem.orderId, orderId), eq(orderLineItem.lineNumber, s.lineNumber)))
      .run();
  }
}
