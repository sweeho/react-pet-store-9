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
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const { container } = renderPage();

    // The empty frame carries an explicit empty-state message (not a loading text or only a heading);
    // no failure is reported and nothing offers a retry.
    await waitFor(() =>
      expect(container.textContent ?? "").toMatch(/\b(no|nothing|empty|none|not available)\b/i),
    );
    expect(container.textContent ?? "").not.toMatch(/loading/i);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: /retry|try again/i })).toBeNull();
  });

  // case: SWHR8-C-0140@v1
  it("[SWHR8-C-0140] a load failure renders the shared error frame and retry triggers a new load", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    renderPage();

    // The error frame is announced as an alert with a visible message and a retry control.
    const frame = await screen.findByRole("alert");
    expect(frame.textContent?.trim().length).toBeGreaterThan(0);
    const retry = (await screen.findAllByRole("button", { name: /retry|try again/i }))[0];
    const callsBefore = fetchMock.mock.calls.length;

    await user.click(retry);

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});
