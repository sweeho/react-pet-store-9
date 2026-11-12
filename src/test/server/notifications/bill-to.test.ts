// @vitest-environment node
import { expect, it } from "vitest";

import { getPurchaseOrder } from "../../../../server/checkout/repository";
import { placeOrder, receiveOrderMessage } from "../../../../server/checkout/service";

const contact = (email: string) => ({
  lastName: "Ice",
  firstName: "Al",
  address1: "1 Main",
  city: "Town",
  state: "CA",
  postalCode: "90000",
  phone: "555",
  email,
});

// Confirmation display is covered by src/pages/checkout/confirmation.test.tsx.
it("[SWHR8-C-0108] the bill-to e-mail is stored on the received order", async () => {
  const delivered: string[] = [];
  const order = await placeOrder({
    userId: "alice",
    locale: "de_DE",
    cart: [{ categoryId: "FISH", productId: "P", itemId: "I", quantity: 1, unitCost: 10 }],
    billing: contact("bill@example.com"),
    shipping: contact("ship@example.com"),
    queue: { deliver: (t) => void delivered.push(t) },
  });
  await receiveOrderMessage(delivered[0]);
  expect(order.email).toBe("bill@example.com");
  expect((await getPurchaseOrder(order.orderId))?.email).toBe("bill@example.com");
});
