import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import SearchPage from "./search";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

function renderSearch(
  path: string,
  page: unknown = { rows: [], hasNext: false, hasPrevious: false },
) {
  const mock = vi.fn(async () => json(page));
  vi.stubGlobal("fetch", mock);
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>,
  );
  return mock;
}

describe("Search page", () => {
  it("[SWHR8-C-0243] shows matching items with their product and price", async () => {
    const mock = renderSearch("/search?q=fish", {
      rows: [
        {
          id: "EST-1",
          productId: "FI-SW-01",
          description: "Large angelfish",
          productName: "Angelfish",
          categoryId: "FISH",
          listPrice: 16.5,
        },
      ],
      hasNext: true,
      hasPrevious: false,
    });
    expect(await screen.findByTestId("result-row")).toHaveTextContent("Large angelfish");
    expect(screen.getByTestId("result-row")).toHaveTextContent("$16.50");
    expect(mock).toHaveBeenCalledWith("/api/catalog/search?q=fish&start=0");
    // Next keeps the query.
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/search?q=fish&start=2",
    );
  });

  it("[SWHR8-C-0235] a blank query asks the user for words and does not call the API", async () => {
    const mock = renderSearch("/search?q=%20%20");
    expect(await screen.findByTestId("empty-frame")).toHaveTextContent(/one or more words/i);
    expect(mock).not.toHaveBeenCalled();
  });

  it("shows No pets found when nothing matches", async () => {
    renderSearch("/search?q=unicorn");
    expect(await screen.findByText("No pets found")).toBeInTheDocument();
  });

  it("submitting the form searches for the typed words", async () => {
    const user = userEvent.setup();
    const mock = renderSearch("/search?q=fish");
    await screen.findByText("No pets found");
    const box = screen.getByRole("searchbox", { name: "Search the catalog" });
    await user.clear(box);
    await user.type(box, "dog{Enter}");
    expect(mock).toHaveBeenLastCalledWith("/api/catalog/search?q=dog&start=0");
  });
});
