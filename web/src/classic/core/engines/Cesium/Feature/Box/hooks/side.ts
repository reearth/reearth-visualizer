import {
  Axis,
  CallbackProperty,
  Cartesian3,
  Color,
  Matrix4,
  Plane as CesiumPlane,
  PositionProperty,
  TranslationRotationScale,
} from "cesium";
import { useMemo, useRef, useState, useEffect } from "react";

import { setPlaneDimensions } from "../utils";

export const useHooks = ({
  planeLocal,
  isActive,
  outlineColor,
  activeOutlineColor,
  trs,
}: {
  planeLocal: CesiumPlane;
  isActive: boolean;
  trs: TranslationRotationScale;
  outlineColor?: Color;
  activeOutlineColor?: Color;
}) => {
  const cbRef = useMemo(
    () => new CallbackProperty(() => trs.translation, false) as unknown as PositionProperty,
    [trs],
  );
  const [plane, dimension, orientation] = useMemo(() => {
    return [
      new CallbackProperty(() => {
        const scratchScaleMatrix = new Matrix4();
        const scaleMatrix = Matrix4.fromScale(trs.scale, scratchScaleMatrix);
        return CesiumPlane.transform(
          planeLocal,
          scaleMatrix,
          new CesiumPlane(Cartesian3.UNIT_Z, 0),
        );
      }, false),
      new CallbackProperty(() => {
        const normalAxis = planeLocal.normal.x ? Axis.X : planeLocal.normal.y ? Axis.Y : Axis.Z;
        const dimension = new Cartesian3();
        setPlaneDimensions(trs.scale, normalAxis, dimension);
        return dimension;
      }, false),
      new CallbackProperty(() => trs.rotation, false),
    ];
  }, [trs, planeLocal]);

  const isActiveRef = useRef(false);
  const [outlineColorCb] = useState(
    () =>
      new CallbackProperty(
        () => (isActiveRef.current ? activeOutlineColor ?? outlineColor : outlineColor),
        false,
      ),
  );
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  return {
    cbRef,
    plane,
    dimension,
    orientation,
    outlineColorCb,
  };
};
