import { defineHandler } from "nitro/h3";

export default defineHandler((): never => {
  throw new Error("VortexNotImplemented");
});
