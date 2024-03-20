import type { PropsWithChildren, RefObject } from "react";

import type {
  Camera,
  ComputedFeature,
  SelectedFeatureInfo,
  Tag,
} from "@reearth/beta/lib/core/mantle";
import type {
  ComputedLayer,
  LayerEditEvent,
  LayerLoadEvent,
  LayerSelectionReason,
  LayerSelectWithRectEnd,
  LayerSelectWithRectMove,
  LayerSelectWithRectStart,
  LayerVisibilityEvent,
} from "@reearth/beta/lib/core/Map";
import type { Viewport } from "@reearth/beta/lib/core/Visualizer";

import { SketchEventCallback, SketchType } from "../../Map/Sketch/types";
import { TimelineManagerRef } from "../../Map/useTimelineManager";
import type { MapRef, InteractionModeType } from "../types";
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
  timelineManagerRef?: TimelineManagerRef;
  overrideSceneProperty: (id: string, property: any) => void;
  camera?: Camera;
  interactionMode: InteractionModeType;
  overrideInteractionMode: (mode: InteractionModeType) => void;
  onLayerEdit: (cb: (e: LayerEditEvent) => void) => void;
  onLayerSelectWithRectStart: (cb: (e: LayerSelectWithRectStart) => void) => void;
  onLayerSelectWithRectMove: (cb: (e: LayerSelectWithRectMove) => void) => void;
  onLayerSelectWithRectEnd: (cb: (e: LayerSelectWithRectEnd) => void) => void;
  onPluginSketchFeatureCreated: (cb: SketchEventCallback) => void;
  onSketchTypeChange: (cb: (type: SketchType | undefined) => void) => void;
  onLayerVisibility: (cb: (e: LayerVisibilityEvent) => void) => void;
  onLayerLoad: (cb: (e: LayerLoadEvent) => void) => void;
  onCameraForceHorizontalRollChange: (enable?: boolean) => void;
}>;

export type Context = {
  reearth: CommonReearth;
  pluginInstances: PluginInstances;
  clientStorage: ClientStorage;
  timelineManagerRef?: TimelineManagerRef;
  useExperimentalSandbox?: boolean;
  overrideSceneProperty: (id: string, property: any) => void;
};
