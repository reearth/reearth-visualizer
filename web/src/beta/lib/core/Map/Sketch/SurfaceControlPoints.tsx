import { Cartesian3, type Color } from "@cesium/engine";
import { memo, type FC } from "react";

import { ControlPoint } from "./ControlPoint";
import { type GeometryOptions } from "./createGeometry";
import { SurfaceMeasurement } from "./SurfaceMeasurement";

export interface SurfaceControlPointsProps {
  geometryOptions: GeometryOptions;
  color?: Color;
}

const cartesianScratch1 = new Cartesian3();
const cartesianScratch2 = new Cartesian3();

const SurfaceControlPoints: FC<SurfaceControlPointsProps> = memo(
  ({ geometryOptions: { type, controlPoints: controlPointsProp }, color }) => {
    let controlPoints = [...controlPointsProp];
    let measurementPoints: [Cartesian3, Cartesian3] | undefined;
    let showLine = false;

    if (type === "rectangle" && controlPoints.length === 3) {
      const [p1, p2, p3] = controlPoints;
      const projection = Cartesian3.projectVector(
        Cartesian3.subtract(p3, p1, cartesianScratch1),
        Cartesian3.subtract(p2, p1, cartesianScratch2),
        cartesianScratch1,
      );
      const offset = Cartesian3.subtract(
        p3,
        Cartesian3.add(p1, projection, cartesianScratch1),
        cartesianScratch2,
      );
      const p4 = Cartesian3.midpoint(p1, p2, cartesianScratch1);
      const p5 = Cartesian3.add(p4, offset, cartesianScratch2);
      controlPoints = [p1, p2, p5];
      measurementPoints = [p4, p5];
      showLine = true;
    } else if (type === "marker") {
      measurementPoints = undefined;
      controlPoints = [];
    } else if (controlPoints.length >= 2) {
      measurementPoints = controlPoints.slice(-2) as [Cartesian3, Cartesian3];
      showLine = type === "circle";
    }

    return (
      <>
        {controlPoints.map((controlPoint, index) => (
          <ControlPoint key={index} position={controlPoint} clampToGround />
        ))}
        {measurementPoints != undefined && (
          <SurfaceMeasurement
            a={measurementPoints[0]}
            b={measurementPoints[1]}
            color={color}
            showLine={showLine}
          />
        )}
      </>
    );
  },
);

SurfaceControlPoints.displayName = "SurfaceControlPoints";

export default SurfaceControlPoints;
