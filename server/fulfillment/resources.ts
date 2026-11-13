// Named resource lookup (change swhr8-i-0010, design F11): one error type, optional cache.

export class ResourceLookupError extends Error {
  constructor(name: string, cause: unknown) {
    super(`Cannot look up resource ${name}`, { cause });
    this.name = "ResourceLookupError";
  }
}

export interface ResourceLookup {
  /** A named resource; cached after the first lookup when the lookup was created with `cache`. */
  get<T>(name: string): T;
  /** A configuration entry; always read afresh, never cached. */
  getEntry(name: string): string | undefined;
}

export function createResourceLookup({
  resolve,
  cache,
  readEntry = (name) => process.env[name],
}: {
  resolve: (name: string) => unknown;
  cache: boolean;
  readEntry?: (name: string) => string | undefined;
}): ResourceLookup {
  const cached = new Map<string, unknown>();
  return {
    get<T>(name: string): T {
      if (cache && cached.has(name)) return cached.get(name) as T;
      let resource: unknown;
      try {
        resource = resolve(name);
      } catch (error) {
        throw new ResourceLookupError(name, error);
      }
      if (cache) cached.set(name, resource);
      return resource as T;
    },
    getEntry: (name) => readEntry(name),
  };
}
