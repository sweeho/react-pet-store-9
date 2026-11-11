import { expect, test } from "@playwright/test";

/**
 * UI / E2E TEST — landing page and global navigation in a real browser,
 * on desktop and at the 390px mobile width where the nav collapses to a menu.
 */
test.describe("Landing page and navigation", () => {
  test("desktop: landing page links to every primary area", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("companion");
    const nav = page.getByRole("navigation", { name: "Global" });
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /Language/ })).toHaveAttribute(
      "href",
      "/locale",
    );
  });

  test("desktop: Language leads to the localization page inside the shell", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Global" })
      .getByRole("link", { name: "Language" })
      .click();

    await expect(page).toHaveURL(/\/locale$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Choose your language" }),
    ).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("mobile: menu opens, and Home returns to the landing page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/locale");

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByRole("button", { name: "Open main menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("link", { name: "Language" })).toBeVisible();

    await dialog.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("companion");
  });

  test("an unknown path shows not-found inside the shell", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/no-such-page");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("does not exist");
    await page
      .getByRole("navigation", { name: "Global" })
      .getByRole("link", { name: "Home" })
      .click();
    await expect(page).toHaveURL(/\/$/);
  });
});
