import type { PropsWithChildren, RefObject } from "react";

import type {
  Camera,
  ComputedFeature,
  SelectedFeatureInfo,
  Tag,
} from "@reearth/classic/core/mantle";
import type {
  ComputedLayer,
  LayerEditEvent,
  LayerSelectionReason,
} from "@reearth/classic/core/Map";
import type { Viewport } from "@reearth/classic/core/Visualizer";

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
  built?: boolean;
  tags?: Tag[];
  selectedLayer?: ComputedLayer;
  selectedFeature?: ComputedFeature;
  selectedFeatureInfo?: SelectedFeatureInfo;
  layerSelectionReason?: LayerSelectionReason;
  viewport?: Viewport;
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: InternalWidget[];
  useExperimentalSandbox?: boolean;
  overrideSceneProperty: (id: string, property: any) => void;
  camera?: Camera;
  onLayerEdit: (cb: (e: LayerEditEvent) => void) => void;
}>;

export type Context = {
  reearth: CommonReearth;
  pluginInstances: PluginInstances;
  clientStorage: ClientStorage;
  useExperimentalSandbox?: boolean;
  overrideSceneProperty: (id: string, property: any) => void;
};
