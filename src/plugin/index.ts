import type { globalThis as globalThisType } from "./api";

export * from "./api";
export * from "../util/event";

export type CommonGlobalThis = Omit<GlobalThis, "reearth"> & {
  reearth: Omit<GlobalThis["reearth"], "plugin" | "ui" | "on" | "off" | "once" | "onupdate">;
};

export type GlobalThis = globalThisType;
