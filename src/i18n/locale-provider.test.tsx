import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider, useScreen } from ".";

function Probe() {
  const { t, locale, sessionLocale } = useScreen();
  return (
    <p>
      {t("nav.home")}|{locale}|{sessionLocale}
    </p>
  );
}

const stubSession = (locale: string) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ locale }), { status: 200 })),
  );

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
  document.documentElement.lang = "";
});

describe("LocaleProvider", () => {
  it("[SWHR8-C-0019] a new session is served in en_US and <html lang> is en_US", async () => {
    stubSession("en_US");
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(await screen.findByText("Home|en_US|en_US")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en_US");
  });

  it("[SWHR8-C-0020] a ja_JP session uses the Japanese screen definition", async () => {
    stubSession("ja_JP");
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(await screen.findByText("ホーム|ja_JP|ja_JP")).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.lang).toBe("ja_JP"));
  });

  it("[SWHR8-C-0012] a locale without screens (de_DE) falls back to en_US screens", async () => {
    stubSession("de_DE");
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(await screen.findByText("Home|en_US|de_DE")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en_US");
  });

  it("[SWHR8-C-0011] the ?locale= parameter overrides the session locale", async () => {
    stubSession("en_US");
    window.history.replaceState(null, "", "/?locale=zh_CN");
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(await screen.findByText("首页|zh_CN|en_US")).toBeInTheDocument();
  });

  it("[SWHR8-C-0019] a failing session request keeps en_US", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );
    expect(await screen.findByText("Home|en_US|en_US")).toBeInTheDocument();
  });
});
