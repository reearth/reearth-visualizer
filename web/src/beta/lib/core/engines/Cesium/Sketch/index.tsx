// Reference: Sketch feature is basically referenced from https://github.com/takram-design-engineering/plateau-view/blob/main/libs/sketch/src/DynamicSketchObject.tsx

import { Color } from "@cesium/engine";
import { Cartesian3 } from "cesium";
import { type LineString, type MultiPolygon, type Polygon } from "geojson";
import { memo, useMemo, type FC } from "react";
import { type RequireExactlyOne } from "type-fest";

import { SketchType } from "../../../Map/Sketch/types";
import { Position3d } from "../../../types";
import { convertGeometryToPositionsArray, convertPolygonToHierarchyArray } from "../utils/polygon";

import { createGeometry, GeometryOptions } from "./createGeometry";
import ExtrudedControlPoints from "./ExtrudedControlPoints";
import { ExtrudedPolygonEntity } from "./ExtrudedPolygonEntity";
import { PolygonEntity } from "./PolygonEntity";
import { PolylineEntity } from "./PolylineEntity";
import SurfaceControlPoints from "./SurfaceControlPoints";

export type SketchComponentProps = RequireExactlyOne<
  {
    geometry?: LineString | Polygon | MultiPolygon | null;
    geometryOptions?: {
      type: SketchType;
      controlPoints: readonly Position3d[];
    } | null;
    extrudedHeight?: number;
    disableShadow?: boolean;
    color?: string;
    enableRelativeHeight?: boolean;
  },
  "geometry" | "geometryOptions"
>;

const DEFAULT_SKETCH_COLOR = "#00bebe";

const SketchComponent: FC<SketchComponentProps> = memo(
  ({
    geometry,
    geometryOptions,
    extrudedHeight,
    disableShadow,
    color: stringColor,
    enableRelativeHeight,
  }) => {
    const cartesianGeometryOptions: GeometryOptions | null = useMemo(
      () =>
        geometryOptions
          ? {
              ...geometryOptions,
              controlPoints: geometryOptions?.controlPoints.map(p => new Cartesian3(...p)),
            }
          : null,
      [geometryOptions],
    );

    const g = useMemo(
      () =>
        geometry ?? (cartesianGeometryOptions ? createGeometry(cartesianGeometryOptions) : null),
      [geometry, cartesianGeometryOptions],
    );

    const { positionsArray, hierarchyArray } = useMemo(() => {
      if (g?.type === "Point") {
        return {};
      } else if (g?.type === "LineString") {
        return { positionsArray: convertGeometryToPositionsArray(g) };
      } else if (g != null) {
        return {
          positionsArray: convertGeometryToPositionsArray(g),
          hierarchyArray: convertPolygonToHierarchyArray(g),
        };
      }
      return {};
    }, [g]);

    const color = useMemo(
      () => Color.fromCssColorString(stringColor ?? DEFAULT_SKETCH_COLOR),
      [stringColor],
    );

    return (
      <>
        {positionsArray?.map((positions, index) => (
          <PolylineEntity key={index} dynamic positions={positions} color={color} />
        ))}
        {hierarchyArray?.map((hierarchy, index) => (
          <PolygonEntity key={index} dynamic hierarchy={hierarchy} color={color} />
        ))}
        {cartesianGeometryOptions != null && extrudedHeight == null && (
          <SurfaceControlPoints geometryOptions={cartesianGeometryOptions} color={color} />
        )}
        {cartesianGeometryOptions != null && extrudedHeight != null && (
          <ExtrudedControlPoints
            geometryOptions={cartesianGeometryOptions}
            extrudedHeight={extrudedHeight}
            color={color}
          />
        )}
        {extrudedHeight != null &&
          hierarchyArray?.map((hierarchy, index) => (
            <ExtrudedPolygonEntity
              key={index}
              dynamic
              hierarchy={hierarchy}
              extrudedHeight={extrudedHeight}
              disableShadow={disableShadow}
              color={color}
              enableRelativeHeight={enableRelativeHeight}
            />
          ))}
      </>
    );
  },
);

SketchComponent.displayName = "SketchComponent";

export default SketchComponent;
