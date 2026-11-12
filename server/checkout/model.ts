// Pure order model: cards, expiry, line items and pricing (change swhr8-i-0007, design O4, O6).

export interface Contact {
  lastName: string;
  firstName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone: string;
  email?: string;
}

export interface Card {
  cardNumber: string;
  cardType: string;
  expiryDate: string;
}

export interface LineItem {
  categoryId: string;
  productId: string;
  itemId: string;
  lineNumber: number;
  quantity: number;
  unitPrice: number;
  quantityShipped: number;
}

export interface CartInputLine {
  categoryId: string;
  productId: string;
  itemId: string;
  quantity: number;
  unitCost: number;
}

export interface Order {
  orderId: string;
  userId: string | null;
  email: string;
  orderDate: Date;
  locale: string;
  total: number;
  billing: Contact;
  shipping: Contact;
  creditCard: Card;
  lines: LineItem[];
}

/** The card every order carries (R-0098); the customer's own card is never read. */
export const FIXED_CARD: Card = {
  cardNumber: "1234-2334",
  cardType: "Duke Express",
  expiryDate: "10/2001",
};

/** Stores the three values as given, with no format check (R-0210). */
export const createCard = (cardNumber: string, cardType: string, expiryDate: string): Card => ({
  cardNumber,
  cardType,
  expiryDate,
});

/** "MM/YYYY" split at the first slash; no slash or no expiry falls back to 01/2010 (R-0205). */
export function cardExpiry(card: { expiryDate?: string | null }): { month: string; year: string } {
  const text = card.expiryDate ?? "";
  const slash = text.indexOf("/");
  if (slash < 0) return { month: "01", year: "2010" };
  return { month: text.slice(0, slash), year: text.slice(slash + 1) };
}

export const createLineItem = (line: LineItem): LineItem => ({
  categoryId: line.categoryId,
  productId: line.productId,
  itemId: line.itemId,
  lineNumber: line.lineNumber,
  quantity: line.quantity,
  unitPrice: line.unitPrice,
  quantityShipped: line.quantityShipped,
});

/** Numbers the cart lines from 0 and totals them in integer cents (design O4). */
export function priceCart(cart: CartInputLine[]): { total: number; lines: LineItem[] } {
  let cents = 0;
  const lines = cart.map((c, i) => {
    cents += Math.round(c.unitCost * 100) * c.quantity;
    return createLineItem({
      categoryId: c.categoryId,
      productId: c.productId,
      itemId: c.itemId,
      lineNumber: i,
      quantity: c.quantity,
      unitPrice: c.unitCost,
      quantityShipped: 0,
    });
  });
  return { total: cents / 100, lines };
}
