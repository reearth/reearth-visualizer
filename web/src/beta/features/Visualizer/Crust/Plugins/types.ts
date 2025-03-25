import { ViewerProperty } from "@reearth/beta/features/Editor/Visualizer/type";
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
  SketchEventCallback,
  SketchType,
  TimelineManagerRef
} from "@reearth/core";
import type { PropsWithChildren, RefObject } from "react";

import { Story } from "../StoryPanel";
import type { MapRef, InteractionModeType } from "../types";
import type { InternalWidget, WidgetAlignSystem } from "../Widgets";

import type { CommonReearth } from "./pluginAPI/commonReearth";
import {
  CameraEventType,
  LayersEventType,
  SelectionModeEventType,
  SketchEventType,
  TimelineEventType,
  ViewerEventType
} from "./pluginAPI/types";
import type { ClientStorage } from "./useClientStorage";
import type { PluginInstances } from "./usePluginInstances";
import { Events } from "./utils/events";

export type Props = PropsWithChildren<{
  engineName?: string;
  mapRef?: RefObject<MapRef>;
  mapAPIReady?: boolean;
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
  interactionMode?: InteractionModeType;
  overrideViewerProperty?: (id: string, property: ViewerProperty) => void;
  overrideInteractionMode?: (mode: InteractionModeType) => void;
  onLayerEdit?: (cb: (e: LayerEditEvent) => void) => void;
  onLayerSelectWithRectStart?: (
    cb: (e: LayerSelectWithRectStart) => void
  ) => void;
  onLayerSelectWithRectMove?: (
    cb: (e: LayerSelectWithRectMove) => void
  ) => void;
  onLayerSelectWithRectEnd?: (cb: (e: LayerSelectWithRectEnd) => void) => void;
  onSketchPluginFeatureCreate?: (cb: SketchEventCallback) => void;
  onSketchPluginFeatureUpdate?: (cb: SketchEventCallback) => void;
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
  viewerEvents: Events<ViewerEventType>;
  selectionModeEvents: Events<SelectionModeEventType>;
  cameraEvents: Events<CameraEventType>;
  timelineEvents: Events<TimelineEventType>;
  layersEvents: Events<LayersEventType>;
  sketchEvents: Events<SketchEventType>;
};
