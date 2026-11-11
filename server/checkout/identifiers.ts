// Identifier generation over an injected counter store (change swhr8-i-0007, design O3).

export interface CounterStore {
  get(prefix: string): number | undefined | Promise<number | undefined>;
  set(prefix: string, value: number): void | Promise<void>;
}

const isPromise = <T>(v: unknown): v is Promise<T> =>
  typeof v === "object" && v !== null && typeof (v as { then?: unknown }).then === "function";

/**
 * Reads the stored value (a missing one counts as 0), writes value + 1 and returns the prefix
 * followed by it. A failing store propagates its error and yields no identifier (R-0094/0095/0097).
 * Returns synchronously when the store is synchronous, so a caller can run it inside a transaction.
 */
export function generateIdentifier({
  prefix,
  store,
}: {
  prefix: string;
  store: CounterStore;
}): string | Promise<string> {
  const finish = (current: number | undefined): string | Promise<string> => {
    const next = (current ?? 0) + 1;
    const written = store.set(prefix, next);
    return isPromise<void>(written) ? written.then(() => `${prefix}${next}`) : `${prefix}${next}`;
  };
  const current = store.get(prefix);
  return isPromise<number | undefined>(current) ? current.then(finish) : finish(current);
}
