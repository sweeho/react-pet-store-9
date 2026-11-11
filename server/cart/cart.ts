// Red-phase stubs; the implementation replaces them (design K1, K5).
const nyi = (): never => {
  throw new Error("VortexNotImplemented");
};

export interface CartLine {
  itemId: string;
  productId: string;
  categoryId: string;
  productName: string;
  attribute: string;
  quantity: number;
  listPrice: number;
}
export interface CatalogLookup {
  find(itemId: string, locale?: string): Omit<CartLine, "quantity"> | undefined;
}
export interface Cart {
  add(itemId: string, quantity?: number): void;
  remove(itemId: string): void;
  updateQuantity(itemId: string, quantity: number): void;
  empty(): void;
  count(): number;
  quantities(): Record<string, number>;
}
export const createCart = (): Cart => nyi();
export const parseQuantity: (raw: unknown) => number = nyi;
export const listLines: (c: Cart, cat: CatalogLookup, locale?: string) => CartLine[] = nyi;
export const subtotal: (c: Cart, cat: CatalogLookup) => number = nyi;
