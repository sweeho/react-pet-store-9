// Mail request intake and delivery (change swhr8-i-0009, design N1-N3). Red-phase stubs.
const todo = (): never => {
  throw new Error("VortexNotImplemented");
};
export const validateMail = (...args: unknown[]): { valid: boolean } => (args, todo());
export const processMailRequest = async (...args: unknown[]): Promise<void> => (args, todo());
export const sendMail = async (...args: unknown[]): Promise<void> => (args, todo());
