import { expect, test, type Page } from "@playwright/test";

// Assumed UI contract (the legacy rich client is unspecified; see the change's design.md):
//   /admin                      administration entry point; non-administrators get a login form
//   /admin/orders               pending-orders list; each row carries data-order-id and a status
//                               <select> (labelled "Status"), plus "Commit" and "Refresh" buttons
//   GET  /api/admin/orders?status=PENDING   -> { orders: [{ orderId, status, ... }], count }
//   POST /api/admin/update-status           body { orders: [{ orderId, status }] }
//   Logout is a link/button named "Logout" that leads to a logout page.

const pending = ["101", "102", "103"].map((orderId) => ({
  orderId,
  userId: "alice",
  date: "3/10/2026",
  value: 10,
  status: "PENDING",
}));

async function stubOrders(
  page: Page,
): Promise<{ posts: { orders: { orderId: string; status: string }[] }[]; gets: () => number }> {
  const posts: { orders: { orderId: string; status: string }[] }[] = [];
  let gets = 0;
  await page.route("**/api/admin/orders**", async (route) => {
    gets += 1;
    await route.fulfill({ json: { orders: pending, count: pending.length } });
  });
  await page.route("**/api/admin/update-status", async (route) => {
    posts.push(route.request().postDataJSON());
    await route.fulfill({ json: { result: "SUCCESS" } });
  });
  return { posts, gets: () => gets };
}

const statusOf = (page: Page, id: string) =>
  page.locator(`[data-order-id="${id}"]`).getByLabel("Status", { exact: true });

test.describe("admin order management UI", () => {
  // case: SWHR8-C-0252@v1
  test("[SWHR8-C-0252] a non-administrator is refused the admin entry point and offered a login form", async ({
    page,
  }) => {
    await page.goto("/admin");

    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /log ?in|sign ?in/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /manage orders/i })).toHaveCount(0);
  });

  // case: SWHR8-C-0256@v1
  test("[SWHR8-C-0256] choosing logout shows the logout page", async ({ page }) => {
    await stubOrders(page);
    await page.goto("/admin/orders");

    await page
      .getByRole("link", { name: /log ?out/i })
      .or(page.getByRole("button", { name: /log ?out/i }))
      .first()
      .click();

    // The logout control itself must be gone, so it cannot satisfy the text check.
    await expect(page.getByRole("link", { name: /log ?out/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /log ?out/i })).toHaveCount(0);
    await expect(
      page
        .getByRole("heading", { name: /logged out|logout|signed out/i })
        .or(
          page.getByText(
            /you (have|are|were) (been )?(logged|signed) out|logged out|logout (page|complete|successful)/i,
          ),
        )
        .first(),
    ).toBeVisible();
    await expect(page.locator("[data-order-id]")).toHaveCount(0);
  });

  // case: SWHR8-C-0259@v1
  test("[SWHR8-C-0259] refresh with an uncommitted change warns and reloads the lists only on OK", async ({
    page,
  }) => {
    const api = await stubOrders(page);
    await page.goto("/admin/orders");
    await expect(page.locator("[data-order-id]")).toHaveCount(3);
    await statusOf(page, "101").selectOption("APPROVED");

    const messages: string[] = [];
    page.once("dialog", (d) => {
      messages.push(d.type());
      void d.dismiss();
    });
    const loadsBeforeCancel = api.gets();
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect.poll(() => messages.length).toBe(1);
    expect(api.gets()).toBe(loadsBeforeCancel);

    page.once("dialog", (d) => {
      messages.push(d.type());
      void d.accept();
    });
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect.poll(() => api.gets()).toBeGreaterThan(loadsBeforeCancel);
    expect(messages).toEqual(["confirm", "confirm"]);
  });

  // case: SWHR8-C-0260@v1
  test("[SWHR8-C-0260] refresh with no changes reloads the lists without a warning", async ({
    page,
  }) => {
    const api = await stubOrders(page);
    await page.goto("/admin/orders");
    await expect(page.locator("[data-order-id]")).toHaveCount(3);
    let warned = false;
    page.on("dialog", (d) => {
      warned = true;
      void d.dismiss();
    });
    const before = api.gets();

    await page.getByRole("button", { name: "Refresh" }).click();

    await expect.poll(() => api.gets()).toBeGreaterThan(before);
    expect(warned).toBe(false);
  });

  // case: SWHR8-C-0265@v1
  test("[SWHR8-C-0265] committing mixed decisions sends an approved request and a denied request, then reloads", async ({
    page,
  }) => {
    const api = await stubOrders(page);
    await page.goto("/admin/orders");
    await expect(page.locator("[data-order-id]")).toHaveCount(3);
    await statusOf(page, "101").selectOption("APPROVED");
    await statusOf(page, "102").selectOption("APPROVED");
    await statusOf(page, "103").selectOption("DENIED");
    const before = api.gets();

    await page.getByRole("button", { name: "Commit" }).click();

    await expect.poll(() => api.posts.length).toBe(2);
    const byStatus = Object.fromEntries(
      api.posts.map((p) => [p.orders[0].status, p.orders.map((o) => o.orderId).sort()]),
    );
    expect(byStatus).toEqual({ APPROVED: ["101", "102"], DENIED: ["103"] });
    await expect.poll(() => api.gets()).toBeGreaterThan(before);
  });

  // case: SWHR8-C-0266@v1
  test("[SWHR8-C-0266] committing with every order still PENDING sends no status-change request", async ({
    page,
  }) => {
    const api = await stubOrders(page);
    await page.goto("/admin/orders");
    await expect(page.locator("[data-order-id]")).toHaveCount(3);

    await page.getByRole("button", { name: "Commit" }).click();
    await page.waitForLoadState("networkidle");

    expect(api.posts).toHaveLength(0);
  });
});
