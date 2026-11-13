// Pluggable transition delegates selected by class name (change swhr8-i-0010, design F3, F11).

export class TransitionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "TransitionError";
  }
}

export type TransitionDelegate = (message: unknown) => void | Promise<void>;

/** Runs the delegate registered under `delegateClass`; any failure is reported as a transition error. */
export async function deliverMessage({
  delegateClass,
  registry,
  message,
}: {
  delegateClass: string;
  registry: Record<string, TransitionDelegate>;
  message: unknown;
}): Promise<void> {
  const delegate = Object.hasOwn(registry, delegateClass) ? registry[delegateClass] : undefined;
  if (!delegate) throw new TransitionError(`Transition delegate not found: ${delegateClass}`);
  try {
    await delegate(message);
  } catch (error) {
    throw new TransitionError(
      `Transition error in ${delegateClass}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}
