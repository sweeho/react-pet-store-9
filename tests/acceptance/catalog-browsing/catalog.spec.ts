import { expect, test } from "@playwright/test";

// Assumed contract (the legacy storefront UI is unspecified; see the change's design.md):
//   POST /api/test/seed { categories, products, items } replaces the catalog with the given rows
//     (category { id, name, locale }, product { id, categoryId, name, locale },
//      item { id, productId, description, locale, listPrice, unitCost, image }).
//   Pages: /category/:id (product list), /item/:id (item page).
//   Product list: rows are [data-testid="product-row"]; navigation links named "Next" and "Previous".
//   Item page: [data-testid="list-price"] and [data-testid="unit-cost"] show currency text.
//   Sidebar: [data-testid="mylist"] contains one <li> per favourite-category product.
//   Sample user shopper/shopper (POST /api/signon) with favourite category FISH and MyList enabled.
const products = (categoryId: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${categoryId}-${i + 1}`,
    categoryId,
    name: `${categoryId} product ${i + 1}`,
    locale: "en_US",
  }));

async function seed(
  page: import("@playwright/test").Page,
  data: { categories?: unknown[]; products?: unknown[]; items?: unknown[] },
) {
  const res = await page.request.post("/api/test/seed", {
    data: { categories: [], products: [], items: [], ...data },
  });
  expect(res.ok()).toBe(true);
}

test.describe("catalog browsing", () => {
  // case: SWHR8-C-0233@v1
  test("[SWHR8-C-0233] the MyList sidebar shows at most 10 products of the favourite category", async ({
    page,
  }) => {
    await seed(page, {
      categories: [{ id: "FISH", name: "Fish", locale: "en_US" }],
      products: products("FISH", 12),
    });
    const res = await page.request.post("/api/signon", {
      data: { userName: "shopper", password: "shopper" },
    });
    expect(res.ok()).toBe(true);
    await page.goto("/catalog");
    await expect(page.getByTestId("mylist").getByRole("listitem")).toHaveCount(10);
  });

  // case: SWHR8-C-0242@v1
  test("[SWHR8-C-0242] a 5-product category first shows 2 products with Next and no Previous", async ({
    page,
  }) => {
    await seed(page, {
      categories: [{ id: "DOGS", name: "Dogs", locale: "en_US" }],
      products: products("DOGS", 5),
    });
    await page.goto("/category/DOGS");
    await expect(page.getByTestId("product-row")).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Next" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous" })).toHaveCount(0);
  });

  // case: SWHR8-C-0244@v1
  test("[SWHR8-C-0244] the product list page size is 2", async ({ page }) => {
    await seed(page, {
      categories: [{ id: "CATS", name: "Cats", locale: "en_US" }],
      products: products("CATS", 5),
    });
    await page.goto("/category/CATS");
    await expect(page.getByTestId("product-row")).toHaveCount(2);
  });

  // case: SWHR8-C-0247@v1
  test("[SWHR8-C-0247] the item page shows list price 16.50 and unit cost 12.00 as currency", async ({
    page,
  }) => {
    await seed(page, {
      categories: [{ id: "FISH", name: "Fish", locale: "en_US" }],
      products: products("FISH", 1),
      items: [
        {
          id: "EST-1",
          productId: "FISH-1",
          description: "Fish",
          locale: "en_US",
          listPrice: 16.5,
          unitCost: 12,
          image: "fish.gif",
        },
      ],
    });
    await page.goto("/item/EST-1");
    await expect(page.getByTestId("list-price")).toContainText("$16.50");
    await expect(page.getByTestId("unit-cost")).toContainText("$12.00");
  });
});
