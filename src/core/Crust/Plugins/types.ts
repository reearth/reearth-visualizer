import type { PropsWithChildren, RefObject } from "react";

import type { Tag } from "@reearth/core/mantle";
import type { ComputedLayer, LayerSelectionReason } from "@reearth/core/Map";
import type { Viewport } from "@reearth/core/Visualizer";

import type { MapRef } from "../types";
import type { InternalWidget, WidgetAlignSystem } from "../Widgets";

import type { CommonReearth } from "./api";
import type { ClientStorage } from "./useClientStorage";
import type { PluginInstances } from "./usePluginInstances";

export type Props = PropsWithChildren<{
  engineName?: string;
  mapRef?: RefObject<MapRef>;
  sceneProperty?: any;
  inEditor?: boolean;
  tags?: Tag[];
  selectedLayer?: ComputedLayer;
  layerSelectionReason?: LayerSelectionReason;
  viewport?: Viewport;
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: InternalWidget[];
  overrideSceneProperty: (id: string, property: any) => void;
}>;

export type Context = {
  reearth: CommonReearth;
  pluginInstances: PluginInstances;
  clientStorage: ClientStorage;
  overrideSceneProperty: (id: string, property: any) => void;
};
