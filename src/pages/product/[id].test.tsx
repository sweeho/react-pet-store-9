import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import ProductPage from "./[id]";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

function renderProduct(response: Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => response),
  );
  return render(
    <MemoryRouter initialEntries={["/product/FI-SW-01"]}>
      <Routes>
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Product page (item list)", () => {
  it("lists the items with formatted list prices and links to each item", async () => {
    renderProduct(
      json({
        product: {
          id: "FI-SW-01",
          categoryId: "FISH",
          name: "Angelfish",
          description: "Salt water",
        },
        items: {
          rows: [{ id: "EST-1", productId: "FI-SW-01", description: "Large", listPrice: 16.5 }],
          hasNext: false,
          hasPrevious: false,
        },
      }),
    );
    expect(await screen.findByRole("heading", { name: "Angelfish" })).toBeInTheDocument();
    expect(screen.getByText("$16.50")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View item/ })).toHaveAttribute("href", "/item/EST-1");
  });

  it("shows the empty frame for an unknown product", async () => {
    renderProduct(json({}, 404));
    expect(await screen.findByTestId("empty-frame")).toBeInTheDocument();
  });
});
