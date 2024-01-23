import { CallbackProperty, Cartesian3, type Color } from "@cesium/engine";
import { memo, useRef, type FC } from "react";
import invariant from "tiny-invariant";

import { useConstant } from "@reearth/beta/utils/util";

import { useVisualizer } from "../../Visualizer";

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
    const visualizer = useVisualizer();

    const controlPoint = controlPoints[controlPoints.length - 1];
    const normal = visualizer.current?.engine.getNormal(controlPoint, cartesianScratch);

    invariant(normal !== undefined);
    const extrudedPoint = Cartesian3.add(
      controlPoint,
      Cartesian3.multiplyByScalar(normal, extrudedHeight, cartesianScratch),
      cartesianScratch,
    );

    const extrudedPointRef = useRef(extrudedPoint);
    extrudedPointRef.current = extrudedPoint;
    const extrudedPointProperty = useConstant(
      () => new CallbackProperty(() => extrudedPointRef.current, false),
    );

    return (
      <>
        <ControlPoint position={controlPoint} clampToGround />
        <ControlPoint position={extrudedPointProperty} />
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
