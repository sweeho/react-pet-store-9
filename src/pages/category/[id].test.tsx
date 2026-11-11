import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import CategoryPage from "./[id]";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const names = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `P-${i}`, name: `P ${i}` }));

function stubFetch(category: string, total: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url === "/api/session") return json({ locale: "en_US" });
      const m = new RegExp(`^/api/catalog/category/${category}\\?start=(\\d+)`).exec(url);
      if (m) {
        const start = Number(m[1]);
        return json({
          category: { id: category, name: category },
          products: {
            rows: names(total).slice(start, start + 2),
            hasNext: start + 2 < total,
            hasPrevious: start > 0,
          },
        });
      }
      if (url.startsWith("/api/catalog/category/NOPE")) return json({ message: "none" }, 404);
      throw new Error(`unexpected ${url}`);
    }),
  );
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/category/:id" element={<CategoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Category page (product list)", () => {
  it("[SWHR8-C-0242] a 5-product category first shows 2 products with Next and no Previous", async () => {
    stubFetch("DOGS", 5);
    renderAt("/category/DOGS");
    expect(await screen.findAllByTestId("product-row")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "?start=2");
    expect(screen.queryByRole("link", { name: "Previous" })).toBeNull();
  });

  it("[SWHR8-C-0244] the product list page size is 2", async () => {
    stubFetch("CATS", 5);
    renderAt("/category/CATS");
    expect(await screen.findAllByTestId("product-row")).toHaveLength(2);
  });

  it("the second page has Previous and Next", async () => {
    stubFetch("DOGS", 5);
    renderAt("/category/DOGS?start=2");
    expect(await screen.findAllByTestId("product-row")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "?start=0");
    expect(screen.getByRole("link", { name: "Next" })).toBeInTheDocument();
  });

  it("an unknown category shows the empty frame", async () => {
    stubFetch("DOGS", 5);
    renderAt("/category/NOPE");
    expect(await screen.findByTestId("empty-frame")).toBeInTheDocument();
  });
});
