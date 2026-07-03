import { createContext, FC, PropsWithChildren, useContext, useRef, useEffect, useMemo } from "react";

import type { Context } from "./types";

type ContextRef = { current: Context };

const PluginContext = createContext<ContextRef | undefined>(undefined);

// Use a ref-based context to prevent rerenders when context value changes
// The context value (the ref) stays the same, only ref.current is updated
export const PluginProvider: FC<PropsWithChildren<{ value: Context }>> = ({
  children,
  value
}) => {
  const contextRef = useRef<Context>(value);

  // Update ref on every render without changing the ref object itself
  useEffect(() => {
    contextRef.current = value;
  });

  // Create stable context value (the ref object itself never changes)
  const stableValue = useMemo(() => contextRef, []);

  return <PluginContext.Provider value={stableValue}>{children}</PluginContext.Provider>;
};

PluginProvider.displayName = "PluginProvider";

export const usePluginContext = (): Context => {
  const ctxRef = useContext(PluginContext);
  if (!ctxRef) {
    throw new Error("Could not find PluginProvider");
  }

  return ctxRef.current;
};
