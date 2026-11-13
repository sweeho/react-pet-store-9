import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminOrdersPage from "./orders";

const pending = ["101", "102", "103"].map((orderId) => ({
  orderId,
  userId: "alice",
  date: "3/10/2026",
  value: 10,
  status: "PENDING",
}));

function setup() {
  const posts: { orders: { orderId: string; status: string }[] }[] = [];
  const gets: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith("/api/admin/orders")) {
        gets.push(url);
        return Response.json({ orders: pending, count: 3 });
      }
      if (url === "/api/admin/update-status") {
        posts.push(JSON.parse(String(init?.body)));
        return Response.json({ result: "SUCCESS" });
      }
      return Response.json({});
    }),
  );
  render(
    <MemoryRouter initialEntries={["/admin/orders"]}>
      <Routes>
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/logout" element={<h1>You have logged out</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  return { posts, gets };
}

const row = (id: string) => document.querySelector(`[data-order-id="${id}"]`) as HTMLElement;
const decide = async (id: string, value: string) =>
  userEvent.selectOptions(within(row(id)).getByLabelText("Status", { exact: true }), value);
const loaded = () => waitFor(() => expect(document.querySelectorAll("[data-order-id]")).toHaveLength(3));

afterEach(() => vi.unstubAllGlobals());

describe("Manage orders page", () => {
  // case: SWHR8-C-0256@v1
  it("[SWHR8-C-0256] the Logout control leads to the logged-out page", async () => {
    setup();
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: /log ?out/i }));
    expect(await screen.findByRole("heading", { name: /logged out/i })).toBeInTheDocument();
  });

  // case: SWHR8-C-0259@v1
  it("[SWHR8-C-0259] Refresh with an unsaved change warns and reloads only on OK", async () => {
    const api = setup();
    await loaded();
    await decide("101", "APPROVED");
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    const before = api.gets.length;
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(api.gets.length).toBe(before);
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(api.gets.length).toBeGreaterThan(before));
    confirm.mockRestore();
  });

  // case: SWHR8-C-0260@v1
  it("[SWHR8-C-0260] Refresh with no changes reloads without a warning", async () => {
    const api = setup();
    await loaded();
    const confirm = vi.spyOn(window, "confirm");
    const before = api.gets.length;
    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(api.gets.length).toBeGreaterThan(before));
    expect(confirm).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  // case: SWHR8-C-0265@v1
  it("[SWHR8-C-0265] Commit sends the approved set and the denied set, then reloads", async () => {
    const api = setup();
    await loaded();
    await decide("101", "APPROVED");
    await decide("102", "APPROVED");
    await decide("103", "DENIED");
    const before = api.gets.length;
    await userEvent.click(screen.getByRole("button", { name: "Commit" }));
    await waitFor(() => expect(api.posts).toHaveLength(2));
    const byStatus = Object.fromEntries(
      api.posts.map((p) => [p.orders[0].status, p.orders.map((o) => o.orderId).sort()]),
    );
    expect(byStatus).toEqual({ APPROVED: ["101", "102"], DENIED: ["103"] });
    await waitFor(() => expect(api.gets.length).toBeGreaterThan(before));
  });

  // case: SWHR8-C-0266@v1
  it("[SWHR8-C-0266] Commit with nothing changed sends no request", async () => {
    const api = setup();
    await loaded();
    await userEvent.click(screen.getByRole("button", { name: "Commit" }));
    expect(api.posts).toHaveLength(0);
  });
});
