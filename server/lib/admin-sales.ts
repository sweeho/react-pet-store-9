export interface SalesLine {
  orderDate: string;
  category: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
}
export function salesTotals(_args: {
  lines: SalesLine[];
  type: string;
  start: string;
  end: string;
  category?: string;
}): { key: string; total: number }[] {
  throw new Error('VortexNotImplemented');
}
