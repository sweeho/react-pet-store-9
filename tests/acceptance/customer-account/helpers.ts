// Shared fixtures for the customer-account acceptance tests.
let seq = 0;
export const uname = (p = "u") => `${p}${Date.now().toString(36)}${++seq}`.slice(0, 25);

export const form = (over: Record<string, unknown> = {}) => ({
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  country: "USA",
  phone: "555-0100",
  email: "jane@example.com",
  cardNumber: "4111-1111",
  cardType: "Visa",
  cardExpiry: "12/2030",
  language: "en_US",
  favoriteCategory: "FISH",
  myList: true,
  banner: true,
  ...over,
});

export const MINUTE = 60_000;
export const T0 = new Date("2026-01-01T10:00:00Z");
export const later = (minutes: number) => new Date(T0.getTime() + minutes * MINUTE);

export const without = <T extends Record<string, unknown>>(
  obj: T,
  key: string,
): Record<string, unknown> => Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));
