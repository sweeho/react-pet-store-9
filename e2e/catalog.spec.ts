import { expect, test } from "@playwright/test";

// Runs against the seeded legacy catalog (db/seed/catalog.json).
test.describe("catalog", () => {
  test("browse from the landing page down to an item", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Browse the catalog" }).click();
    await expect(page).toHaveURL(/\/catalog$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("catalog");

    await page.goto("/category/FISH");
    await expect(page.getByTestId("product-row")).toHaveCount(2);
    await page
      .getByRole("link", { name: /See items/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/product\//);
    await page
      .getByRole("link", { name: /View item/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/item\//);
    await expect(page.getByTestId("list-price")).toContainText("$");
  });

  test("search finds items matching any word, case-insensitively", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("searchbox", { name: "Search the catalog" }).fill("ANGELFISH");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/search\?q=ANGELFISH/);
    await expect(page.getByTestId("result-row").first()).toBeVisible();
  });
});
