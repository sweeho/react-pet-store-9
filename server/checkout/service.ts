// Order placement and receipt (change swhr8-i-0007, design O5-O7).
import {
  FIXED_CARD,
  priceCart,
  type CartInputLine,
  type Card,
  type Contact,
  type Order,
} from "./model";
import { getOrderStatus, nextOrderNumber, storeReceivedOrder } from "./repository";
import { orderToXml, parseOrderXml } from "./xml";

export type CheckoutErrorCode = "EMPTY_CART" | "MISSING_FIELDS";

export class CheckoutError extends Error {
  constructor(
    readonly code: CheckoutErrorCode,
    message: string,
    readonly missing: string[] = [],
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export interface OrderQueue {
  deliver(text: string): void | Promise<void>;
}

export interface PlaceOrderInput {
  userId: string | null;
  locale: string;
  cart: CartInputLine[];
  billing: Partial<Contact>;
  shipping: Partial<Contact>;
  queue: OrderQueue;
  /** Accepted and ignored: every order carries the fixed card (R-0098). */
  accountCard?: Card;
  now?: Date;
}

const REQUIRED = [
  "lastName",
  "firstName",
  "address1",
  "city",
  "state",
  "postalCode",
  "phone",
] as const;

/** Missing required fields as `billing.<field>` / `shipping.<field>`; blank after trim counts as missing. */
export function missingFields(billing: Partial<Contact>, shipping: Partial<Contact>): string[] {
  const missing: string[] = [];
  for (const [party, contact] of [
    ["billing", billing],
    ["shipping", shipping],
  ] as const) {
    for (const field of REQUIRED) {
      if (!String(contact?.[field] ?? "").trim()) missing.push(`${party}.${field}`);
    }
  }
  return missing;
}

/** Country is not asked at checkout; it follows the locale's region (design S5). */
const COUNTRY_BY_REGION: Record<string, string> = { US: "USA", JP: "Japan", CN: "China" };
const countryFor = (locale: string): string =>
  COUNTRY_BY_REGION[locale.split("_")[1] ?? ""] ?? locale.split("_")[1] ?? "";

const clean = (c: Partial<Contact>, locale: string): Contact => ({
  lastName: String(c.lastName ?? "").trim(),
  firstName: String(c.firstName ?? "").trim(),
  address1: String(c.address1 ?? "").trim(),
  address2: String(c.address2 ?? "").trim(),
  city: String(c.city ?? "").trim(),
  state: String(c.state ?? "").trim(),
  postalCode: String(c.postalCode ?? "").trim(),
  country: countryFor(locale),
  phone: String(c.phone ?? "").trim(),
  email: String(c.email ?? "").trim(),
});

/**
 * Checks the empty cart, then the contacts, then draws the number, so a rejected order never
 * consumes one and never queues anything (design O5). Resolves to the order once its XML is queued.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  if (input.cart.length === 0) {
    throw new CheckoutError("EMPTY_CART", "Your shopping cart is empty");
  }
  const missing = missingFields(input.billing, input.shipping);
  if (missing.length) {
    throw new CheckoutError(
      "MISSING_FIELDS",
      `Required fields are missing: ${missing.join(", ")}`,
      missing,
    );
  }
  const billing = clean(input.billing, input.locale);
  const shipping = clean(input.shipping, input.locale);
  const priced = priceCart(input.cart);
  const order: Order = {
    orderId: String(await nextOrderNumber()),
    userId: input.userId,
    email: billing.email ?? "",
    orderDate: input.now ?? new Date(),
    locale: input.locale,
    total: priced.total,
    billing,
    shipping,
    creditCard: { ...FIXED_CARD },
    lines: priced.lines,
  };
  await input.queue.deliver(orderToXml(order));
  return order;
}

/** Order processing's side: stores the order with tracking status PENDING (R-0092). */
export async function receiveOrderMessage(xml: string): Promise<void> {
  await storeReceivedOrder(parseOrderXml(xml));
}

export const getOrderTrackingStatus = (orderId: string): Promise<string | undefined> =>
  getOrderStatus(orderId);
