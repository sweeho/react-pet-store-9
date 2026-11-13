// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import {
  createResourceLookup,
  ResourceLookupError,
} from "../../../../server/fulfillment/resources";

describe("resource lookup", () => {
  it("wraps every resolve failure in one error type", () => {
    const lookup = createResourceLookup({
      resolve: () => {
        throw new Error("boom");
      },
      cache: false,
    });
    expect(() => lookup.get("jms/queue")).toThrow(ResourceLookupError);
  });

  it("caches a resolved resource on the web tier but not without the cache", () => {
    const resolve = vi.fn(() => ({}));
    const cached = createResourceLookup({ resolve, cache: true });
    expect(cached.get("a")).toBe(cached.get("a"));
    expect(resolve).toHaveBeenCalledTimes(1);
    const resolveB = vi.fn(() => ({}));
    const plain = createResourceLookup({ resolve: resolveB, cache: false });
    plain.get("a");
    plain.get("a");
    expect(resolveB).toHaveBeenCalledTimes(2);
  });

  it("never caches configuration entries", () => {
    let value = "one";
    const lookup = createResourceLookup({
      resolve: () => ({}),
      cache: true,
      readEntry: () => value,
    });
    expect(lookup.getEntry("SEND")).toBe("one");
    value = "two";
    expect(lookup.getEntry("SEND")).toBe("two");
  });
});
