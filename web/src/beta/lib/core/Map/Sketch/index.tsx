import { type LineString, type MultiPolygon, type Polygon } from "geojson";
import { ComponentType, ForwardRefRenderFunction, RefObject, forwardRef } from "react";
import { RequireExactlyOne } from "type-fest";

import { InteractionModeType } from "../../Crust";
import { Position3d } from "../../types";
import { EngineRef, LayersRef, SketchRef } from "../types";

import useHooks from "./hooks";
import { SketchType } from "./types";

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

type Props = {
  layersRef: RefObject<LayersRef>;
  engineRef: RefObject<EngineRef>;
  interactionMode: InteractionModeType;
  SketchComponent?: SketchComponentType;
};

const Sketch: ForwardRefRenderFunction<SketchRef, Props> = (
  { layersRef, engineRef, interactionMode, SketchComponent },
  ref,
) => {
  const { state, extrudedHeight, geometryOptions, color } = useHooks({
    ref,
    layersRef,
    engineRef,
    interactionMode,
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
