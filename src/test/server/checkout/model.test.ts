// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary (pure, no I/O):
// server/checkout/model.ts exports
//   createCard(cardNumber, cardType, expiryDate) -> { cardNumber, cardType, expiryDate }  (stores as given, no validation)
//   cardExpiry(card) -> { month: string, year: string }   "10/2001" -> 10 / 2001; no slash or absent -> "01" / "2010"
//   createLineItem({ categoryId, productId, itemId, lineNumber, quantity, unitPrice, quantityShipped })
//   priceCart(cart: { categoryId, productId, itemId, quantity, unitCost }[])
//        -> { total: number, lines: { lineNumber: number, ... }[] }   line numbers are zero-based
// server/checkout/xml.ts exports
//   lineItemToXml(line) -> string  elements CategoryId, ProductId, ItemId, LineNum, Quantity, UnitPrice
//   parseAddressXml(xml) -> { ... }  throws an Error when the root element is not Address
// server/checkout/identifiers.ts exports
//   generateIdentifier({ prefix, store }) -> Promise<string> | string
//     store = { get(prefix): number | undefined | Promise<...>; set(prefix, value: number): void | Promise<void> }
//     a missing counter starts at 0; get() throwing makes generateIdentifier fail
const model = () => import("../../../../server/checkout/model");
const xml = () => import("../../../../server/checkout/xml");
const ids = () => import("../../../../server/checkout/identifiers");

const memStore = (initial: Record<string, number> = {}) => {
  const m = new Map(Object.entries(initial));
  return { get: (p: string) => m.get(p), set: (p: string, v: number) => void m.set(p, v) };
};

describe("payment card", () => {
  // case: SWHR8-C-0156@v1
  it("[SWHR8-C-0156] a payment card exposes card number, type and expiry date as text", async () => {
    const { createCard } = await model();
    const card = createCard("1111-2222", "Visa", "04/04");
    expect(card).toMatchObject({ cardNumber: "1111-2222", cardType: "Visa", expiryDate: "04/04" });
    expect(typeof card.cardNumber).toBe("string");
    expect(typeof card.cardType).toBe("string");
    expect(typeof card.expiryDate).toBe("string");
  });

  // case: SWHR8-C-0187@v1
  it("[SWHR8-C-0187] a malformed card number is stored as given", async () => {
    const { createCard } = await model();
    expect(createCard("abc", "Visa", "04/04").cardNumber).toBe("abc");
  });

  // case: SWHR8-C-0186@v1
  it("[SWHR8-C-0186] expiry 10/2001 parses to month 10 and year 2001", async () => {
    const { createCard, cardExpiry } = await model();
    expect(cardExpiry(createCard("1", "Visa", "10/2001"))).toEqual({ month: "10", year: "2001" });
  });

  // case: SWHR8-C-0169@v1
  it("[SWHR8-C-0169] an expiry without a slash falls back to 01/2010", async () => {
    const { createCard, cardExpiry } = await model();
    expect(cardExpiry(createCard("1", "Visa", "abcd"))).toEqual({ month: "01", year: "2010" });
  });
});

describe("order line item", () => {
  // case: SWHR8-C-0157@v1
  it("[SWHR8-C-0157] a line item carries all seven attributes", async () => {
    const { createLineItem } = await model();
    const line = createLineItem({
      categoryId: "FISH",
      productId: "FI-SW-01",
      itemId: "EST-1",
      lineNumber: 3,
      quantity: 2,
      unitPrice: 10,
      quantityShipped: 1,
    });
    expect(line).toEqual({
      categoryId: "FISH",
      productId: "FI-SW-01",
      itemId: "EST-1",
      lineNumber: 3,
      quantity: 2,
      unitPrice: 10,
      quantityShipped: 1,
    });
  });
});

describe("order total", () => {
  // case: SWHR8-C-0180@v1
  it("[SWHR8-C-0180] lines 2 x 10.00 and 1 x 5.00 total 25.00 and are numbered 0 and 1", async () => {
    const { priceCart } = await model();
    const priced = priceCart([
      { categoryId: "A", productId: "P1", itemId: "I1", quantity: 2, unitCost: 10 },
      { categoryId: "B", productId: "P2", itemId: "I2", quantity: 1, unitCost: 5 },
    ]);
    expect(priced.total).toBe(25);
    expect(priced.lines.map((l: { lineNumber: number }) => l.lineNumber)).toEqual([0, 1]);
  });
});

describe("XML forms", () => {
  // case: SWHR8-C-0168@v1
  it("[SWHR8-C-0168] a line item's XML elements appear in the stated order", async () => {
    const { lineItemToXml } = await xml();
    const out = lineItemToXml({
      categoryId: "FISH",
      productId: "FI-SW-01",
      itemId: "EST-1",
      lineNumber: 1,
      quantity: 2,
      unitPrice: 10,
    });
    const names = ["CategoryId", "ProductId", "ItemId", "LineNum", "Quantity", "UnitPrice"];
    const positions = names.map((n) => out.indexOf(`<${n}>`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  // case: SWHR8-C-0167@v1
  it("[SWHR8-C-0167] address XML whose root is Order is rejected", async () => {
    const { parseAddressXml } = await xml();
    const bad = `<?xml version="1.0"?><Order><StreetName1>1 Main</StreetName1><City>X</City><State>CA</State><ZipCode>9</ZipCode><Country>US</Country></Order>`;
    expect(() => parseAddressXml(bad)).toThrow(/Address/);
  });
});

describe("identifier generation", () => {
  // case: SWHR8-C-0162@v1
  it("[SWHR8-C-0162] the first identifier for prefix B is B1", async () => {
    const { generateIdentifier } = await ids();
    expect(await generateIdentifier({ prefix: "B", store: memStore() })).toBe("B1");
  });

  // case: SWHR8-C-0165@v1
  it("[SWHR8-C-0165] a counter for prefix A at 1 yields A2", async () => {
    const { generateIdentifier } = await ids();
    const store = memStore({ A: 1 });
    expect(await generateIdentifier({ prefix: "A", store })).toBe("A2");
    expect(store.get("A")).toBe(2);
  });

  // case: SWHR8-C-0163@v1
  it("[SWHR8-C-0163] a failing counter lookup raises an error and returns no identifier", async () => {
    const { generateIdentifier } = await ids();
    const store = {
      get: () => {
        throw new Error("lookup failed");
      },
      set: () => {},
    };
    await expect((async () => generateIdentifier({ prefix: "A", store }))()).rejects.toThrow(
      "lookup failed",
    );
  });
});
