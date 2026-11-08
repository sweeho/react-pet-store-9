import { expect, test } from "@playwright/test";

// Assumed contract (the legacy storefront UI is unspecified; see the change's design.md):
//   POST /api/cart/items  { itemId, quantity }            adds to the session cart
//   GET  /api/cart        -> { items: [...] }
//   POST /api/checkout    { billing, shipping }           -> 200 { orderNumber, email }
//                                                          | 400 { missing: string[] } (nothing queued)
//   GET  /api/checkout/queue -> { messages: string[] }    XML purchase orders sent to order processing
//   GET  /api/account/profile -> saved profile of the signed-in customer
//   /checkout             form with labelled fields "Last name", "First name", "Address line 1",
//                         "Address line 2", "City", "State", "Postal code", "Telephone", "E-mail"
const party = (over: Record<string, string> = {}) => ({
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "Apt 2",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  phone: "555-0100",
  email: "jane@example.com",
  ...over,
});

test.describe("order checkout", () => {
  // case: SWHR8-C-0181@v1
  test("[SWHR8-C-0181] submission queues the XML order, empties the cart and returns number and e-mail", async ({
    request,
  }) => {
    await request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    expect(
      ((await (await request.get("/api/cart")).json()).items as unknown[]).length,
    ).toBeGreaterThan(0);
    const res = await request.post("/api/checkout", {
      data: { billing: party(), shipping: party() },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.orderNumber).toBeTruthy();
    expect(body.email).toBe("jane@example.com");
    const queue = await (await request.get("/api/checkout/queue")).json();
    expect(
      queue.messages.some(
        (m: string) => m.trimStart().startsWith("<") && m.includes(String(body.orderNumber)),
      ),
    ).toBe(true);
    expect((await (await request.get("/api/cart")).json()).items).toHaveLength(0);
  });

  // case: SWHR8-C-0182@v1
  test("[SWHR8-C-0182] a blank shipping city blocks the order and is reported", async ({
    request,
  }) => {
    await request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 1 } });
    const before = (await (await request.get("/api/checkout/queue")).json()).messages.length;
    const res = await request.post("/api/checkout", {
      data: { billing: party(), shipping: party({ city: "" }) },
    });
    expect(res.status()).toBe(400);
    expect(JSON.stringify((await res.json()).missing).toLowerCase()).toContain("city");
    expect((await (await request.get("/api/checkout/queue")).json()).messages).toHaveLength(before);
  });

  // case: SWHR8-C-0183@v1
  test("[SWHR8-C-0183] a blank address line 2 and e-mail are accepted", async ({ request }) => {
    await request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 1 } });
    const res = await request.post("/api/checkout", {
      data: {
        billing: party({ address2: "", email: "" }),
        shipping: party({ address2: "", email: "" }),
      },
    });
    expect(res.ok()).toBe(true);
    expect((await res.json()).orderNumber).toBeTruthy();
  });

  // case: SWHR8-C-0185@v1
  test("[SWHR8-C-0185] the checkout form is pre-filled from the saved profile", async ({
    page,
  }) => {
    const profile = party({ lastName: "Profile", firstName: "Sam", city: "Shelbyville" });
    await page.route("**/api/account/profile", (route) => route.fulfill({ json: profile }));
    await page.goto("/checkout");
    await expect(page.getByLabel("Last name").first()).toHaveValue("Profile");
    await expect(page.getByLabel("First name").first()).toHaveValue("Sam");
    await expect(page.getByLabel("City").first()).toHaveValue("Shelbyville");
  });
});
