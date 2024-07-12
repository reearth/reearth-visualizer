import {
  Color,
  DistanceDisplayCondition,
  Plane as CesiumPlane,
  TimeIntervalCollection,
  TranslationRotationScale,
} from "cesium";
import { FC, memo } from "react";
import { PlaneGraphics } from "resium";

import { EntityExt } from "../utils";

import { useHooks } from "./hooks/side";

export const Side: FC<{
  layerId: string;
  featureId?: string;
  planeLocal: CesiumPlane;
  isActive: boolean;
  trs: TranslationRotationScale;
  fillColor?: Color;
  outlineColor?: Color;
  activeOutlineColor?: Color;
  fill?: boolean;
  availability?: TimeIntervalCollection;
  distanceDisplayCondition?: DistanceDisplayCondition;
}> = memo(function SidePresenter({
  layerId,
  featureId,
  planeLocal,
  isActive,
  fill,
  fillColor,
  outlineColor,
  activeOutlineColor,
  trs,
  availability,
  distanceDisplayCondition,
}) {
  const { cbRef, plane, dimension, orientation, outlineColorCb } = useHooks({
    planeLocal,
    isActive,
    outlineColor,
    activeOutlineColor,
    trs,
  });

  return (
    <EntityExt
      layerId={layerId}
      featureId={featureId}
      position={cbRef}
      orientation={orientation}
      availability={availability}>
      <PlaneGraphics
        plane={plane}
        dimensions={dimension}
        fill={fill}
        material={fillColor}
        outlineWidth={1}
        outlineColor={outlineColorCb}
        distanceDisplayCondition={distanceDisplayCondition}
        outline
      />
    </EntityExt>
  );
});
