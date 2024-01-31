import { Cartesian3, type Color } from "@cesium/engine";
import { memo, type FC } from "react";
import { useCesium } from "resium";
import invariant from "tiny-invariant";

import { ControlPoint } from "./ControlPoint";
import { type GeometryOptions } from "./createGeometry";
import { ExtrudedMeasurement } from "./ExtrudedMeasurement";

export interface ExtrudedControlPointsProps {
  geometryOptions: GeometryOptions;
  extrudedHeight: number;
  color?: Color;
}

const cartesianScratch = new Cartesian3();

const ExtrudedControlPoints: FC<ExtrudedControlPointsProps> = memo(
  ({ geometryOptions: { controlPoints }, extrudedHeight, color }) => {
    const { viewer } = useCesium();
    const controlPoint = controlPoints[controlPoints.length - 1];
    const normal = viewer?.scene?.globe.ellipsoid.geodeticSurfaceNormal(
      controlPoint,
      cartesianScratch,
    );

    invariant(normal !== undefined);
    const extrudedPoint = Cartesian3.add(
      controlPoint,
      Cartesian3.multiplyByScalar(normal, extrudedHeight, cartesianScratch),
      cartesianScratch,
    );

    return (
      <>
        <ControlPoint position={controlPoint} clampToGround />
        <ControlPoint position={extrudedPoint} />
        <ExtrudedMeasurement
          a={controlPoint}
          b={extrudedPoint}
          extrudedHeight={extrudedHeight}
          color={color}
        />
      </>
    );
  },
);

ExtrudedControlPoints.displayName = "ExtrudedControlPoints";

export default ExtrudedControlPoints;
