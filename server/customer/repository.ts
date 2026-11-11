/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* red-phase stubs */
const nope = (): never => {
  throw new Error("VortexNotImplemented");
};
export const saveSignOnUser = async (_u: Record<string, unknown>): Promise<void> => nope();
export const getSignOnUser = async (_n: string): Promise<{ userName: string } | undefined> =>
  nope();
export const createCustomer = async (_c: Record<string, unknown>): Promise<void> => nope();
export const getCustomer = async (_n: string): Promise<any> => nope();
export const updateCustomer = async (_n: string, _f: Record<string, unknown>): Promise<void> =>
  nope();
export const removeCustomer = async (_n: string): Promise<void> => nope();
export const saveProfile = async (_p: Record<string, unknown>): Promise<{ id: number }> => nope();
export const getProfile = async (_i: number): Promise<any> => nope();
export const saveAddress = async (_a: Record<string, unknown>): Promise<{ id: number }> => nope();
export const getAddress = async (_i: number): Promise<any> => nope();
export const saveContact = async (_c: Record<string, unknown>): Promise<{ id: number }> => nope();
export const getContact = async (_i: number): Promise<any> => nope();
export const getCreditCard = async (_i: number): Promise<any> => nope();
export const saveAccount = async (_a: Record<string, unknown>): Promise<{ id: number }> => nope();
