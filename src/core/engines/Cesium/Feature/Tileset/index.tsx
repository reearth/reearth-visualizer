import { Cesium3DTileset as Cesium3DTilesetType, Cesium3DTileStyle, IonResource } from "cesium";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Cesium3DTileset, CesiumComponentRef } from "resium";

import type { Cesium3DTilesAppearance } from "../../..";
import { shadowMode } from "../../common";
import { attachTag, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;

export type Property = Cesium3DTilesAppearance;

export default function Tileset({
  id,
  isVisible,
  property,
  layer,
  feature,
}: Props): JSX.Element | null {
  const { sourceType, tileset, styleUrl, shadows } = property ?? {};
  const [style, setStyle] = useState<Cesium3DTileStyle>();

  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (tileset?.cesiumElement) {
        attachTag(tileset.cesiumElement, { layerId: layer?.id || id, featureId: feature?.id });
      }
    },
    [feature?.id, id, layer?.id],
  );

  useEffect(() => {
    if (!styleUrl) {
      setStyle(undefined);
      return;
    }
    (async () => {
      const res = await fetch(styleUrl);
      if (!res.ok) return;
      setStyle(new Cesium3DTileStyle(await res.json()));
    })();
  }, [styleUrl]);

  const tilesetUrl = useMemo(() => {
    return sourceType === "osm" && isVisible
      ? IonResource.fromAssetId(96188) // https://github.com/CesiumGS/cesium/blob/1.69/Source/Scene/createOsmBuildings.js#L50
      : isVisible
      ? tileset
      : null;
  }, [isVisible, sourceType, tileset]);

  return !isVisible || (!tileset && !sourceType) || !tilesetUrl ? null : (
    <Cesium3DTileset ref={ref} url={tilesetUrl} style={style} shadows={shadowMode(shadows)} />
  );
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
