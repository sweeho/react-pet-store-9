import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RequireSignOn } from "./require-sign-on";

function mockSession(signedOn: boolean) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ locale: "en_US", signedOn, cartCount: 0 }))),
  );
}

const Where = () => {
  const l = useLocation();
  return <div data-testid="where">{l.pathname + l.search}</div>;
};

function at(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RequireSignOn>
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </RequireSignOn>
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("RequireSignOn", () => {
  it("[SWHR8-C-0061] a signed-out visitor to /account is sent to sign-on, returning to /account", async () => {
    mockSession(false);
    at("/account");
    expect(await screen.findByTestId("where")).toHaveTextContent("/signon?next=%2Faccount");
  });
  it("[SWHR8-C-0057] order information entry requires sign-on first", async () => {
    mockSession(false);
    at("/order");
    expect(await screen.findByTestId("where")).toHaveTextContent("/signon?next=%2Forder");
  });
  it("[SWHR8-C-0058] the profile screen shows sign-on when signed out", async () => {
    mockSession(false);
    at("/account");
    expect(await screen.findByTestId("where")).toHaveTextContent("/signon");
  });
  it("[SWHR8-C-0046] the catalog is public", async () => {
    mockSession(false);
    at("/catalog");
    expect(await screen.findByTestId("where")).toHaveTextContent("/catalog");
  });
  it("[SWHR8-C-0046] a signed-on visitor reaches the account page", async () => {
    mockSession(true);
    at("/account");
    expect(await screen.findByTestId("where")).toHaveTextContent("/account");
  });
});
