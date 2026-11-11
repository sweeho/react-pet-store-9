import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import OrderErrorPage from "./error";

describe("Order Error page", () => {
  it("shows the heading, the empty-cart message and links to the catalog and the cart", () => {
    render(
      <MemoryRouter>
        <OrderErrorPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Order Error" })).toBeInTheDocument();
    expect(screen.getByText("Your shopping cart is empty.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the catalog" })).toHaveAttribute(
      "href",
      "/catalog",
    );
    expect(screen.getByRole("link", { name: "View your cart" })).toHaveAttribute("href", "/cart");
  });
});
