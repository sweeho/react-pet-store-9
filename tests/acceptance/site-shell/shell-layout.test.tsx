import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

// The shared layout is the route element that wraps every page and renders an <Outlet />.
import SiteLayout from "@/pages/_layout";

describe("site shell layout", () => {
  // case: SWHR8-C-0138@v1
  it("[SWHR8-C-0138] page content renders inside the shared header, navigation and footer", () => {
    const router = createMemoryRouter(
      [
        {
          element: <SiteLayout />,
          children: [{ path: "/any-page", element: <p>Page body marker</p> }],
        },
      ],
      { initialEntries: ["/any-page"] },
    );
    render(<RouterProvider router={router} />);

    const header = screen.getByRole("banner");
    const footer = screen.getByRole("contentinfo");
    const nav = screen.getByRole("navigation");
    const content = screen.getByText("Page body marker");

    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(within(header).queryByText("Page body marker")).toBeNull();
    expect(within(footer).queryByText("Page body marker")).toBeNull();
    // Content sits in the main region, rendered alongside the shared header, navigation and footer.
    expect(screen.getByRole("main")).toContainElement(content);
    expect(nav).toBeInTheDocument();
    const order = header.compareDocumentPosition(content);
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
