import { type LineString, type MultiPolygon, type Polygon } from "geojson";
import { ComponentType, ForwardRefRenderFunction, RefObject, forwardRef } from "react";
import { RequireExactlyOne } from "type-fest";

import { ComputedLayer } from "@reearth/classic/core/Map";

import { InteractionModeType } from "../../Crust";
import { SelectedFeatureInfo } from "../../mantle";
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
  onSketchTypeChange?: (type: SketchType | undefined) => void;
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
  const { state, extrudedHeight, geometryOptions, color } = useHooks({
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
      {...(state.matches("extruding") && {
        extrudedHeight,
      })}
    />
  ) : null;
};

export default forwardRef(Sketch);
