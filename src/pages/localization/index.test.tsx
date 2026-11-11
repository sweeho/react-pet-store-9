import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import LocalizationPage from "./index";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/localization"]}>
      <LocalizationPage />
    </MemoryRouter>,
  );
}

function stubJson(body: unknown) {
  const fetchMock = vi.fn().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Localization page", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("[SWHR8-C-0139] renders the shared empty frame when there are no locales", async () => {
    stubJson([]);
    renderPage();

    const frame = await screen.findByTestId("empty-frame");
    expect(frame.textContent?.trim().length).toBeGreaterThan(0);
    expect(screen.queryByTestId("error-frame")).toBeNull();
  });

  it("[SWHR8-C-0140] renders the shared error frame and retry loads again", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderPage();

    const frame = await screen.findByTestId("error-frame");
    expect(frame).toHaveAttribute("role", "alert");
    const before = fetchMock.mock.calls.length;

    await user.click(within(frame).getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(before));
  });

  it("[SWHR8-C-0140] treats a non-OK response as a failed load", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500 })));
    renderPage();

    expect(await screen.findByTestId("error-frame")).toBeInTheDocument();
  });

  it("renders the Language page at /localization", async () => {
    stubJson([{ code: "en_US" }]);
    renderPage();

    expect(await screen.findByLabelText("Language")).toBeInTheDocument();
    expect(screen.queryByTestId("empty-frame")).toBeNull();
  });
});
