export interface AdminOrderRow {
  orderId: string;
  userId: string;
  date: string;
  value: number;
  status: string;
}

export const ORDER_STATUSES = ["PENDING", "APPROVED", "DENIED", "COMPLETED"] as const;
export type OrderStatusName = (typeof ORDER_STATUSES)[number];

/** A non-OK reply from an admin route; `status` tells the page 401 (sign on) from 403 (refused). */
export class AdminApiError extends Error {
  constructor(readonly status: number) {
    super(`Admin request failed: ${status}`);
  }
}

export async function fetchOrders(
  status: string,
): Promise<{ orders: AdminOrderRow[]; count: number }> {
  const res = await fetch(`/api/admin/orders?status=${encodeURIComponent(status)}`);
  if (!res.ok) throw new AdminApiError(res.status);
  return (await res.json()) as { orders: AdminOrderRow[]; count: number };
}

export async function updateStatus(orders: { orderId: string; status: string }[]): Promise<void> {
  const res = await fetch("/api/admin/update-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orders }),
  });
  if (!res.ok) throw new AdminApiError(res.status);
}

export async function fetchSales(params: {
  type: "REVENUE" | "QUANTITY";
  start: string;
  end: string;
  category: string;
}): Promise<{ key: string; total: number }[]> {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/admin/sales?${q.toString()}`);
  if (!res.ok) throw new AdminApiError(res.status);
  return ((await res.json()) as { totals: { key: string; total: number }[] }).totals;
}
