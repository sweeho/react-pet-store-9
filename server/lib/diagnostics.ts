// Diagnostic output helper (design I9): emits nothing unless the debugging switch is on.
export interface Diagnostics {
  print(message: string): void;
  println(message: string): void;
  exception(error: Error, message?: string): void;
}

/** The debugging switch of the delivered build; off (SD7). */
export const DEBUGGING_ON = false;

export function createDiagnostics(opts: {
  enabled: boolean;
  write: (chunk: string) => void;
}): Diagnostics {
  const { enabled, write } = opts;
  return {
    print: (message) => {
      if (enabled) write(message);
    },
    println: (message) => {
      if (enabled) write(`${message}\n`);
    },
    exception: (error, message) => {
      if (!enabled) return;
      write(`${error.message}\n`);
      if (message !== undefined) write(`${message}\n`);
      write(`${error.stack ?? ""}\n`);
    },
  };
}

export const diagnostics = createDiagnostics({
  enabled: DEBUGGING_ON,
  write: (chunk) => void process.stderr.write(chunk),
});
