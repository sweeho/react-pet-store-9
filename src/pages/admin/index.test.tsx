import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminIndexPage from "./index";

afterEach(() => vi.unstubAllGlobals());

function renderPage(admin: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ admin })),
  );
  return render(
    <MemoryRouter>
      <AdminIndexPage />
    </MemoryRouter>,
  );
}

describe("Administration launcher", () => {
  // case: SWHR8-C-0252@v1
  it("[SWHR8-C-0252] a visitor who is not an administrator gets a login form and no Manage orders", async () => {
    renderPage(null);
    expect(await screen.findByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in|log in/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /manage orders/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /manage orders/i })).toBeNull();
  });

  it("an administrator sees Manage orders and Log out", async () => {
    renderPage({ userName: "jps_admin", isAdministrator: true });
    expect(await screen.findByRole("link", { name: /manage orders|open/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });
});
