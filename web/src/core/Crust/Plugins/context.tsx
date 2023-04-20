import { createContext, FC, PropsWithChildren, useContext } from "react";

import type { Context } from "./types";

const PluginContext = createContext<Context | undefined>(undefined);

export const PluginProvider: FC<PropsWithChildren<{ value: Context }>> = ({ children, value }) => (
  <PluginContext.Provider value={value}>{children}</PluginContext.Provider>
);

export const usePluginContext = (): Context => {
  const ctx = useContext(PluginContext);
  if (!ctx) {
    throw new Error("Could not found PluginProvider");
  }

  return ctx;
};
