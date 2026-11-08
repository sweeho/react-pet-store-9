import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// The Localization page is the primary area; its data comes from the network.
import LocalizationPage from "@/pages/localization";

// Contract assumed of the shared frames (reused by every page):
//   empty frame -> element with data-testid="empty-frame", containing a visible message
//   error frame -> element with data-testid="error-frame" and role="alert", containing a message
//                  and a button named "Retry" or "Try again"
function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/localization"]}>
      <LocalizationPage />
    </MemoryRouter>,
  );
}

describe("shared state frames", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // case: SWHR8-C-0139@v1
  it("[SWHR8-C-0139] a page with no data renders the shared empty frame", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    renderPage();

    // The shared empty frame itself is rendered, with a message, and no error or retry is offered.
    const frame = await screen.findByTestId("empty-frame");
    expect(frame.textContent?.trim().length).toBeGreaterThan(0);
    expect(screen.queryByTestId("error-frame")).toBeNull();
    expect(screen.queryByRole("button", { name: /retry|try again/i })).toBeNull();
  });

  // case: SWHR8-C-0140@v1
  it("[SWHR8-C-0140] a load failure renders the shared error frame and retry triggers a new load", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    renderPage();

    // The shared error frame is rendered (scoped by its test id, so other alerts such as toasts
    // or route announcers do not matter) with a visible message and a retry control inside it.
    const frame = await screen.findByTestId("error-frame");
    expect(frame.getAttribute("role")).toBe("alert");
    expect(frame.textContent?.trim().length).toBeGreaterThan(0);
    expect(screen.queryByTestId("empty-frame")).toBeNull();
    const retry = within(frame).getByRole("button", { name: /retry|try again/i });
    const callsBefore = fetchMock.mock.calls.length;

    await user.click(retry);

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});
