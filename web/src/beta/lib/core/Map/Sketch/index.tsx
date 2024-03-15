// Reference: Sketch feature is basically referenced from https://github.com/takram-design-engineering/plateau-view/blob/main/libs/sketch/src/SketchTool.tsx

import { type LineString, type MultiPolygon, type Polygon } from "geojson";
import { ComponentType, ForwardRefRenderFunction, RefObject, forwardRef } from "react";
import { RequireExactlyOne } from "type-fest";

import { InteractionModeType } from "../../Crust";
import { ComputedLayer, SelectedFeatureInfo } from "../../mantle";
import { Position3d } from "../../types";
import { EngineRef, Feature, LayerSelectionReason, LayersRef, SketchRef } from "../types";

import useHooks from "./hooks";
import { SketchEventProps, SketchFeature, SketchType } from "./types";

export type SketchComponentType = ComponentType<SketchComponentProps>;

type GeometryOptions = {
  type: SketchType;
  controlPoints: readonly Position3d[];
};

type SketchComponentProps = RequireExactlyOne<
  {
    geometry?: LineString | Polygon | MultiPolygon | null;
    geometryOptions?: GeometryOptions | null;
    extrudedHeight?: number;
    disableShadow?: boolean;
    enableRelativeHeight?: boolean;
    color?: string;
  },
  "geometry" | "geometryOptions"
>;

export type OnLayerSelectType = (
  layerId: string | undefined,
  featureId: string | undefined,
  layer: (() => Promise<ComputedLayer | undefined>) | undefined,
  reason: LayerSelectionReason | undefined,
  info: SelectedFeatureInfo | undefined,
) => void;

export type SketchProps = {
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
  SketchComponent?: SketchComponentType;
  selectedFeature?: Feature;
  interactionMode?: InteractionModeType;
  overrideInteractionMode?: (mode: InteractionModeType) => void;
  onSketchTypeChange?: (type: SketchType | undefined, from?: "editor" | "plugin") => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
  onPluginSketchFeatureCreated?: (props: SketchEventProps) => void;
  onLayerSelect?: OnLayerSelectType;
};

const Sketch: ForwardRefRenderFunction<SketchRef, SketchProps> = (
  {
    layersRef,
    engineRef,
    interactionMode = "default",
    selectedFeature,
    SketchComponent,
    overrideInteractionMode,
    onSketchTypeChange,
    onSketchFeatureCreate,
    onPluginSketchFeatureCreated,
    onLayerSelect,
  },
  ref,
) => {
  const { state, extrudedHeight, geometryOptions, color, disableShadow, enableRelativeHeight } =
    useHooks({
      ref,
      layersRef,
      engineRef,
      interactionMode,
      selectedFeature,
      overrideInteractionMode,
      onSketchTypeChange,
      onSketchFeatureCreate,
      onPluginSketchFeatureCreated,
      onLayerSelect,
    });
  if (state.matches("idle")) {
    return null;
  }
  return SketchComponent ? (
    <SketchComponent
      geometryOptions={geometryOptions}
      color={color}
      disableShadow={disableShadow}
      enableRelativeHeight={enableRelativeHeight}
      {...(state.matches("extruding") && {
        extrudedHeight,
      })}
    />
  ) : null;
};

export default forwardRef(Sketch);
