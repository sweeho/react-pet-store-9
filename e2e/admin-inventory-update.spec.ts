import { expect, test } from "@playwright/test";

test.describe("administrator inventory update", () => {
  test("an administrator signs in, sets a quantity and sees it saved", async ({ page }) => {
    await page.goto("/admin/inventory");
    await expect(page).toHaveURL(/\/admin\/login\?next=/);
    await page.getByLabel("Username").fill("jps_admin");
    await page.getByLabel("Password", { exact: true }).fill("admin");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByRole("heading", { name: "Inventory update" })).toBeVisible();
    const box = page.getByLabel("New quantity for EST-6");
    await box.fill("9998");
    await page.getByRole("button", { name: "Save quantities" }).click();
    await expect(page.getByText("Quantities saved.")).toBeVisible();
    await expect(page.getByLabel("New quantity for EST-6")).toHaveValue("");
  });
});
