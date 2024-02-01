import {
  CallbackProperty,
  Cartesian3,
  ClassificationType,
  PolylineDashMaterialProperty,
  type Color,
  type PositionProperty,
} from "@cesium/engine";
import { useMemo, useRef, type FC } from "react";

import { useConstant } from "@reearth/beta/utils/util";

import { useContext } from "../Feature/context";

import { Entity, type EntityProps } from "./Entity";
import { MeasurementText } from "./MeasurementText";
import ScreenSpaceElement from "./ScreenSpaceElement";

const MeasurementLine: FC<{
  a: Cartesian3;
  b: Cartesian3;
  color?: Color;
}> = ({ a, b, color }) => {
  const controlPointsRef = useRef([a, b]);
  controlPointsRef.current = [a, b];
  const positionsProperty = useConstant(
    () =>
      new CallbackProperty(() => controlPointsRef.current, false) as unknown as PositionProperty,
  );

  const options = useMemo(
    (): EntityProps => ({
      polyline: {
        positions: positionsProperty,
        width: 1.5,
        material: new PolylineDashMaterialProperty({
          color,
          dashLength: 8,
        }),
        classificationType: ClassificationType.TERRAIN,
        clampToGround: true,
      },
    }),
    [color, positionsProperty],
  );

  const { requestRender } = useContext();
  requestRender?.();

  return <Entity {...options} />;
};

export interface SurfaceMeasurementProps {
  a: Cartesian3;
  b: Cartesian3;
  color?: Color;
  showLine?: boolean;
}

export const SurfaceMeasurement: FC<SurfaceMeasurementProps> = ({
  a,
  b,
  color,
  showLine = false,
}) => {
  const position = useConstant(() => new Cartesian3());

  const { getSurfaceDistance } = useContext();
  const distance = getSurfaceDistance?.(a, b);

  return distance !== undefined ? (
    <>
      <ScreenSpaceElement position={Cartesian3.midpoint(a, b, position)}>
        <MeasurementText>
          {distance < 1000 ? `${distance.toFixed(1)} m` : `${(distance / 1000).toFixed(1)} km`}
        </MeasurementText>
      </ScreenSpaceElement>
      {showLine && <MeasurementLine a={a} b={b} color={color} />}
    </>
  ) : null;
};
