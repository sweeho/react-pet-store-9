import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocaleContext } from "@/i18n/locale-context";

import ItemPage from "./[id]";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const ITEM = {
  id: "EST-1",
  productId: "FISH-1",
  description: "Fish",
  listPrice: 16.5,
  unitCost: 12,
  image: "fish.gif",
  productName: "Angelfish",
  categoryId: "FISH",
};

function renderItem(locale: string, item: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url === "/api/catalog/item/EST-1" && item ? json(item) : json({ message: "none" }, 404),
    ),
  );
  return render(
    <LocaleContext.Provider value={{ locale, sessionLocale: locale, setSessionLocale: () => {} }}>
      <MemoryRouter initialEntries={["/item/EST-1"]}>
        <Routes>
          <Route path="/item/:id" element={<ItemPage />} />
        </Routes>
      </MemoryRouter>
    </LocaleContext.Provider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Item page", () => {
  it("[SWHR8-C-0247] shows list price 16.50 and member price 12.00 as currency", async () => {
    renderItem("en_US", ITEM);
    expect(await screen.findByTestId("list-price")).toHaveTextContent("$16.50");
    expect(screen.getByTestId("unit-cost")).toHaveTextContent("$12.00");
  });

  it("formats yen without fraction digits in ja_JP", async () => {
    renderItem("ja_JP", { ...ITEM, listPrice: 1951, unitCost: 1551 });
    expect(await screen.findByTestId("list-price")).toHaveTextContent(/1,951/);
    expect(screen.getByTestId("list-price")).not.toHaveTextContent(/\.00/);
  });

  it("an unknown item shows the empty frame", async () => {
    renderItem("en_US", undefined);
    expect(await screen.findByTestId("empty-frame")).toBeInTheDocument();
  });
});
