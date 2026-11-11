import { expect, test, type Page } from "@playwright/test";

// Runs against the seeded catalog (EST-1). Each test context has its own session cookie, and the
// checkout form is open to a signed-out shopper (design S2), so no sign-on is needed here.
const values: Record<string, string> = {
  "First name": "Sam",
  "Last name": "Kim",
  "Street address": "2550 Middlefield Road",
  City: "Palo Alto",
  "State or province": "CA",
  "Postal code": "94303",
  Telephone: "650-555-0142",
};

async function fillBoth(page: Page, skip: string[] = []) {
  for (const [label, value] of Object.entries(values)) {
    if (skip.includes(label)) continue;
    const inputs = page.getByLabel(label);
    for (let i = 0; i < (await inputs.count()); i++) await inputs.nth(i).fill(value);
  }
}

test.describe("order checkout", () => {
  test("[SWHR8-C-0181] cart to checkout to confirmation shows the order number and e-mail", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    await page.goto("/checkout");
    await fillBoth(page);
    await page.getByLabel("E-mail").first().fill("sam.kim@example.com");
    await page.getByRole("button", { name: /place order/i }).click();
    await expect(page).toHaveURL(/\/checkout\/confirmation$/);
    await expect(page.getByText("Order number", { exact: true })).toBeVisible();
    await expect(page.getByText("sam.kim@example.com")).toBeVisible();
    expect((await (await page.request.get("/api/cart")).json()).items).toHaveLength(0);
  });

  test("[SWHR8-C-0182] a missing shipping city shows the missing-fields summary", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 1 } });
    await page.goto("/checkout");
    await fillBoth(page, ["City"]);
    await page.getByLabel("City").first().fill("Palo Alto");
    await page.getByRole("button", { name: /place order/i }).click();
    const alert = page.getByRole("alert");
    await expect(alert).toContainText("Your order was not placed");
    await expect(alert).toContainText("Shipping — city");
    await expect(page).toHaveURL(/\/checkout$/);
  });
});
