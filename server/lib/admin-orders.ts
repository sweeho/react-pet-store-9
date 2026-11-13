// Order listing over status records and purchase orders (design M5).
export interface AdminOrder {
  orderId: string;
  userId: string;
  date: string;
  value: number;
  status: string;
}
export interface PurchaseOrderInput {
  orderId: string;
  userId: string;
  orderDate: Date;
  value: number;
}
export interface StatusRecordInput {
  orderId: string;
  status: string;
}

class AdminFacadeError extends Error {
  override name = "AdminFacadeError";
}

/** Exact, case-sensitive status match. */
export const findOrdersByStatus = <T extends { status: string }>(args: {
  orders: T[];
  status: string;
}): T[] => args.orders.filter((o) => o.status === args.status);

const formatDate = (d: Date): string => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

export function orderStatusView(args: {
  purchaseOrders: PurchaseOrderInput[];
  statusRecords: StatusRecordInput[];
}): AdminOrder[] {
  const byId = new Map(args.purchaseOrders.map((o) => [o.orderId, o]));
  return args.statusRecords.map((r) => {
    const o = byId.get(r.orderId);
    if (!o) throw new AdminFacadeError(`No purchase order for ${r.orderId}`);
    return {
      orderId: o.orderId,
      userId: o.userId,
      date: formatDate(o.orderDate),
      value: o.value,
      status: r.status,
    };
  });
}

export function listOrdersByStatus(args: {
  purchaseOrders: PurchaseOrderInput[];
  statusRecords: StatusRecordInput[];
  status: string;
}): { orders: AdminOrder[]; count: number } {
  const orders = orderStatusView({
    purchaseOrders: args.purchaseOrders,
    statusRecords: findOrdersByStatus({ orders: args.statusRecords, status: args.status }),
  });
  return { orders, count: orders.length };
}
