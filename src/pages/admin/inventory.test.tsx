import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import InventoryPage from "./inventory";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const items = [
  {
    itemId: "EST-1",
    description: "Large Angelfish",
    productId: "FI-SW-01",
    productName: "Angelfish",
    quantity: 10000,
  },
  {
    itemId: "EST-2",
    description: "Small Angelfish",
    productId: "FI-SW-01",
    productName: "Angelfish",
    quantity: 9996,
  },
];

function stubFetch(admin: unknown) {
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/session") return json({ admin });
    if (url === "/api/admin/inventory" && init?.method === "POST")
      return json({ saved: 1, ignored: 1 });
    if (url === "/api/admin/inventory") return json({ items });
    throw new Error(`unexpected ${url}`);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/admin/inventory"]}>
      <Routes>
        <Route path="/admin/inventory" element={<InventoryPage />} />
        <Route path="/admin/login" element={<p>login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Inventory update page", () => {
  it("sends a signed-out visitor to the administrator sign-in", async () => {
    stubFetch(null);
    renderPage();
    expect(await screen.findByText("login page")).toBeInTheDocument();
  });

  it("[SWHR8-C-0229] refuses a signed-in user without the role and shows no quantity form", async () => {
    stubFetch({ userName: "customer", isAdministrator: false });
    renderPage();
    expect(await screen.findByText("Access denied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  it("[SWHR8-C-0188] lists each item, flags ignored entries, and saves only valid ones", async () => {
    const mock = stubFetch({ userName: "jps_admin", isAdministrator: true });
    const user = userEvent.setup();
    renderPage();

    await user.type(await screen.findByLabelText("New quantity for EST-1"), "10");
    await user.type(screen.getByLabelText("New quantity for EST-2"), "-4");
    expect(screen.getByText("Ignored — enter 0 or more")).toBeInTheDocument();
    expect(screen.getByText("1 item will change")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save quantities" }));
    await waitFor(() => expect(screen.getByText("Quantities saved.")).toBeInTheDocument());
    const post = mock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({
      quantities: { "EST-1": "10", "EST-2": "-4" },
    });
  });

  it("disables saving until an entry would change something, and clears entries", async () => {
    stubFetch({ userName: "jps_admin", isAdministrator: true });
    const user = userEvent.setup();
    renderPage();
    const save = await screen.findByRole("button", { name: "Save quantities" });
    expect(save).toBeDisabled();
    await user.type(screen.getByLabelText("New quantity for EST-1"), "5");
    expect(save).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Clear entries" }));
    expect(save).toBeDisabled();
  });
});
