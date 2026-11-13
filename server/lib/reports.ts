// Revenue and order-quantity summaries with a grand total (design I8).
export interface ReportOrder {
  category: string;
  itemId: string;
  amount: number;
  quantity: number;
  /** ISO date, yyyy-mm-dd. */
  date: string;
}
export interface Report {
  entries: { key: string; amount: number }[];
  total: number;
}
interface Args {
  orders: ReportOrder[];
  start: string;
  end: string;
  category?: string;
}

function summarize(args: Args, value: (o: ReportOrder) => number): Report {
  const sums = new Map<string, number>();
  for (const o of args.orders) {
    if (o.date < args.start || o.date > args.end) continue;
    if (args.category && o.category !== args.category) continue;
    const key = args.category ? o.itemId : o.category;
    sums.set(key, (sums.get(key) ?? 0) + value(o));
  }
  const entries = [...sums].map(([key, amount]) => ({ key, amount }));
  return { entries, total: entries.reduce((sum, e) => sum + e.amount, 0) };
}

export const revenueReport = (args: Args): Report => summarize(args, (o) => o.amount);
export const orderQuantityReport = (args: Args): Report => summarize(args, (o) => o.quantity);
