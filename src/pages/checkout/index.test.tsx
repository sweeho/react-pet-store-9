import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import CheckoutPage from "./index";

const profile = {
  lastName: "Profile",
  firstName: "Sam",
  address1: "1 Main St",
  address2: "",
  city: "Shelbyville",
  state: "CA",
  postalCode: "94000",
  phone: "555-0100",
  email: "sam@example.com",
};
const cart = {
  items: [
    {
      itemId: "EST-1",
      productId: "FI-SW-01",
      categoryId: "FISH",
      productName: "Angelfish",
      attribute: "Large Angelfish",
      quantity: 2,
      listPrice: 16.5,
      lineTotal: 33,
    },
  ],
  total: 33,
  count: 2,
};

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

function mockFetch(opts: { signedOut?: boolean; checkout?: () => Promise<Response> } = {}) {
  const fn = vi.fn((url: string, init?: RequestInit) => {
    if (url === "/api/account/profile") {
      return opts.signedOut ? json({}, 401) : json(profile);
    }
    if (url === "/api/cart") return json(cart);
    if (url === "/api/checkout" && init?.method === "POST") {
      return opts.checkout
        ? opts.checkout()
        : json({ orderNumber: 1001, email: "sam@example.com" });
    }
    return json({}, 404);
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/error" element={<p>routed to error</p>} />
        <Route path="/checkout/confirmation" element={<p>routed to confirmation</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("checkout page", () => {
  it("[SWHR8-C-0185] pre-fills billing and shipping from the saved profile", async () => {
    mockFetch();
    renderPage();
    await waitFor(() => expect(screen.getAllByLabelText("Last name")).toHaveLength(2));
    await waitFor(() =>
      screen.getAllByLabelText("Last name").forEach((el) => expect(el).toHaveValue("Profile")),
    );
    screen.getAllByLabelText("First name").forEach((el) => expect(el).toHaveValue("Sam"));
    screen.getAllByLabelText("City").forEach((el) => expect(el).toHaveValue("Shelbyville"));
    expect(screen.getByText(/1234-2334/)).toBeInTheDocument();
    expect(screen.getByText("Large Angelfish")).toBeInTheDocument();
  });

  it("[SWHR8-C-0185] starts empty when signed out", async () => {
    mockFetch({ signedOut: true });
    renderPage();
    await waitFor(() => expect(screen.getAllByLabelText("Last name")).toHaveLength(2));
    screen.getAllByLabelText("Last name").forEach((el) => expect(el).toHaveValue(""));
  });

  it("[SWHR8-C-0077] an empty-cart answer (409) routes to the Order Error page", async () => {
    mockFetch({ checkout: () => json({ error: "EMPTY_CART" }, 409) });
    renderPage();
    await waitFor(() => expect(screen.getAllByLabelText("Last name")[0]).toHaveValue("Profile"));
    await userEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(await screen.findByText("routed to error")).toBeInTheDocument();
  });

  it("[SWHR8-C-0182] a 400 shows the missing-fields summary and keeps the form", async () => {
    mockFetch({ checkout: () => json({ missing: ["shipping.city", "billing.postalCode"] }, 400) });
    renderPage();
    await waitFor(() => expect(screen.getAllByLabelText("Last name")[0]).toHaveValue("Profile"));
    await userEvent.click(screen.getByRole("button", { name: /place order/i }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/not placed/i);
    expect(alert).toHaveTextContent("Shipping — city");
    expect(alert).toHaveTextContent("Billing — postal code");
  });

  it("[SWHR8-C-0181] a 200 routes to the confirmation page", async () => {
    mockFetch();
    renderPage();
    await waitFor(() => expect(screen.getAllByLabelText("Last name")[0]).toHaveValue("Profile"));
    await userEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(await screen.findByText("routed to confirmation")).toBeInTheDocument();
  });
});
