import { createContext } from "react";

import { InteractionModeType } from "@reearth/beta/features/Visualizer/Crust";

import {
  LayerEditEvent,
  LayerSelectionReason,
  LayerVisibilityEvent,
  SceneProperty,
} from "../engines";
import { ComputedFeature, ComputedLayer } from "../mantle";
import {
  LayerLoadEvent,
  LayerSelectWithRectEnd,
  LayerSelectWithRectMove,
  LayerSelectWithRectStart,
} from "../Map";
import { SketchEventCallback, SketchType } from "../Map/Sketch/types";

import { Viewport } from "./useViewport";

type CoreContext = {
  interactionMode?: InteractionModeType;
  selectedLayer?: {
    layerId?: string | undefined;
    featureId?: string | undefined;
    layer?: ComputedLayer | undefined;
    reason?: LayerSelectionReason | undefined;
  };
  selectedComputedFeature?: ComputedFeature | undefined;
  viewport?: Viewport;
  overriddenSceneProperty?: SceneProperty;
  overrideSceneProperty?: (pluginId: string, property: SceneProperty) => void;
  handleCameraForceHorizontalRollChange?: (enable?: boolean) => void;
  handleInteractionModeChange?: (mode?: InteractionModeType | undefined) => void;
  onSketchPluginFeatureCreate?: (cb: SketchEventCallback) => void;
  onSketchTypeChange?: (cb: (type: SketchType | undefined) => void) => void;
  onLayerVisibility?: (cb: (e: LayerVisibilityEvent) => void) => void;
  onLayerLoad?: (cb: (e: LayerLoadEvent) => void) => void;
  onLayerEdit?: (cb: (e: LayerEditEvent) => void) => void;
  onLayerSelectWithRectStart?: (cb: (e: LayerSelectWithRectStart) => void) => void;
  onLayerSelectWithRectMove?: (cb: (e: LayerSelectWithRectMove) => void) => void;
  onLayerSelectWithRectEnd?: (cb: (e: LayerSelectWithRectEnd) => void) => void;
};

const coreContext = createContext<CoreContext>({});

export default coreContext;
