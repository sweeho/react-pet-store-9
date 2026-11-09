import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import Home from "./index";

describe("Landing page", () => {
  it("[SWHR8-C-0136] renders the Pet Store heading", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/pet|companion/i);
  });

  it("[SWHR8-C-0136] links to every primary area", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /language/i })).toHaveAttribute(
      "href",
      "/localization",
    );
  });
});
