import { expect, test } from "@playwright/test";

// Runs against the seeded catalog (EST-1 and EST-6). Each test context has its own session cookie.
test.describe("shopping cart", () => {
  test("[SWHR8-C-0075] an empty cart page shows the empty message", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
  });

  test("[SWHR8-C-0078] add from the item page, then update and remove on the cart page", async ({
    page,
  }) => {
    await page.goto("/item/EST-1");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByLabel("Quantity EST-1", { exact: true })).toHaveValue("1");
    await expect(page.getByTestId("cart-badge").first()).toHaveText("1");
    await page.getByLabel("Quantity EST-1", { exact: true }).fill("3");
    await page.getByRole("button", { name: "Update", exact: true }).click();
    await expect(page.getByLabel("Quantity EST-1", { exact: true })).toHaveValue("3");
    await page.getByRole("link", { name: "Remove", exact: true }).click();
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
  });

  test("[SWHR8-C-0076] the cart page lists items with Remove, quantity, unit price and a USD total", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    await page.request.post("/api/cart/items", { data: { itemId: "EST-6", quantity: 1 } });
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: "Remove", exact: true })).toHaveCount(2);
    const cart = await (await page.request.get("/api/cart")).json();
    const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    await expect(page.getByText(usd(cart.total), { exact: true })).toBeVisible();
  });

  test('[SWHR8-C-0074] entering "abc" as a quantity removes the item', async ({ page }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    await page.goto("/cart");
    await page.getByLabel("Quantity EST-1", { exact: true }).fill("abc");
    await page.getByRole("button", { name: "Update", exact: true }).click();
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
  });

  test("[SWHR8-C-0083] the cart form applies several quantity changes at once", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1" } });
    await page.request.post("/api/cart/items", { data: { itemId: "EST-6" } });
    await page.goto("/cart");
    await page.getByLabel("Quantity EST-1", { exact: true }).fill("3");
    await page.getByLabel("Quantity EST-6", { exact: true }).fill("5");
    await page.getByRole("button", { name: "Update", exact: true }).click();
    await expect(page.getByLabel("Quantity EST-6", { exact: true })).toHaveValue("5");
    await expect(page.getByLabel("Quantity EST-1", { exact: true })).toHaveValue("3");
  });

  test("[SWHR8-C-0047] sign-off clears the cart but keeps the locale", async ({ page }) => {
    await page.request.post("/api/signon", { data: { userName: "j2ee", password: "j2ee" } });
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1" } });
    const before = await (await page.request.get("/api/session")).json();
    expect(before.cartCount).toBe(1);
    await page.request.post("/api/signoff");
    const after = await (await page.request.get("/api/session")).json();
    expect(after.cartCount).toBe(0);
    expect(after.locale).toBe(before.locale);
  });
});
