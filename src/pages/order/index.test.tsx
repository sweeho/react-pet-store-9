import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import OrderGatePage from "./index";

describe("order gate", () => {
  it("[SWHR8-C-0181] replaces itself with /checkout", async () => {
    render(
      <MemoryRouter initialEntries={["/order"]}>
        <Routes>
          <Route path="/order" element={<OrderGatePage />} />
          <Route path="/checkout" element={<p>checkout form</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("checkout form")).toBeInTheDocument();
  });
});
