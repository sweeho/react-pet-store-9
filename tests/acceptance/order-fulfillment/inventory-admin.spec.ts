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
    await page.getByLabel("Username").fill("customer");
    await page.getByLabel("Password", { exact: true }).fill("customer-password");
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    const response = await page.goto("/admin/inventory");
    const refusedByStatus = response !== null && [401, 403].includes(response.status());
    const refusedByPage = await page
      .getByText(/access denied|forbidden|not authorized/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(refusedByStatus || refusedByPage).toBe(true);
    await expect(page.getByRole("button", { name: /update/i })).toHaveCount(0);
  });
});
