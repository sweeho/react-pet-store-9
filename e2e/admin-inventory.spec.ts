import { expect, test } from "@playwright/test";

// Assumed UI contract (the legacy inventory page is unspecified; see the change's design.md):
//   /admin/inventory is the inventory update page, reserved to administrators.
//   A signed-in user without the administrator role (here: the "customer" demo account created via the
//   form login at /admin/login) is refused: HTTP 401/403 or a visible "Access denied"/"Forbidden" message,
//   and no quantity form is shown.
test.describe("inventory update access", () => {
  // case: SWHR8-C-0229@v1
  test("[SWHR8-C-0229] a signed-in user without the administrator role is refused the inventory update", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await expect(page.getByLabel("Username")).toBeVisible({ timeout: 5000 });
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("Password", { exact: true }).fill("customer-password");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    // Prove the login worked: a signed-in user is offered a Logout control (assumed contract, as in admin-ui).
    const logout = page
      .getByRole("link", { name: /log ?out/i })
      .or(page.getByRole("button", { name: /log ?out/i }))
      .first();
    await expect(logout).toBeVisible();

    const response = await page.goto("/admin/inventory");
    const refusedByStatus = response !== null && [401, 403].includes(response.status());
    if (!refusedByStatus) {
      await expect(page.getByText(/access denied|forbidden|not authorized/i).first()).toBeVisible();
    }
    // Still signed in (refused for the role, not for being anonymous).
    await expect(
      page
        .getByRole("link", { name: /log ?out/i })
        .or(page.getByRole("button", { name: /log ?out/i }))
        .first(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /update/i })).toHaveCount(0);
  });
});

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
