import { expect, test, type Page } from "@playwright/test";

// Runs against the seeded catalog (EST-1) and the seeded administrator `jps_admin`. A large order
// is held as PENDING (over the auto-approval limit), so the administrator has one to decide.
async function placeHeldOrder(page: Page): Promise<string> {
  await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 200 } });
  await page.goto("/checkout");
  for (const [label, value] of Object.entries({
    "First name": "Sam",
    "Last name": "Kim",
    "Street address": "2550 Middlefield Road",
    City: "Palo Alto",
    "State or province": "CA",
    "Postal code": "94303",
    Telephone: "650-555-0142",
  })) {
    const inputs = page.getByLabel(label);
    for (let i = 0; i < (await inputs.count()); i++) await inputs.nth(i).fill(value);
  }
  await page.getByLabel("E-mail").first().fill("sam.kim@example.com");
  await page.getByRole("button", { name: /place order/i }).click();
  await expect(page).toHaveURL(/\/checkout\/confirmation$/);
  const text = await page.getByText("Order number", { exact: true }).locator("..").innerText();
  const id = /\d+/.exec(text)?.[0];
  if (!id) throw new Error(`No order number in: ${text}`);
  return id;
}

test.describe("administrator order management", () => {
  test("an administrator signs on, approves a held order and sees it leave the Pending list", async ({
    page,
  }) => {
    const orderId = await placeHeldOrder(page);

    await page.goto("/admin");
    await page.getByLabel("Username").fill("jps_admin");
    await page.getByLabel("Password", { exact: true }).fill("admin");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();
    await page.getByRole("link", { name: /open/i }).click();

    const row = page.locator(`[data-order-id="${orderId}"]`);
    await expect(row).toBeVisible();
    await row.getByLabel("Status", { exact: true }).selectOption("APPROVED");
    await page.getByRole("button", { name: "Commit" }).click();
    await expect(page.getByText(/sent to order processing/i)).toBeVisible();
    await expect(async () => {
      await page.getByRole("button", { name: "Refresh" }).click();
      await expect(row).toHaveCount(0, { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
  });

  test("the sales page totals revenue by category", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("Username").fill("jps_admin");
    await page.getByLabel("Password", { exact: true }).fill("admin");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.goto("/admin/sales");
    await page.getByLabel("Start date").fill("2000-01-01");
    await page.getByLabel("End date").fill("2100-01-01");
    await page.getByRole("button", { name: "Get totals" }).click();
    await expect(page.getByRole("table")).toBeVisible();
  });
});
