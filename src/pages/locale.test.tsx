import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import LocalePage from "./locale";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function stubFetch(change: (body: { locale?: string }) => Response) {
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/locales")
      return json([{ code: "en_US" }, { code: "ja_JP" }, { code: "zh_CN" }]);
    if (url === "/api/locale") return change(JSON.parse(String(init?.body)) as { locale?: string });
    throw new Error(`unexpected ${url}`);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/locale"]}>
      <LocalePage />
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Language page", () => {
  it("[SWHR8-C-0022] offers en_US, de_DE, ja_JP and zh_CN with a submit control", async () => {
    stubFetch(() => json({}));
    renderPage();

    const select = await screen.findByLabelText("Language");
    const values = within(select)
      .getAllByRole("option")
      .map((o) => (o as HTMLOptionElement).value);
    expect(values).toEqual(["en_US", "de_DE", "ja_JP", "zh_CN"]);
    expect(screen.getByRole("button", { name: "Change language" })).toBeInTheDocument();
  });

  it("[SWHR8-C-0023] submitting ja_JP posts the choice and the confirmation shows ja_JP", async () => {
    const mock = stubFetch((body) => json({ locale: body.locale }));
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(await screen.findByLabelText("Language"), "ja_JP");
    await user.click(screen.getByRole("button", { name: "Change language" }));

    expect(await screen.findByTestId("session-locale")).toHaveTextContent(/^ja_JP$/);
    const post = mock.mock.calls.find(([url]) => url === "/api/locale");
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ locale: "ja_JP" });
  });

  it("[SWHR8-C-0024] a rejected choice shows an alert and no confirmation", async () => {
    stubFetch(() => json({ message: "Unable to change the language" }, 400));
    const user = userEvent.setup();
    renderPage();

    await screen.findByLabelText("Language");
    await user.click(screen.getByRole("button", { name: "Change language" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/unable to change/i);
    expect(screen.queryByTestId("session-locale")).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Change language" })).toBeEnabled(),
    );
  });

  it("[SWHR8-C-0024] a value set directly on the select is the one submitted", async () => {
    const mock = stubFetch(() => json({ message: "Unable to change the language" }, 400));
    const user = userEvent.setup();
    renderPage();

    const select = (await screen.findByLabelText("Language")) as HTMLSelectElement;
    const bad = document.createElement("option");
    bad.value = "english";
    select.appendChild(bad);
    select.value = "english";
    await user.click(screen.getByRole("button", { name: "Change language" }));

    await screen.findByRole("alert");
    const post = mock.mock.calls.find(([url]) => url === "/api/locale");
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ locale: "english" });
  });
});
