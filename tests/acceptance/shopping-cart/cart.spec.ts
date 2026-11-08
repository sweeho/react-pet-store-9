import { expect, test } from "@playwright/test";

// Assumed contract (the legacy storefront UI is unspecified; see the change's design.md):
//   POST /api/cart/items   { itemId, quantity? }   adds to the session cart (no sign-on needed) -> 2xx
//   POST /api/cart/update  { quantities: { [itemId]: string|number } }  applies all; non-whole -> 0; <=0 removes
//   GET  /api/cart         -> { items: [{ itemId, quantity, listPrice }], total }
//   POST /api/checkout     { billing, shipping }   -> 200 | 4xx with { error } mentioning the empty cart
//   /cart page: empty message "Your Shopping Cart is Empty."; otherwise per item a "Remove" link,
//     a quantity input (accessible name "Quantity <itemId>"), the unit price, a "Total" in US dollars
//     and an "Update" button submitting all quantities.
//   /checkout page: the form of order-checkout (billing + shipping fields, labelled as there) with a
//     submit button named /submit|place order|confirm/i; submitting with an empty cart lands on
//   /checkout/error page (that empty-cart submit lands here) shows "Order Error" and the word "empty".
const party = {
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  phone: "555-0100",
  email: "jane@example.com",
};

test.describe("shopping cart", () => {
  // case: SWHR8-C-0074@v1
  test('[SWHR8-C-0074] entering "abc" as a quantity removes the item', async ({ page }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    await page.goto("/cart");
    await page.getByLabel("Quantity EST-1", { exact: true }).fill("abc");
    await page.getByRole("button", { name: "Update", exact: true }).click();
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
    const cart = await (await page.request.get("/api/cart")).json();
    expect(cart.items).toHaveLength(0);
  });

  // case: SWHR8-C-0075@v1
  test("[SWHR8-C-0075] an empty cart page shows the empty message", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText("Your Shopping Cart is Empty.")).toBeVisible();
  });

  // case: SWHR8-C-0076@v1
  test("[SWHR8-C-0076] the cart page lists items with remove link, quantity, unit price and USD total", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 2 } });
    await page.request.post("/api/cart/items", { data: { itemId: "EST-6", quantity: 1 } });
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: "Remove", exact: true })).toHaveCount(2);
    await expect(page.getByLabel("Quantity EST-1", { exact: true })).toHaveValue("2");
    await expect(page.getByLabel("Quantity EST-6", { exact: true })).toHaveValue("1");
    const usd = (n: number) =>
      `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const cart = await (await page.request.get("/api/cart")).json();
    // Each item's unit price must sit in that item's own row (the row holding its quantity input).
    for (const item of cart.items as { itemId: string; listPrice: number }[]) {
      const row = page
        .locator("tr, li, [role=row]")
        .filter({ has: page.getByLabel(`Quantity ${item.itemId}`, { exact: true }) })
        .last();
      await expect(row).toContainText(item.itemId);
      await expect(row).toContainText(usd(Number(item.listPrice)));
      await expect(row.getByRole("link", { name: "Remove", exact: true })).toHaveCount(1);
    }
    // The total sits in the element labelled "Total", which is not an item row.
    const totalRow = page
      .locator("tr, li, [role=row], div, p, span")
      .filter({ hasText: /^\s*Total\b/ })
      .filter({ hasNot: page.locator("input") })
      .last();
    await expect(totalRow).toContainText(usd(Number(cart.total)));
  });

  // case: SWHR8-C-0077@v1
  test("[SWHR8-C-0077] a second identical checkout is rejected as an empty cart", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 1 } });
    const first = await page.request.post("/api/checkout", {
      data: { billing: party, shipping: party },
    });
    expect(first.ok()).toBe(true);
    const second = await page.request.post("/api/checkout", {
      data: { billing: party, shipping: party },
    });
    expect(second.ok()).toBe(false);
    expect(JSON.stringify(await second.json()).toLowerCase()).toContain("empty");
  });

  // case: SWHR8-C-0077@v1
  test("[SWHR8-C-0077] submitting the checkout form with an empty cart shows the error page", async ({
    page,
  }) => {
    await page.goto("/checkout");
    for (const [label, value] of [
      ["Last name", party.lastName],
      ["First name", party.firstName],
      ["Address line 1", party.address1],
      ["City", party.city],
      ["State", party.state],
      ["Postal code", party.postalCode],
      ["Telephone", party.phone],
      ["E-mail", party.email],
    ]) {
      // Exact match: 'State' must not hit other labels containing "state". Billing then shipping.
      const fields = page.getByLabel(label, { exact: true });
      await expect(fields).toHaveCount(2);
      for (const i of [0, 1]) await fields.nth(i).fill(value);
    }
    // Scope to the one form holding the billing fields so only its own submit button can match.
    const form = page
      .locator("form")
      .filter({ has: page.getByLabel("Last name", { exact: true }) });
    await form
      .getByRole("button", { name: /submit|place order|confirm/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/checkout\/error/);
    await expect(page.getByText("Order Error").first()).toBeVisible();
    await expect(page.getByText(/empty/i).first()).toBeVisible();
  });

  // case: SWHR8-C-0078@v1
  test("[SWHR8-C-0078] an anonymous shopper can add an item to the cart", async ({ request }) => {
    const res = await request.post("/api/cart/items", { data: { itemId: "EST-1" } });
    expect(res.ok()).toBe(true);
    const cart = await (await request.get("/api/cart")).json();
    expect(cart.items.map((i: { itemId: string }) => i.itemId)).toContain("EST-1");
  });

  // case: SWHR8-C-0083@v1
  test("[SWHR8-C-0083] the cart form applies several quantity changes at once", async ({
    page,
  }) => {
    await page.request.post("/api/cart/items", { data: { itemId: "EST-1", quantity: 1 } });
    await page.request.post("/api/cart/items", { data: { itemId: "EST-6", quantity: 1 } });
    await page.goto("/cart");
    await page.getByLabel("Quantity EST-1", { exact: true }).fill("3");
    await page.getByLabel("Quantity EST-6", { exact: true }).fill("5");
    await page.getByRole("button", { name: "Update", exact: true }).click();
    // Wait for the update to be applied: poll the cart until it reflects the new quantities.
    await expect
      .poll(async () => {
        const cart = await (await page.request.get("/api/cart")).json();
        return Object.fromEntries(
          cart.items.map((i: { itemId: string; quantity: number }) => [i.itemId, i.quantity]),
        );
      })
      .toEqual({ "EST-1": 3, "EST-6": 5 });
  });
});
