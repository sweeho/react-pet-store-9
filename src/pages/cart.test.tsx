import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import CartPage from "./cart";

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const line = (itemId: string, quantity: number, listPrice: number) => ({
  itemId,
  productId: "P-" + itemId,
  categoryId: "FISH",
  productName: "Product " + itemId,
  attribute: "Large",
  quantity,
  listPrice,
  lineTotal: quantity * listPrice,
});

function renderCart(cart: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => json(cart)),
  );
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Cart page", () => {
  it("[SWHR8-C-0075] an empty cart shows the empty message", async () => {
    renderCart({ items: [], total: 0, count: 0 });
    expect(await screen.findByText("Your Shopping Cart is Empty.")).toBeInTheDocument();
  });

  it("[SWHR8-C-0076] lists each item with Remove, quantity, unit price and a USD total", async () => {
    renderCart({ items: [line("EST-1", 2, 16.5), line("EST-6", 1, 18.5)], total: 51.5, count: 2 });
    expect(await screen.findByLabelText("Quantity EST-1")).toHaveValue("2");
    expect(screen.getByLabelText("Quantity EST-6")).toHaveValue("1");
    expect(screen.getAllByRole("link", { name: "Remove" })).toHaveLength(2);
    const row = screen.getByLabelText("Quantity EST-1").closest("tr") as HTMLElement;
    expect(within(row).getByText("$16.50")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(screen.getByText("$51.50")).toBeInTheDocument();
  });
});
