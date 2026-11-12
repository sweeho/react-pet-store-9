// Order-status mail triggers (change swhr8-i-0009, design N4-N6). Red-phase stubs.
const todo = (): never => {
  throw new Error("VortexNotImplemented");
};
export const defaultNotificationSettings = (...args: unknown[]): unknown => (args, todo());
export const notifyOrderEvent = async (...args: unknown[]): Promise<void> => (args, todo());
