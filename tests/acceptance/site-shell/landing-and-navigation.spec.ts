import { expect, test, type Page } from "@playwright/test";

// The primary areas are whatever the global navigation lists besides the landing page link;
// the landing page must link to every one of them.
async function primaryAreaHrefs(page: Page): Promise<string[]> {
  const hrefs = await page
    .getByRole("navigation")
    .first()
    .getByRole("link")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  return hrefs.filter((h) => h.startsWith("/") && h !== "/");
}

test.describe("site-shell landing and navigation", () => {
  // case: SWHR8-C-0136@v1
  test("[SWHR8-C-0136] root URL shows landing page linking to every primary area", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("main").first()).toBeVisible();
    const areas = await primaryAreaHrefs(page);
    expect(areas.length).toBeGreaterThan(0);
    for (const href of areas) {
      await expect(
        page.getByRole("main").first().locator(`a[href="${href}"]`).first(),
      ).toBeVisible();
    }
  });

  // case: SWHR8-C-0137@v1
  test("[SWHR8-C-0137] global navigation is on every page and links back to the landing page", async ({
    page,
  }) => {
    await page.goto("/");
    const areas = await primaryAreaHrefs(page);
    const pages = ["/", ...areas, "/no-such-page-acceptance"];
    for (const path of pages) {
      await page.goto(path);
      const nav = page.getByRole("navigation").first();
      await expect(nav).toBeVisible();

      // Follow the landing-page link: it returns to the root URL.
      await nav.locator('a[href="/"]').first().click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("main").first()).toBeVisible();
    }
  });
});
