import { memo } from "react";
import { Cesium3DTileset } from "resium";

import type { Cesium3DTilesAppearance } from "../../..";
import { shadowMode } from "../../common";
import { type FeatureComponentConfig, type FeatureProps } from "../utils";

import { useHooks } from "./hooks";

export type Props = FeatureProps<Property>;

export type Property = Cesium3DTilesAppearance;

function Tileset({
  id,
  isVisible,
  property,
  layer,
  feature,
  sceneProperty,
}: Props): JSX.Element | null {
  const { shadows } = property ?? {};
  const { tilesetUrl, ref, style, clippingPlanes } = useHooks({
    id,
    isVisible,
    layer,
    feature,
    property,
    sceneProperty,
  });

  return !isVisible || !tilesetUrl ? null : (
    <Cesium3DTileset
      ref={ref}
      url={tilesetUrl}
      style={style}
      shadows={shadowMode(shadows)}
      clippingPlanes={clippingPlanes}
    />
  );
}

export default memo(Tileset);

export const config: FeatureComponentConfig = {
  noFeature: true,
};
