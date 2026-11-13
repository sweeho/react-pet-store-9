// Sales totals by category or item over an inclusive ISO date range (design M6, SD4: JS doubles).
export interface SalesLine {
  orderDate: string;
  category: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export function salesTotals(args: {
  lines: SalesLine[];
  type: string;
  start: string;
  end: string;
  category?: string;
}): { key: string; total: number }[] {
  const { lines, type, start, end, category } = args;
  const totals = new Map<string, number>();
  for (const l of lines) {
    if (l.orderDate < start || l.orderDate > end) continue;
    if (category && l.category !== category) continue;
    const key = category ? l.itemId : l.category;
    const amount = type === "REVENUE" ? l.quantity * l.unitPrice : l.quantity;
    totals.set(key, (totals.get(key) ?? 0) + amount);
  }
  return [...totals].map(([key, total]) => ({ key, total }));
}
