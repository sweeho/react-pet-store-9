/** Increments the named counter and returns its new value (design F1). */
export function nextIdentifier(counters: Record<string, number>, kind: string): number {
  const next = (counters[kind] ?? 0) + 1;
  counters[kind] = next;
  return next;
}
