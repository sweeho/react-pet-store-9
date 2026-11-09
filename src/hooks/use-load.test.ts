import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useLoad } from "./use-load";

describe("useLoad", () => {
  it("starts loading, then is ready with the data", async () => {
    const { result } = renderHook(() => useLoad(() => Promise.resolve([1, 2])));

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.data).toEqual([1, 2]);
  });

  it("reports an error and loads again on retry", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue("ok");
    const { result } = renderHook(() => useLoad<string>(load));

    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.retry());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.data).toBe("ok");
    expect(load).toHaveBeenCalledTimes(2);
  });
});
