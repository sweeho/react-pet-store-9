// Shared fixtures for the order-reporting-batch acceptance tests.
export type OrderStatus = "PENDING" | "APPROVED" | "COMPLETED" | "DENIED";

export type Order = {
  orderId: string;
  userName: string;
  orderTime: Date;
  locale: string;
  value: number;
  lineCount: number;
  status: OrderStatus;
};

export type Mail = { to: string | string[]; subject?: string; body?: string };

export const HOUR = 3_600_000;

export const order = (orderId: string, orderTime: Date, over: Partial<Order> = {}): Order => ({
  orderId,
  userName: "alice",
  orderTime,
  locale: "en_US",
  value: 123.45,
  lineCount: 2,
  status: "COMPLETED",
  ...over,
});

export const hoursBefore = (now: Date, hours: number): Date =>
  new Date(now.getTime() - hours * HOUR);

// Local-time midnight `days` days before the day of `now` (the spec speaks of local midnight).
export const localMidnight = (now: Date, days = 0): Date =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);

export const daysAgo = (now: Date, days: number): Date =>
  new Date(now.getTime() - days * 24 * HOUR);

export const ymd = (d: Date): string =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

export const recipients = (mails: Mail[]): string[] => mails.flatMap((m) => [m.to].flat());
