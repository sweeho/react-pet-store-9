import { expect, test } from "@playwright/test";

// Assumed contract (the legacy storefront UI is unspecified; see the change's design.md):
//   POST /api/cart/items   { itemId, quantity? }   adds to the session cart (no sign-on needed) -> 2xx
//   POST /api/cart/update  { quantities: { [itemId]: string|number } }  applies all; non-whole -> 0; <=0 removes
//   GET  /api/cart         -> { items: [{ itemId, quantity, listPrice }], total }
//   POST /api/checkout     { billing, shipping }   -> 200 | 4xx with { error } mentioning the empty cart
//   /cart page: empty message "Your Shopping Cart is Empty."; otherwise per item a "Remove" link,
//     a quantity input (accessible name "Quantity <itemId>"), the unit price, a "Total" in US dollars
//     and an "Update" button submitting all quantities.
//   /checkout/error page for an empty cart shows "Order Error" and the word "empty".
const party = {
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  phone: "555-0100",
  email: "jane@example.com",
};

test.describe("shopping cart", () => {
  // case: SWHR8-C-0074@v1
  test('[SWHR8-C-0074] entering "abc" as a quantity removes the item', async ({ page }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    await page.goto("/cart");
    await page.getByLabel("Quantity EST-1").fill("abc");
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
    const cart = await (await page.request.get("/api/cart")).json();
    expect(cart.items).toHaveLength(0);
  });

  // case: SWHR8-C-0075@v1
  test("[SWHR8-C-0075] an empty cart page shows the empty message", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
  });

  // case: SWHR8-C-0076@v1
  test("[SWHR8-C-0076] the cart page lists items with remove link, quantity, unit price and USD total", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    await page.request.post("/api/cart/items", { data: { itemId: "EST-6", quantity: 1 } });
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: "Remove" })).toHaveCount(2);
    await expect(page.getByLabel("Quantity EST-1")).toHaveValue("2");
    await expect(page.getByLabel("Quantity EST-6")).toHaveValue("1");
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/\$\d[\d,]*\.\d{2}/);
    await expect(page.getByText(/Total/)).toContainText("$");
  });

  // case: SWHR8-C-0077@v1
  test("[SWHR8-C-0077] submitting the same order twice shows the empty-cart error page", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 1 } });
    const first = await page.request.post("/api/checkout", {
      data: { billing: party, shipping: party },
    });
    expect(first.ok()).toBe(true);
    const second = await page.request.post("/api/checkout", {
      data: { billing: party, shipping: party },
    });
    expect(second.ok()).toBe(false);
    expect(JSON.stringify(await second.json()).toLowerCase()).toContain("empty");
    await page.goto("/checkout/error");
    await expect(page.getByText("Order Error")).toBeVisible();
    await expect(page.getByText(/empty/i)).toBeVisible();
  });

  // case: SWHR8-C-0078@v1
  test("[SWHR8-C-0078] an anonymous shopper can add an item to the cart", async ({ request }) => {
    const res = await request.post("/api/cart/items", { data: { itemId: "EST-1" } });
    expect(res.ok()).toBe(true);
    const cart = await (await request.get("/api/cart")).json();
    expect(cart.items.map((i: { itemId: string }) => i.itemId)).toContain("EST-1");
  });

  // case: SWHR8-C-0083@v1
  test("[SWHR8-C-0083] the cart form applies several quantity changes at once", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 1 } });
    await page.request.post("/api/cart/items", { data: { itemId: "EST-6", quantity: 1 } });
    await page.goto("/cart");
    await page.getByLabel("Quantity EST-1").fill("3");
    await page.getByLabel("Quantity EST-6").fill("5");
    await page.getByRole("button", { name: "Update" }).click();
    const cart = await (await page.request.get("/api/cart")).json();
    const q = Object.fromEntries(
      cart.items.map((i: { itemId: string; quantity: number }) => [i.itemId, i.quantity]),
    );
    expect(q).toEqual({ "EST-1": 3, "EST-6": 5 });
  });
});
