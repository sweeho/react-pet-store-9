// Supplier and invoice line items (change swhr8-i-0010, design F1). Pure functions over plain objects.

export interface LineItem {
  category: string;
  product: string;
  item: string;
  lineNumber: number;
  quantity: number;
  unitPrice: number;
  shipped: number;
}

export type LineSnapshot = Omit<LineItem, "shipped">;

/** Copies the six document fields of `from` into a new line with the given shipped quantity. */
export function createLineItem(
  from: Omit<LineItem, "shipped"> & { shipped?: number },
  { shipped }: { shipped: number },
): LineItem {
  return {
    category: from.category,
    product: from.product,
    item: from.item,
    lineNumber: from.lineNumber,
    quantity: from.quantity,
    unitPrice: from.unitPrice,
    shipped,
  };
}

export function setShipped(line: { shipped: number }, shipped: number): void {
  line.shipped = shipped;
}

/** The six fields a document carries; the shipped quantity is not part of a document line. */
export function lineSnapshot(line: LineItem): LineSnapshot {
  return {
    category: line.category,
    product: line.product,
    item: line.item,
    lineNumber: line.lineNumber,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  };
}
