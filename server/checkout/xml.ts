// XML interchange for the purchase order (change swhr8-i-0007, design O7). No XML library is
// available, so this is a small writer and a parser for the element-only documents used here.
import type { Card, Contact, LineItem, Order } from "./model";

const escapeXml = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const unescapeXml = (v: string): string =>
  v
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const el = (name: string, value: string | number): string =>
  `<${name}>${escapeXml(String(value))}</${name}>`;

export interface XmlNode {
  name: string;
  text: string;
  children: XmlNode[];
}

/** Parses an element-only document into a tree; throws on malformed markup. */
export function parseXml(xml: string): XmlNode {
  const body = xml.replace(/<\?[\s\S]*?\?>/g, "").trim();
  const token = /<(\/?)([A-Za-z_][\w.-]*)[^>]*?(\/?)>|([^<]+)/g;
  const root: XmlNode = { name: "#document", text: "", children: [] };
  const stack: XmlNode[] = [root];
  let match: RegExpExecArray | null;
  let consumed = 0;
  while ((match = token.exec(body))) {
    if (match.index !== consumed) throw new Error("Malformed XML");
    consumed = token.lastIndex;
    const top = stack[stack.length - 1];
    if (match[4] !== undefined) {
      top.text += unescapeXml(match[4]);
    } else if (match[1]) {
      if (stack.length < 2 || top.name !== match[2]) throw new Error("Malformed XML");
      stack.pop();
    } else {
      const node: XmlNode = { name: match[2], text: "", children: [] };
      top.children.push(node);
      if (!match[3]) stack.push(node);
    }
  }
  if (consumed !== body.length || stack.length !== 1 || root.children.length !== 1) {
    throw new Error("Malformed XML");
  }
  return root.children[0];
}

const child = (node: XmlNode, name: string): XmlNode | undefined =>
  node.children.find((c) => c.name === name);
const text = (node: XmlNode, name: string): string => child(node, name)?.text.trim() ?? "";

export function lineItemToXml(
  line: Pick<
    LineItem,
    "categoryId" | "productId" | "itemId" | "lineNumber" | "quantity" | "unitPrice"
  >,
): string {
  return (
    "<LineItem>" +
    el("CategoryId", line.categoryId) +
    el("ProductId", line.productId) +
    el("ItemId", line.itemId) +
    el("LineNum", line.lineNumber) +
    el("Quantity", line.quantity) +
    el("UnitPrice", line.unitPrice) +
    "</LineItem>"
  );
}

export interface ParsedAddress {
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

function addressOf(node: XmlNode): ParsedAddress {
  return {
    address1: text(node, "StreetName1"),
    address2: text(node, "StreetName2"),
    city: text(node, "City"),
    state: text(node, "State"),
    postalCode: text(node, "ZipCode"),
    country: text(node, "Country"),
  };
}

const addressToXml = (c: Contact): string =>
  "<Address>" +
  el("StreetName1", c.address1) +
  (c.address2 ? el("StreetName2", c.address2) : "") +
  el("City", c.city) +
  el("State", c.state) +
  el("ZipCode", c.postalCode) +
  el("Country", c.country ?? "") +
  "</Address>";

/** Parses an address document; any root other than Address is rejected (R-0100). */
export function parseAddressXml(xml: string): ParsedAddress {
  const root = parseXml(xml);
  if (root.name !== "Address") throw new Error(`Expected an Address document, got ${root.name}`);
  return addressOf(root);
}

const partyToXml = (tag: string, c: Contact): string =>
  `<${tag}>` +
  el("LastName", c.lastName) +
  el("FirstName", c.firstName) +
  el("Phone", c.phone) +
  el("Email", c.email ?? "") +
  addressToXml(c) +
  `</${tag}>`;

/** The purchase-order message sent to order processing. */
export function orderToXml(order: Order): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    "<Order>" +
    el("OrderId", order.orderId) +
    el("UserId", order.userId ?? "") +
    el("EmailAddress", order.email) +
    el("OrderDate", order.orderDate.toISOString()) +
    el("Locale", order.locale) +
    el("TotalPrice", order.total.toFixed(2)) +
    partyToXml("BillingInfo", order.billing) +
    partyToXml("ShippingInfo", order.shipping) +
    "<CreditCard>" +
    el("CardNumber", order.creditCard.cardNumber) +
    el("CardType", order.creditCard.cardType) +
    el("ExpiryDate", order.creditCard.expiryDate) +
    "</CreditCard>" +
    order.lines.map(lineItemToXml).join("") +
    "</Order>"
  );
}

function partyOf(node: XmlNode | undefined): Contact {
  if (!node) throw new Error("Order message has no billing or shipping information");
  const address = child(node, "Address");
  if (!address) throw new Error("Order message has no address");
  return {
    lastName: text(node, "LastName"),
    firstName: text(node, "FirstName"),
    phone: text(node, "Phone"),
    email: text(node, "Email"),
    ...addressOf(address),
  };
}

/** Reads a purchase-order message back into an order; throws when it is not one. */
export function parseOrderXml(xml: string): Order {
  const root = parseXml(xml);
  if (root.name !== "Order") throw new Error(`Expected an Order document, got ${root.name}`);
  const card = child(root, "CreditCard");
  if (!card) throw new Error("Order message has no credit card");
  const creditCard: Card = {
    cardNumber: text(card, "CardNumber"),
    cardType: text(card, "CardType"),
    expiryDate: text(card, "ExpiryDate"),
  };
  const lines: LineItem[] = root.children
    .filter((c) => c.name === "LineItem")
    .map((l) => ({
      categoryId: text(l, "CategoryId"),
      productId: text(l, "ProductId"),
      itemId: text(l, "ItemId"),
      lineNumber: Number(text(l, "LineNum")),
      quantity: Number(text(l, "Quantity")),
      unitPrice: Number(text(l, "UnitPrice")),
      quantityShipped: 0,
    }));
  const orderId = text(root, "OrderId");
  if (!orderId) throw new Error("Order message has no OrderId");
  const date = new Date(text(root, "OrderDate"));
  if (Number.isNaN(date.getTime())) throw new Error("Order message has no valid OrderDate");
  return {
    orderId,
    userId: text(root, "UserId") || null,
    email: text(root, "EmailAddress"),
    orderDate: date,
    locale: text(root, "Locale"),
    total: Number(text(root, "TotalPrice")),
    billing: partyOf(child(root, "BillingInfo")),
    shipping: partyOf(child(root, "ShippingInfo")),
    creditCard,
    lines,
  };
}
