// Order approval rules (change swhr8-i-0008, design P1, P4, P6). Pure and synchronous over an
// injected status store, queue and transaction; production passes adapters (see queue.ts).
import { parseXml } from "../checkout/xml";

export const STATUSES = ["PENDING", "APPROVED", "DENIED", "SHIPPED_PART", "COMPLETED"] as const;

export interface StatusRecord {
  orderId: string;
  status: string;
}

/** The slice of a Map the rules use, so a database adapter can stand in for it. */
export interface RecordMap {
  get(orderId: string): StatusRecord | undefined;
  has(orderId: string): boolean;
  set(orderId: string, record: StatusRecord): unknown;
  values(): Iterable<StatusRecord>;
}
export interface StatusStore {
  records: RecordMap;
}

export interface MessageQueue {
  deliver(text: string): void;
}
export interface Transaction {
  enlist(fn: () => void): void;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export const isRecognisedStatus = (name: string): boolean =>
  (STATUSES as readonly string[]).includes(name);

export function createStatusRecord(args: {
  store: StatusStore;
  orderId: string;
  status: string;
}): StatusRecord {
  const { store, orderId, status } = args;
  if (!isRecognisedStatus(status)) throw new Error(`Unrecognised order status: ${status}`);
  if (store.records.has(orderId)) throw new Error(`Order ${orderId} already has a status record`);
  const record = { orderId, status };
  store.records.set(orderId, record);
  return record;
}

export function getStatus(args: { store: StatusStore; orderId: string }): string {
  const record = args.store.records.get(args.orderId);
  if (!record) throw new NotFoundError(`No status record for order ${args.orderId}`);
  return record.status;
}

export function updateStatus(args: { store: StatusStore; orderId: string; status: string }): void {
  const { store, orderId, status } = args;
  if (!store.records.has(orderId)) throw new NotFoundError(`No status record for order ${orderId}`);
  if (!isRecognisedStatus(status)) throw new Error(`Unrecognised order status: ${status}`);
  store.records.set(orderId, { orderId, status });
}

export const findOrdersByStatus = (args: { store: StatusStore; status: string }): StatusRecord[] =>
  [...args.store.records.values()].filter((r) => r.status === args.status);

export interface PurchaseOrderRow {
  orderId: string;
  userId: string;
  orderDate: Date;
  value: number;
}

/** Orders without a status record are left out. */
export function listOrderStatuses(args: {
  purchaseOrders: PurchaseOrderRow[];
  store: StatusStore;
}) {
  return args.purchaseOrders.flatMap((o) => {
    const record = args.store.records.get(o.orderId);
    return record
      ? [
          {
            orderId: o.orderId,
            userId: o.userId,
            date: o.orderDate,
            value: o.value,
            status: record.status,
          },
        ]
      : [];
  });
}

export interface Decision {
  orderId: string;
  orderStatus: string;
}

/** Checks element names and child order in code (design SD6); throws on an invalid document. */
export function parseApprovalDocument(xml: string): Decision[] {
  const root = parseXml(xml);
  if (root.name !== "OrderApproval") throw new Error("An OrderApproval element is expected");
  return root.children.map((node) => {
    if (node.name !== "Order") throw new Error(`An Order element is expected, found ${node.name}`);
    const names = node.children.map((c) => c.name);
    if (names.length !== 2 || names[0] !== "OrderId" || names[1] !== "OrderStatus") {
      throw new Error("An Order must contain OrderId then OrderStatus");
    }
    return { orderId: node.children[0].text.trim(), orderStatus: node.children[1].text.trim() };
  });
}

export const createOrderMessage = (args: { orderId: string; total: number; locale: string }) => ({
  orderId: args.orderId,
  total: args.total,
  locale: args.locale,
});

/** Exact-locale limits; equality, other locales and non-finite totals stay PENDING (design P6). */
const LIMITS: Record<string, number> = { en_US: 500, ja_JP: 50000 };

export function evaluateOrder(args: { total: number; locale: string }): "APPROVED" | "PENDING" {
  const limit = Object.hasOwn(LIMITS, args.locale) ? LIMITS[args.locale] : undefined;
  return limit !== undefined && Number.isFinite(args.total) && args.total < limit
    ? "APPROVED"
    : "PENDING";
}

export function receiveOrder(args: {
  store: StatusStore;
  order: { orderId: string; total: number; locale: string };
}): void {
  const { store, order } = args;
  createStatusRecord({ store, orderId: order.orderId, status: evaluateOrder(order) });
}

export const approvalDocument = (orderId: string, status: string): string =>
  `<?xml version="1.0"?><OrderApproval><Order><OrderId>${orderId}</OrderId>` +
  `<OrderStatus>${status}</OrderStatus></Order></OrderApproval>`;

/** Applies a decision to a PENDING order only, then publishes it; others change nothing. */
export function handleDecision(args: {
  store: StatusStore;
  orderId: string;
  decision: "APPROVED" | "DENIED";
  send: (message: string) => void;
}): void {
  const { store, orderId, decision, send } = args;
  if (getStatus({ store, orderId }) !== "PENDING") return;
  updateStatus({ store, orderId, status: decision });
  send(approvalDocument(orderId, decision));
}

/** Inside a caller's transaction the delivery happens on commit; a failed delivery throws. */
export function sendMessage(args: {
  queue: MessageQueue;
  message: string;
  transaction?: Transaction;
}): void {
  const { queue, message, transaction } = args;
  if (transaction) transaction.enlist(() => queue.deliver(message));
  else queue.deliver(message);
}
