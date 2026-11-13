export interface AdminOrderRow {
  orderId: string;
  userId: string;
  date: string;
  value: number;
  status: string;
}

export function fetchOrders(_status: string): Promise<{ orders: AdminOrderRow[]; count: number }> {
  void _status;
  throw new Error("VortexNotImplemented");
}
