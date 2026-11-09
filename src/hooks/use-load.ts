import { useCallback, useEffect, useState } from "react";

export type LoadStatus = "loading" | "ready" | "error";

export interface LoadState<T> {
  status: LoadStatus;
  data: T | undefined;
  retry: () => void;
}

interface Result<T> {
  attempt: number;
  status: "ready" | "error";
  data: T | undefined;
}

/**
 * Runs `load` on mount and again on every `retry()`. Pages pick the shared
 * loading, error or empty frame from `status` and `data`.
 */
export function useLoad<T>(load: () => Promise<T>): LoadState<T> {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setResult({ attempt, status: "ready", data });
      },
      () => {
        if (!cancelled) setResult({ attempt, status: "error", data: undefined });
      },
    );
    return () => {
      cancelled = true;
    };
    // `load` is intentionally not a dependency: pages pass an inline function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // A result from an earlier attempt means the current attempt is still loading.
  if (!result || result.attempt !== attempt) {
    return { status: "loading", data: undefined, retry };
  }
  return { status: result.status, data: result.data, retry };
}
