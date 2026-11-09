import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import SiteLayout from "./_layout";

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <SiteLayout />,
        children: [
          { path: "/", element: <p>Landing marker</p> },
          { path: "/any-page", element: <p>Page body marker</p> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe("SiteLayout", () => {
  it("[SWHR8-C-0138] renders page content between the header and footer landmarks", () => {
    renderAt("/any-page");

    const header = screen.getByRole("banner");
    const footer = screen.getByRole("contentinfo");
    const main = screen.getByRole("main");

    expect(within(main).getByText("Page body marker")).toBeInTheDocument();
    expect(within(header).queryByText("Page body marker")).toBeNull();
    expect(within(footer).queryByText("Page body marker")).toBeNull();
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
  });

  it("[SWHR8-C-0137] global navigation has a Home link that returns to the landing page", async () => {
    const user = userEvent.setup();
    renderAt("/any-page");

    const nav = screen.getAllByRole("navigation")[0];
    const home = nav.querySelector('a[href="/"]');
    expect(home).not.toBeNull();

    await user.click(home as HTMLElement);

    expect(await screen.findByText("Landing marker")).toBeInTheDocument();
  });

  it("[SWHR8-C-0137] the global navigation lists the Language area", () => {
    renderAt("/any-page");

    const nav = screen.getAllByRole("navigation")[0];
    expect(within(nav).getByRole("link", { name: /language/i })).toHaveAttribute(
      "href",
      "/localization",
    );
  });

  it("opens and closes the mobile menu", async () => {
    const user = userEvent.setup();
    renderAt("/any-page");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open main menu" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("link", { name: /language/i })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
