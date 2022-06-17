import { Cesium3DTileset as Cesium3DTilesetType, Cesium3DTileStyle } from "cesium";
import { useCallback, useEffect, useState } from "react";
import { Cesium3DTileset, CesiumComponentRef, useCesium } from "resium";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { shadowMode, layerIdField } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    tileset?: string;
    styleUrl?: string;
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  };
};

export default function Tileset({ layer }: PrimitiveProps<Property>): JSX.Element | null {
  const { viewer } = useCesium();
  const { isVisible, property } = layer ?? {};
  const { tileset, styleUrl, shadows } = (property as Property | undefined)?.default ?? {};
  const [style, setStyle] = useState<Cesium3DTileStyle>();

  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (layer?.id && tileset?.cesiumElement) {
        (tileset?.cesiumElement as any)[layerIdField] = layer.id;
      }
    },
    [layer?.id],
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

  return !isVisible || !tileset ? null : (
    <Cesium3DTileset
      ref={ref}
      url={tileset}
      style={style}
      shadows={shadowMode(shadows)}
      onReady={_debugFlight ? t => viewer?.zoomTo(t) : undefined}
    />
  );
}

const _debugFlight = false;
