import { createContext, useContext } from "react";

import type { GlobalThis, Camera, Primitive, OverriddenInfobox } from "@reearth/plugin";

import type { Ref as EngineRef } from "./Engine";

export type { GlobalThis } from "@reearth/plugin";

export type CommonGlobalThis = Omit<GlobalThis, "reearth" | "cesium"> & {
  reearth: Omit<
    GlobalThis["reearth"],
    "visualizer" | "primitives" | "plugin" | "ui" | "on" | "off" | "once"
  > & {
    primitives: Omit<GlobalThis["reearth"]["primitives"], "primitives">;
    visualizer: Omit<GlobalThis["reearth"]["visualizer"], "camera">;
  };
};

export type VisualizerContext = {
  engine?: EngineRef;
  camera?: Camera;
  primitives?: Primitive[];
  selectedPrimitive?: Primitive;
  primitiveSelectionReason?: string;
  primitiveOverridenInfobox?: OverriddenInfobox;
  pluginAPI?: CommonGlobalThis;
};

export const context = createContext<VisualizerContext | undefined>(undefined);
export const { Provider } = context;
export const useVisualizerContext = (): VisualizerContext | undefined => useContext(context);
