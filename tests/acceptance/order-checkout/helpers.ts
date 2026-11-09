// Shared fixtures for the order-checkout acceptance tests.
export type FakeQueue = { delivered: string[]; deliver: (text: string) => void };
export const fakeQueue = (): FakeQueue => {
  const q: FakeQueue = {
    delivered: [],
    deliver(text) {
      q.delivered.push(text);
    },
  };
  return q;
};

export const contact = (over: Record<string, string> = {}) => ({
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  phone: "555-0100",
  email: "jane@example.com",
  ...over,
});

export const cart = () => [
  { categoryId: "FISH", productId: "FI-SW-01", itemId: "EST-1", quantity: 2, unitCost: 10 },
  { categoryId: "DOGS", productId: "K9-BD-01", itemId: "EST-6", quantity: 1, unitCost: 5 },
];

export const checkoutInput = (over: Record<string, unknown> = {}) => ({
  userId: "alice",
  locale: "en_US",
  cart: cart(),
  billing: contact(),
  shipping: contact(),
  ...over,
});
