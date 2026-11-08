import { expect, test } from "@playwright/test";

// Primary areas of the application, from the change's design.md "Primary areas".
const PRIMARY_AREAS = [{ name: "Localization", path: "/localization" }];

// Pages opened in turn: the landing page, every primary area, plus an unknown route.
const PAGES = ["/", ...PRIMARY_AREAS.map((a) => a.path), "/no-such-page-acceptance"];

test.describe("site-shell landing and navigation", () => {
  // case: SWHR8-C-0136@v1
  test("[SWHR8-C-0136] root URL shows landing page linking to every primary area", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const main = page.getByRole("main");
    for (const area of PRIMARY_AREAS) {
      const link = main.getByRole("link", { name: new RegExp(area.name, "i") }).first();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", area.path);
    }
  });

  // case: SWHR8-C-0137@v1
  test("[SWHR8-C-0137] global navigation is on every page and links back to the landing page", async ({
    page,
  }) => {
    for (const path of PAGES) {
      await page.goto(path);
      const nav = page.getByRole("navigation").first();
      await expect(nav).toBeVisible();
      for (const area of PRIMARY_AREAS) {
        await expect(nav.getByRole("link", { name: new RegExp(area.name, "i") })).toBeVisible();
      }

      await nav.locator('a[href="/"]').first().click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});
