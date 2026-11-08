import { expect, test, type Page } from "@playwright/test";

// Assumed contract (the legacy storefront UI is unspecified; see the change's design.md):
//   Sample users exist: j2ee/j2ee and shopper/shopper (a customer record for shopper, language ja_JP in C-0047).
//   Pages: /signon (labels "User name", "Password", checkbox "Remember my user name", button "Sign on"),
//     /signon/error (heading "Sign-on Error"), /register (labels "User name", "Password", button "Create account"),
//     /account/duplicate (heading "Duplicate Account"), /account (customer profile form, heading "My Account"),
//     /catalog (heading "Catalog"), /order (order information entry, heading "Order Information").
//   Profile form /account: checkboxes "My list" and "Banner", button "Save".
//   API: POST /api/signon {userName,password,remember?} -> 2xx | 4xx; POST /api/signoff;
//     POST /api/cart/items {itemId,quantity?}; GET /api/session -> { signedOn, userName?, locale, cartCount };
//     GET /api/profile -> { language, favoriteCategory, myList, banner }; GET /api/users/:name -> 200 | 404
//     POST /api/test/clock { advanceMinutes } moves the server clock (idle-session cases; no sleeping).
let n = 0;
const fresh = () => `e2e${Date.now().toString(36)}${++n}`;

async function signOn(page: Page, userName: string, password: string) {
  await page.getByLabel("User name").fill(userName);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign on" }).click();
}

async function register(page: Page, userName: string, password: string) {
  await page.goto("/register");
  await page.getByLabel("User name").fill(userName);
  if (password) await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
}

async function signedOn(page: Page, userName = "shopper", password = "shopper") {
  const res = await page.request.post("/api/signon", { data: { userName, password } });
  expect(res.ok()).toBe(true);
}

test.describe("customer account", () => {
  // case: SWHR8-C-0031@v1
  test("[SWHR8-C-0031] a cleared banner checkbox turns the banner preference off", async ({
    page,
  }) => {
    await signedOn(page);
    await page.goto("/account");
    await page.getByLabel("Banner").check();
    await page.getByRole("button", { name: "Save" }).click();
    await page.goto("/account");
    await page.getByLabel("Banner").uncheck();
    await page.getByRole("button", { name: "Save" }).click();
    const profile = await (await page.request.get("/api/profile")).json();
    expect(profile.banner).toBe(false);
  });

  // case: SWHR8-C-0032@v1
  test("[SWHR8-C-0032] registering an existing user name shows the duplicate-account screen", async ({
    page,
  }) => {
    await register(page, "shopper", "whatever");
    await expect(page.getByRole("heading", { name: "Duplicate Account" })).toBeVisible();
    const session = await (await page.request.get("/api/session")).json();
    expect(session.signedOn).toBe(false);
  });

  // case: SWHR8-C-0034@v1
  test("[SWHR8-C-0034] registering after requesting the order page signs on and returns to the order page", async ({
    page,
  }) => {
    await page.goto("/order");
    await expect(page).toHaveURL(/signon/);
    const name = fresh();
    await page.getByRole("link", { name: /register|create/i }).click();
    await page.getByLabel("User name").fill(name);
    await page.getByLabel("Password").fill("pw");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/order/);
    expect((await (await page.request.get("/api/session")).json()).userName).toBe(name);
  });

  // case: SWHR8-C-0037@v1
  test("[SWHR8-C-0037] wrong credentials show the error page and leave the session signed off", async ({
    page,
  }) => {
    await page.goto("/signon");
    await signOn(page, "shopper", "wrong-password");
    await expect(page).toHaveURL(/signon\/error/);
    await expect(page.getByRole("heading", { name: "Sign-on Error" })).toBeVisible();
    expect((await (await page.request.get("/api/session")).json()).signedOn).toBe(false);
  });

  // case: SWHR8-C-0045@v1
  test("[SWHR8-C-0045] registration without a password creates no user; an existing name shows the duplicate screen", async ({
    page,
  }) => {
    const name = fresh();
    await register(page, name, "");
    expect((await page.request.get(`/api/users/${name}`)).status()).toBe(404);
    await register(page, "shopper", "pw");
    await expect(page.getByRole("heading", { name: "Duplicate Account" })).toBeVisible();
  });

  // case: SWHR8-C-0046@v1
  test("[SWHR8-C-0046] the catalog is public while the account page requires sign-on", async ({
    page,
  }) => {
    await page.goto("/catalog");
    await expect(page).toHaveURL(/\/catalog/);
    await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();
    await page.goto("/account");
    await expect(page).toHaveURL(/signon/);
  });

  // case: SWHR8-C-0047@v1
  test("[SWHR8-C-0047] signing off clears the cart and sign-on state but keeps the locale", async ({
    page,
  }) => {
    await signedOn(page);
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    const before = await (await page.request.get("/api/session")).json();
    expect(before.cartCount).toBeGreaterThan(0);
    await page.request.post("/api/signoff");
    const after = await (await page.request.get("/api/session")).json();
    expect(after.signedOn).toBe(false);
    expect(after.cartCount).toBe(0);
    expect(after.locale).toBe(before.locale);
  });

  // case: SWHR8-C-0057@v1
  test("[SWHR8-C-0057] order information entry requires sign-on first", async ({ page }) => {
    await page.goto("/order");
    await expect(page).toHaveURL(/signon/);
    await expect(page.getByRole("button", { name: "Sign on" })).toBeVisible();
  });

  // case: SWHR8-C-0058@v1
  test("[SWHR8-C-0058] the customer profile screen shows the sign-on form when signed out", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page.getByLabel("User name")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign on" })).toBeVisible();
  });

  // case: SWHR8-C-0061@v1
  test("[SWHR8-C-0061] signing on lands on the originally requested page", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/signon/);
    await signOn(page, "shopper", "shopper");
    await expect(page).toHaveURL(/\/account/);
  });

  // case: SWHR8-C-0065@v1
  test("[SWHR8-C-0065] a signed-on session idle for 15 minutes must sign on again", async ({
    page,
  }) => {
    await signedOn(page);
    await page.request.post("/api/test/clock", { data: { advanceMinutes: 15 } });
    await page.goto("/account");
    await expect(page).toHaveURL(/signon/);
    expect((await (await page.request.get("/api/session")).json()).signedOn).toBe(false);
  });
});
