import {
  Axis,
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  Color,
  Matrix4,
  Plane as CesiumPlane,
  PositionProperty,
  TranslationRotationScale,
} from "cesium";
import { useMemo, FC, memo } from "react";
import { Entity, PlaneGraphics } from "resium";

// ref: https://github.com/TerriaJS/terriajs/blob/cad62a45cbee98c7561625458bec3a48510f6cbc/lib/Models/BoxDrawing.ts#L1446-L1461
function setPlaneDimensions(
  boxDimensions: Cartesian3,
  planeNormalAxis: Axis,
  planeDimensions: Cartesian2,
) {
  if (planeNormalAxis === Axis.X) {
    planeDimensions.x = boxDimensions.y;
    planeDimensions.y = boxDimensions.z;
  } else if (planeNormalAxis === Axis.Y) {
    planeDimensions.x = boxDimensions.x;
    planeDimensions.y = boxDimensions.z;
  } else if (planeNormalAxis === Axis.Z) {
    planeDimensions.x = boxDimensions.x;
    planeDimensions.y = boxDimensions.y;
  }
}

export const Side: FC<{
  id: string;
  planeLocal: CesiumPlane;
  trs: TranslationRotationScale;
  style: {
    fillColor?: Color;
    outlineColor?: Color;
    outlineWidth?: number;
    fill?: boolean;
    outline?: boolean;
  };
}> = memo(function SidePresenter({ id, planeLocal, style, trs }) {
  const normalAxis = planeLocal.normal.x ? Axis.X : planeLocal.normal.y ? Axis.Y : Axis.Z;
  const cbRef = useMemo(
    () => new CallbackProperty(() => trs.translation, false) as unknown as PositionProperty,
    [trs],
  );
  const [plane, dimension] = useMemo(() => {
    const dimension = new Cartesian3();
    setPlaneDimensions(trs.scale, normalAxis, dimension);
    const scratchScaleMatrix = new Matrix4();
    const scaleMatrix = Matrix4.fromScale(trs.scale, scratchScaleMatrix);
    const plane = CesiumPlane.transform(
      planeLocal,
      scaleMatrix,
      new CesiumPlane(Cartesian3.UNIT_Z, 0),
    );
    return [plane, dimension];
  }, [trs, normalAxis, planeLocal]);

  return (
    <Entity id={id} position={cbRef}>
      <PlaneGraphics
        plane={plane}
        dimensions={dimension}
        fill={style.fill}
        outline={style.outline}
        material={style.fillColor}
        outlineColor={style.outlineColor}
        outlineWidth={style.outlineWidth}
      />
    </Entity>
  );
});
