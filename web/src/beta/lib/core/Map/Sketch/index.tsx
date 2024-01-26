import { type LineString, type MultiPolygon, type Polygon } from "geojson";
import { ComponentType, ForwardRefRenderFunction, RefObject, forwardRef } from "react";
import { RequireExactlyOne } from "type-fest";

import { InteractionModeType } from "../../Crust";
import { Position3d } from "../../types";
import { EngineRef, Feature, LayersRef, SketchRef } from "../types";

import useHooks from "./hooks";
import { SketchFeature, SketchType } from "./types";

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

export type SketchProps = {
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
  SketchComponent?: SketchComponentType;
  selectedFeature?: Feature;
  interactionMode?: InteractionModeType;
  overrideInteractionMode?: (mode: InteractionModeType) => void;
  onSketchTypeChange?: (type: SketchType | undefined) => void;
  onSketchFeatureCreate?: (feature: SketchFeature | null) => void;
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
