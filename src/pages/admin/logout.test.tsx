import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import AdminLogoutPage from "./logout";

describe("Administrator logged-out page", () => {
  // case: SWHR8-C-0256@v1
  it("[SWHR8-C-0256] shows 'You have logged out' and no logout control", () => {
    render(
      <MemoryRouter>
        <AdminLogoutPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /logged out/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /log ?out/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /log ?out/i })).toBeNull();
  });
});
