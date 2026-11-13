// Fulfilment documents (change swhr8-i-0010, design F10): UTF-8, two-space indented XML, dates as
// yyyy-MM-dd. Validation is a structural check in code, as in order approval (SD6).
import { parseXml, type XmlNode } from "../checkout/xml";
import { createLineItem, lineSnapshot, type LineItem, type LineSnapshot } from "./line-item";

export const SUPPLIER_ORDER_NAMESPACE = "http://www.petstore.example/supplier-order";
export const DEFAULT_LOCALE = "en_US";
export const INVOICE_GREETING = "Dear PetStore Customer";

export interface Address {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  email?: string;
  phone?: string;
}

export interface IncomingLine {
  category: string;
  product: string;
  item: string;
  lineNumber: number;
  quantity: number;
  unitPrice: number;
}

/** A purchase order as it arrives on the supplier purchase-order queue. */
export interface IncomingOrder {
  orderId: number;
  userId?: string;
  orderDate?: string | Date;
  locale?: string;
  shippingAddress?: Address;
  lines: IncomingLine[];
}

export interface Invoice {
  orderId: number;
  userId?: string;
  orderDate?: Date;
  shippingDate?: Date;
  greeting?: string;
  lines: LineItem[];
}

export interface SupplierOrderLike {
  id: number;
  userId?: string;
  orderDate: Date;
  status: string;
  contact?: Address & { address1?: string; postalCode?: string };
  lines: LineItem[];
}

export class InvalidDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDocumentError";
  }
}

const pad = (n: number): string => String(n).padStart(2, "0");
export const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** A yyyy-MM-dd text (local calendar day) or a Date; anything else is undefined. */
function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value !== "string") return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : undefined;
}

/** A missing, malformed or future order date is replaced by `now` and processing continues (F12). */
export function readIncomingOrder<T extends { orderDate?: unknown }>(
  doc: T,
  { now }: { now: Date },
): Omit<T, "orderDate"> & { orderDate: Date } {
  const parsed = parseDate(doc.orderDate);
  const orderDate = parsed && parsed.getTime() <= now.getTime() ? parsed : now;
  return { ...doc, orderDate };
}

/** The purchase order document; a missing locale reads as en_US. */
export function readPurchaseOrderDocument<T extends { locale?: string | null }>(
  doc: T,
): Omit<T, "locale"> & { locale: string } {
  return { ...doc, locale: doc.locale || DEFAULT_LOCALE };
}

export interface SupplierOrderDocument {
  orderId: number;
  userId?: string;
  orderDate: string;
  shippingAddress: Address;
  lineItems: LineSnapshot[];
}

export function toSupplierOrderDocument(order: SupplierOrderLike): SupplierOrderDocument {
  const c = order.contact ?? {};
  return {
    orderId: order.id,
    userId: order.userId,
    orderDate: formatDate(order.orderDate),
    shippingAddress: {
      firstName: c.firstName,
      lastName: c.lastName,
      street: c.street ?? c.address1,
      city: c.city,
      state: c.state,
      country: c.country,
      zipCode: c.zipCode ?? c.postalCode,
      email: c.email,
      phone: c.phone,
    },
    lineItems: order.lines.map(lineSnapshot),
  };
}

// --- writing -------------------------------------------------------------------------------

type Tree = { name: string; attrs?: string; text?: string; children?: Tree[] };

const escapeXml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const leaf = (name: string, value: string | number | undefined): Tree[] =>
  value === undefined || value === "" ? [] : [{ name, text: String(value) }];

function render(node: Tree, depth: number): string {
  const pad2 = "  ".repeat(depth);
  const open = `${node.name}${node.attrs ? ` ${node.attrs}` : ""}`;
  if (node.children?.length) {
    return (
      `${pad2}<${open}>\n` +
      node.children.map((c) => render(c, depth + 1)).join("") +
      `${pad2}</${node.name}>\n`
    );
  }
  return `${pad2}<${open}>${escapeXml(node.text ?? "")}</${node.name}>\n`;
}

const DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>\n';
const DOCTYPES: Record<string, string> = {
  SupplierOrder: '<!DOCTYPE SupplierOrder SYSTEM "SupplierOrder.dtd">\n',
  Invoice: '<!DOCTYPE Invoice SYSTEM "Invoice.dtd">\n',
  PurchaseOrder: '<!DOCTYPE PurchaseOrder SYSTEM "PurchaseOrder.dtd">\n',
};

const lineTree = (l: LineSnapshot): Tree => ({
  name: "LineItem",
  children: [
    ...leaf("Category", l.category),
    ...leaf("Product", l.product),
    ...leaf("Item", l.item),
    ...leaf("LineNumber", l.lineNumber),
    ...leaf("Quantity", l.quantity),
    ...leaf("UnitPrice", l.unitPrice),
  ],
});

const addressTree = (a: Address): Tree => ({
  name: "ShippingAddress",
  children: [
    ...leaf("FirstName", a.firstName),
    ...leaf("LastName", a.lastName),
    ...leaf("Street", a.street),
    ...leaf("City", a.city),
    ...leaf("State", a.state),
    ...leaf("Country", a.country),
    ...leaf("ZipCode", a.zipCode),
    ...leaf("Email", a.email),
    ...leaf("Phone", a.phone),
  ],
});

