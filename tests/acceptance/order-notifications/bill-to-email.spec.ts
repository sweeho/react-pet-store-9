import { expect, test } from "@playwright/test";

// Assumed contract (the storefront UI is unspecified; see the change's design.md):
//   POST /api/orders   body { items: [...], billTo: { email, ... } } -> { orderId }
//   GET  /api/orders/:orderId -> { orderId, billTo: { email } }   (the stored order)
//   /orders/:orderId   order confirmation page that shows the bill-to e-mail.
const email = "billto@example.com";

// case: SWHR8-C-0108@v1
test("[SWHR8-C-0108] bill-to e-mail is stored on the order and shown in the confirmation", async ({
  page,
  request,
}) => {
  const placed = await request.post("/api/orders", {
    data: {
      items: [{ itemId: "EST-1", quantity: 1 }],
      billTo: { firstName: "Al", lastName: "Ice", email },
    },
  });
  expect(placed.ok()).toBe(true);
  const { orderId } = await placed.json();

  await page.goto(`/orders/${orderId}`);
  await expect(page.getByText(email).first()).toBeVisible();

  const stored = await request.get(`/api/orders/${orderId}`);
  expect((await stored.json()).billTo.email).toBe(email);
});
