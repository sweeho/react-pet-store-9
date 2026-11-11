import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocaleContext } from "@/i18n/locale-context";

import CatalogPage from "./index";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function stubFetch(session: Record<string, unknown> = { locale: "en_US" }) {
  const mock = vi.fn(async (url: string) => {
    if (url === "/api/session") return json(session);
    if (url.startsWith("/api/catalog/categories"))
      return json({
        rows: [
          { id: "BIRDS", name: "Birds", image: "birds_icon.gif" },
          { id: "CATS", name: "Cats", image: "cats_icon.gif" },
        ],
        hasNext: true,
        hasPrevious: false,
      });
    if (url.startsWith("/api/catalog/category/FISH"))
      return json({
        category: { id: "FISH", name: "Fish" },
        products: {
          rows: Array.from({ length: 10 }, (_, i) => ({ id: `F-${i}`, name: `Fish ${i}` })),
          hasNext: false,
          hasPrevious: false,
        },
      });
    throw new Error(`unexpected ${url}`);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

function renderAs(locale: string) {
  return render(
    <LocaleContext.Provider value={{ locale, sessionLocale: locale, setSessionLocale: () => {} }}>
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    </LocaleContext.Provider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Catalog page", () => {
  it("a shopper with no language choice sees the en_US Catalog heading", async () => {
    stubFetch();
    renderAs("en_US");
    expect(await screen.findByRole("heading", { name: /catalog/i })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Birds/ })).toHaveAttribute(
      "href",
      "/category/BIRDS",
    );
  });

  it("a ja_JP shopper sees the Japanese catalog heading", async () => {
    stubFetch();
    renderAs("ja_JP");
    expect(await screen.findByRole("heading", { name: /カタログ/ })).toBeInTheDocument();
  });

  it("shows the dogs banner when the shopper has no favourite category", async () => {
    stubFetch();
    renderAs("en_US");
    expect(await screen.findByTestId("category-banner")).toHaveAttribute("data-category", "DOGS");
  });

  it("shows the MyList sidebar with at most 10 products when the session has a favourite", async () => {
    stubFetch({ locale: "en_US", myList: true, favoriteCategory: "FISH" });
    renderAs("en_US");
    const list = await screen.findByTestId("mylist");
    expect(list.querySelectorAll("li")).toHaveLength(10);
  });

  it("shows no MyList sidebar without a favourite category", async () => {
    stubFetch();
    renderAs("en_US");
    await screen.findByRole("heading", { name: /catalog/i });
    expect(screen.queryByTestId("mylist")).toBeNull();
  });

  it("shows an error frame with Try again when loading fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url === "/api/session" ? json({ locale: "en_US" }) : json({}, 500),
      ),
    );
    renderAs("en_US");
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
