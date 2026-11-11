import { expect, test, type Page } from "@playwright/test";

const sessionLocale = async (page: Page) =>
  ((await (await page.request.get("/api/session")).json()) as { locale: string }).locale;

test.describe("Language page", () => {
  test("[SWHR8-C-0010] a new session is en_US and the page says so", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en_US");
    expect(await sessionLocale(page)).toBe("en_US");
  });

  test("[SWHR8-C-0022] offers en_US, de_DE, ja_JP and zh_CN with a submit control", async ({
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

  test("[SWHR8-C-0023] submitting ja_JP changes the session and localises the shell", async ({
    page,
  }) => {
    await page.goto("/locale");
    await page.getByLabel("Language").selectOption("ja_JP");
    await page.getByRole("button", { name: "Change language" }).click();
    await expect(page.getByTestId("session-locale")).toHaveText("ja_JP");
    expect(await sessionLocale(page)).toBe("ja_JP");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja_JP");

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("新しい家族");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja_JP");
  });

  test("[SWHR8-C-0012] de_DE is accepted and shows the en_US screens", async ({ page }) => {
    await page.goto("/locale");
    await page.getByLabel("Language").selectOption("de_DE");
    await page.getByRole("button", { name: "Change language" }).click();
    await expect(page.getByTestId("session-locale")).toHaveText("de_DE");
    await expect(page.locator("html")).toHaveAttribute("lang", "en_US");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Language changed");
  });

  test("[SWHR8-C-0024] an unparseable choice shows an error and leaves the locale unchanged", async ({
    page,
  }) => {
    await page.goto("/locale");
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

  test("[SWHR8-C-0011] the ?locale= parameter overrides the session for that page", async ({
    page,
  }) => {
    await page.goto("/?locale=ja_JP");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja_JP");
    expect(await sessionLocale(page)).toBe("en_US");
  });
});
