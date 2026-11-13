import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminLoginPage from "./login";

function renderPage(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status })),
  );
  return render(
    <MemoryRouter initialEntries={["/admin/login?next=/admin/inventory"]}>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/inventory" element={<p>inventory page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Administrator sign-in page", () => {
  it("shows the failed-attempt state and stays on the page when sign-in is refused", async () => {
    const user = userEvent.setup();
    renderPage(401);
    await user.type(screen.getByLabelText("Username"), "jps_admin");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Sign-in failed.")).toBeInTheDocument();
  });

  it("follows `next` after a successful sign-in", async () => {
    const user = userEvent.setup();
    renderPage(200);
    await user.type(screen.getByLabelText("Username"), "jps_admin");
    await user.type(screen.getByLabelText("Password"), "admin");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("inventory page")).toBeInTheDocument();
  });
});
