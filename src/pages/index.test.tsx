import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { PRIMARY_AREAS } from "@/constants/primary-areas";

import Home from "./index";

describe("Landing page", () => {
  it("[SWHR8-C-0136] renders the Pet Store heading", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("[SWHR8-C-0136] links to every primary area", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(PRIMARY_AREAS.length).toBeGreaterThan(0);
    for (const area of PRIMARY_AREAS) {
      const link = screen.getByRole("link", { name: new RegExp(area.label, "i") });
      expect(link).toHaveAttribute("href", area.href);
    }
  });
});
