// The web module availability check (design I7).
import { EXIT_ERROR, EXIT_OK } from "./batch-types";

export async function runHealthCheck(input: {
  modules: Record<string, string>;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  timeoutMs?: number;
}): Promise<{ exitCode: number; down: string[]; log: string[] }> {
  const { modules, timeoutMs = 20_000 } = input;
  const results = await Promise.all(
    Object.entries(modules).map(async ([name, url]) => {
      try {
        const res = await input.fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
        return res.status === 200 ? { name, reason: null } : { name, reason: `HTTP ${res.status}` };
      } catch (error) {
        return { name, reason: error instanceof Error ? error.message : String(error) };
      }
    }),
  );
  const down = results.filter((r) => r.reason !== null).map((r) => r.name);
  const log = results.map((r) =>
    r.reason === null ? `${r.name} UP` : `${r.name} DOWN ${r.reason}`,
  );
  return { exitCode: down.length > 0 ? EXIT_ERROR : EXIT_OK, down, log };
}
