import { Color } from "@cesium/engine";
import { type LineString, type MultiPolygon, type Polygon } from "geojson";
import { memo, useMemo, type FC } from "react";
import { type RequireExactlyOne } from "type-fest";

import { createGeometry, type GeometryOptions } from "./createGeometry";
import ExtrudedControlPoints from "./ExtrudedControlPoints";
import { ExtrudedPolygonEntity } from "./ExtrudedPolygonEntity";
import { PolygonEntity } from "./PolygonEntity";
import { PolylineEntity } from "./PolylineEntity";
import SurfaceControlPoints from "./SurfaceControlPoints";
import { convertGeometryToPositionsArray, convertPolygonToHierarchyArray } from "./utils";

export type DynamicSketchObjectProps = RequireExactlyOne<
  {
    geometry?: LineString | Polygon | MultiPolygon | null;
    geometryOptions?: GeometryOptions | null;
    extrudedHeight?: number;
    disableShadow?: boolean;
    color?: Color;
  },
  "geometry" | "geometryOptions"
>;

const DynamicSketchObject: FC<DynamicSketchObjectProps> = memo(
  ({ geometry, geometryOptions, extrudedHeight, disableShadow, color }) => {
    const g = useMemo(
      () => geometry ?? (geometryOptions ? createGeometry(geometryOptions) : null),
      [geometry, geometryOptions],
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

    // TODO: entity style API
    const primaryColor = useMemo(() => Color.fromCssColorString("#00bebe"), []);

    return (
      <>
        {positionsArray?.map((positions, index) => (
          <PolylineEntity key={index} dynamic positions={positions} color={color ?? primaryColor} />
        ))}
        {hierarchyArray?.map((hierarchy, index) => (
          <PolygonEntity key={index} dynamic hierarchy={hierarchy} color={color ?? primaryColor} />
        ))}
        {geometryOptions != null && extrudedHeight == null && (
          <SurfaceControlPoints geometryOptions={geometryOptions} color={color ?? primaryColor} />
        )}
        {geometryOptions != null && extrudedHeight != null && (
          <ExtrudedControlPoints
            geometryOptions={geometryOptions}
            extrudedHeight={extrudedHeight}
            color={color ?? primaryColor}
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
              color={color ?? primaryColor}
            />
          ))}
      </>
    );
  },
);

DynamicSketchObject.displayName = "DynamicSketchObject";

export default DynamicSketchObject;
