import type { PropsWithChildren, RefObject } from "react";

import type {
  ComputedFeature,
  SelectedFeatureInfo,
  Viewport,
  ComputedLayer,
  LayerEditEvent,
  LayerLoadEvent,
  LayerSelectionReason,
  LayerSelectWithRectEnd,
  LayerSelectWithRectMove,
  LayerSelectWithRectStart,
  LayerVisibilityEvent,
  ViewerProperty,
  SketchEventCallback,
  SketchType,
  TimelineManagerRef,
} from "@reearth/core";

import { Story } from "../StoryPanel";
import type { MapRef, InteractionModeType } from "../types";
import type { InternalWidget, WidgetAlignSystem } from "../Widgets";

import type { CommonReearth } from "./api";
import type { ClientStorage } from "./useClientStorage";
import type { PluginInstances } from "./usePluginInstances";

export type Props = PropsWithChildren<{
  engineName?: string;
  mapRef?: RefObject<MapRef>;
  viewerProperty?: ViewerProperty;
  inEditor?: boolean;
  built?: boolean;
  selectedLayer?: ComputedLayer;
  selectedFeature?: ComputedFeature;
  selectedFeatureInfo?: SelectedFeatureInfo;
  layerSelectionReason?: LayerSelectionReason;
  viewport?: Viewport;
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: InternalWidget[];
  timelineManagerRef?: TimelineManagerRef;
  selectedStory?: Story;
  interactionMode: InteractionModeType;
  overrideViewerProperty?: (id: string, property: ViewerProperty) => void;
  overrideInteractionMode?: (mode: InteractionModeType) => void;
  onLayerEdit?: (cb: (e: LayerEditEvent) => void) => void;
  onLayerSelectWithRectStart?: (cb: (e: LayerSelectWithRectStart) => void) => void;
  onLayerSelectWithRectMove?: (cb: (e: LayerSelectWithRectMove) => void) => void;
  onLayerSelectWithRectEnd?: (cb: (e: LayerSelectWithRectEnd) => void) => void;
  onSketchPluginFeatureCreate?: (cb: SketchEventCallback) => void;
  onSketchTypeChange?: (cb: (type: SketchType | undefined) => void) => void;
  onLayerVisibility?: (cb: (e: LayerVisibilityEvent) => void) => void;
  onLayerLoad?: (cb: (e: LayerLoadEvent) => void) => void;
  onCameraForceHorizontalRollChange?: (enable?: boolean) => void;
}>;

export type Context = {
  reearth: CommonReearth;
  pluginInstances: PluginInstances;
  clientStorage: ClientStorage;
  timelineManagerRef?: TimelineManagerRef;
  overrideViewerProperty?: (id: string, property: ViewerProperty) => void;
};
