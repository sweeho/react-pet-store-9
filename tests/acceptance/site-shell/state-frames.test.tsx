import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// The Localization page is the primary area; its data comes from the network.
import LocalizationPage from "@/pages/localization";

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
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
    );

    renderPage();

    expect(await screen.findByTestId("empty-frame")).toBeInTheDocument();
    expect(screen.queryByTestId("error-frame")).toBeNull();
  });

  // case: SWHR8-C-0140@v1
  it("[SWHR8-C-0140] a load failure renders the shared error frame and retry triggers a new load", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    renderPage();

    const frame = await screen.findByTestId("error-frame");
    expect(frame).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: /retry/i });
    const callsBefore = fetchMock.mock.calls.length;

    await user.click(retry);

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});
