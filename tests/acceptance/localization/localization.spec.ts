import { expect, test, type Page } from "@playwright/test";

// Assumed contract (the legacy storefront UI is unspecified; see the change's design.md):
//   Sample user shopper/shopper (POST /api/signon { userName, password }); sign-on keeps the session locale.
//   GET /api/session -> { locale }   the current session locale ("en_US" for a fresh session).
//   Storefront pages (/catalog) render <html lang="{locale}"> and a heading "Catalog" (en_US) or "カタログ" (ja_JP).
//   Profile form /account: select labelled "Preferred language" (en_US, ja_JP, zh_CN), button "Save".
//   Locale selection page /locale: a select labelled "Language" offering en_US, de_DE, ja_JP and zh_CN,
//     a button "Change language"; on success the page shows [data-testid="session-locale"] with the new locale;
//     on failure an element with role "alert" containing "unable to change".
const sessionLocale = async (page: Page) =>
  ((await (await page.request.get("/api/session")).json()) as { locale: string }).locale;

test.describe("localization", () => {
  // case: SWHR8-C-0018@v1
  test("[SWHR8-C-0018] saving a profile with preferred language ja_JP serves later pages in ja_JP", async ({
    page,
  }) => {
    const res = await page.request.post("/api/signon", {
      data: { userName: "shopper", password: "shopper" },
    });
    expect(res.ok()).toBe(true);
    await page.goto("/account");
    await page.getByLabel("Preferred language").selectOption("ja_JP");
    await page.getByRole("button", { name: "Save" }).click();
    await page.goto("/catalog");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja_JP");
    expect(await sessionLocale(page)).toBe("ja_JP");
  });

  // case: SWHR8-C-0019@v1
  test("[SWHR8-C-0019] a shopper who has chosen no language sees the storefront in en_US", async ({
    page,
  }) => {
    await page.goto("/catalog");
    await expect(page.locator("html")).toHaveAttribute("lang", "en_US");
    await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();
  });

  // case: SWHR8-C-0020@v1
  test("[SWHR8-C-0020] a ja_JP shopper gets the Japanese screens", async ({ page }) => {
    await page.goto("/locale");
    await page.getByLabel("Language").selectOption("ja_JP");
    await page.getByRole("button", { name: "Change language" }).click();
    await page.goto("/catalog");
    await expect(page.getByRole("heading", { name: "カタログ" })).toBeVisible();
  });

  // case: SWHR8-C-0022@v1
  test("[SWHR8-C-0022] the locale selection screen offers en_US, de_DE, ja_JP and zh_CN with a submit control", async ({
    page,
  }) => {
    await page.goto("/locale");
    const values = await page
      .getByLabel("Language")
      .locator("option")
      .evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
    expect(values).toEqual(["en_US", "de_DE", "ja_JP", "zh_CN"]);
    await expect(page.getByRole("button", { name: "Change language" })).toBeVisible();
  });

  // case: SWHR8-C-0023@v1
  test("[SWHR8-C-0023] submitting ja_JP changes the session locale and the confirmation shows it", async ({
    page,
  }) => {
    await page.goto("/locale");
    await page.getByLabel("Language").selectOption("ja_JP");
    await page.getByRole("button", { name: "Change language" }).click();
    await expect(page.getByTestId("session-locale")).toHaveText("ja_JP");
    expect(await sessionLocale(page)).toBe("ja_JP");
  });

  // case: SWHR8-C-0024@v1
  test("[SWHR8-C-0024] a choice that cannot be parsed shows an error and leaves the locale unchanged", async ({
    page,
  }) => {
    await page.goto("/locale");
    expect(await sessionLocale(page)).toBe("en_US");
    await page.getByLabel("Language").evaluate((select) => {
      const bad = document.createElement("option");
      bad.value = "english";
      (select as HTMLSelectElement).appendChild(bad);
      (select as HTMLSelectElement).value = "english";
    });
    await page.getByRole("button", { name: "Change language" }).click();
    await expect(page.getByRole("alert")).toContainText(/unable to change/i);
    expect(await sessionLocale(page)).toBe("en_US");
  });
});
