import { createContext, FC, PropsWithChildren, useContext, useRef, useEffect, useMemo } from "react";

import type { Context } from "./types";

type ContextRef = { current: Context };

const PluginContext = createContext<ContextRef | undefined>(undefined);

/**
 * Ref-based Context Pattern
 *
 * WHY: React Context has "all-or-nothing" notifications - when the context value changes,
 * ALL consumers re-render. With multiple plugins (widgets, story blocks, infobox blocks),
 * this would cause all plugins to re-render whenever any single piece of context data changes
 * (e.g., adding a new story block would re-render ALL plugins).
 *
 * HOW: Instead of passing the context data directly as the Provider value, we pass a stable
 * ref object. The ref object itself never changes, so React never notifies consumers.
 * Consumers access the latest data via ref.current.
 *
 * TRADE-OFF: Components can't automatically re-render when context changes. They must
 * explicitly re-render via other mechanisms (props, local state, etc.) or access fresh
 * data via ref when needed.
 *
 * CRITICAL: This pattern is essential because plugin initialization is expensive
 * (QuickJS runtime + code loading). Without this, plugins would remount unnecessarily.
 */
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