function documentTree(type: string, doc: Record<string, unknown>, attrs?: string): Tree {
  if (type === "Invoice") {
    const inv = doc as unknown as Invoice;
    return {
      name: "Invoice",
      attrs,
      children: [
        ...leaf("OrderId", inv.orderId),
        ...leaf("UserId", inv.userId),
        ...leaf("OrderDate", inv.orderDate && formatDate(inv.orderDate)),
        ...leaf("ShippingDate", inv.shippingDate && formatDate(inv.shippingDate)),
        ...leaf("Greeting", inv.greeting),
        { name: "LineItems", children: inv.lines.map(lineSnapshot).map(lineTree) },
      ],
    };
  }
  const d = doc as unknown as SupplierOrderDocument;
  return {
    name: type,
    attrs,
    children: [
      ...leaf("OrderId", d.orderId),
      ...leaf("UserId", d.userId),
      ...leaf("OrderDate", d.orderDate),
      addressTree(d.shippingAddress ?? {}),
      { name: "LineItems", children: d.lineItems.map(lineTree) },
    ],
  };
}

/** UTF-8 declaration, two-space indentation, and the document type (or its namespace). */
export function serializeDocument(
  doc: SupplierOrderDocument | Invoice,
  {
    type,
    adapter = false,
  }: { type: "SupplierOrder" | "Invoice" | "PurchaseOrder"; adapter?: boolean },
): string {
  const attrs = adapter ? `xmlns="${SUPPLIER_ORDER_NAMESPACE}"` : undefined;
  return (
    DECLARATION +
    (adapter ? "" : DOCTYPES[type]) +
    render(documentTree(type, doc as unknown as Record<string, unknown>, attrs), 0)
  );
}

export function toSupplierOrderXml(
  order: SupplierOrderLike,
  { adapter = false }: { adapter?: boolean } = {},
): string {
  return serializeDocument(toSupplierOrderDocument(order), { type: "SupplierOrder", adapter });
}

export const invoiceToXml = (invoice: Invoice): string =>
  serializeDocument(invoice, { type: "Invoice" });

// --- reading and validating ----------------------------------------------------------------

function parse(xml: string): XmlNode {
  return parseXml(xml.replace(/<!DOCTYPE[^>]*>/gi, ""));
}

const REQUIRED: Record<string, string[]> = {
  SupplierOrder: ["OrderId", "OrderDate", "ShippingAddress", "LineItems"],
  PurchaseOrder: ["OrderId", "OrderDate", "ShippingAddress", "LineItems"],
  Invoice: ["OrderId", "OrderDate", "ShippingDate", "LineItems"],
};

/** Checks the root element and its required children; never throws. */
export function validateDocument(
  xml: string,
  expectedType: string,
): { valid: boolean; errors: string[] } {
  let root: XmlNode;
  try {
    root = parse(xml);
  } catch (error) {
    return { valid: false, errors: [error instanceof Error ? error.message : "Malformed XML"] };
  }
  const errors: string[] = [];
  if (root.name !== expectedType) {
    errors.push(`Expected a ${expectedType} document, found ${root.name}`);
  } else {
    for (const name of REQUIRED[expectedType] ?? []) {
      if (!root.children.some((c) => c.name === name)) errors.push(`Missing element ${name}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

const text = (node: XmlNode, name: string): string | undefined =>
  node.children.find((c) => c.name === name)?.text.trim() || undefined;

function readLines(node: XmlNode): IncomingLine[] {
  const container = node.children.find((c) => c.name === "LineItems");
  return (container?.children ?? []).map((l) => ({
    category: text(l, "Category") ?? "",
    product: text(l, "Product") ?? "",
    item: text(l, "Item") ?? "",
    lineNumber: Number(text(l, "LineNumber")),
    quantity: Number(text(l, "Quantity")),
    unitPrice: Number(text(l, "UnitPrice")),
  }));
}

/** Reads a supplier purchase order document; a document of another type is refused. */
export function parseIncomingOrderXml(xml: string): IncomingOrder {
  const check = validateDocument(xml, "SupplierOrder");
  if (!check.valid) throw new InvalidDocumentError(check.errors.join("; "));
  const root = parse(xml);
  const address = root.children.find((c) => c.name === "ShippingAddress");
  return {
    orderId: Number(text(root, "OrderId")),
    userId: text(root, "UserId"),
    orderDate: text(root, "OrderDate"),
    locale: text(root, "Locale"),
    shippingAddress: address && {
      firstName: text(address, "FirstName"),
      lastName: text(address, "LastName"),
      street: text(address, "Street"),
      city: text(address, "City"),
      state: text(address, "State"),
      country: text(address, "Country"),
      zipCode: text(address, "ZipCode"),
      email: text(address, "Email"),
      phone: text(address, "Phone"),
    },
    lines: readLines(root),
  };
}

export function parseInvoiceXml(xml: string): Invoice {
  const check = validateDocument(xml, "Invoice");
  if (!check.valid) throw new InvalidDocumentError(check.errors.join("; "));
  const root = parse(xml);
  return {
    orderId: Number(text(root, "OrderId")),
    userId: text(root, "UserId"),
    orderDate: parseDate(text(root, "OrderDate")),
    shippingDate: parseDate(text(root, "ShippingDate")),
    greeting: text(root, "Greeting"),
    lines: readLines(root).map((l) => createLineItem(l, { shipped: l.quantity })),
  };
}
