import { Cesium3DTileset as Cesium3DTilesetType, Cesium3DTileStyle } from "cesium";
import React, { useCallback, useMemo } from "react";
import { Cesium3DTileset, CesiumComponentRef, useCesium } from "resium";

import type { Props as PrimitiveProps } from "../../../Primitive";
import { shadowMode } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    tileset?: string;
    styleUrl?: string;
    shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  };
};

export default function Tileset({ primitive }: PrimitiveProps<Property>): JSX.Element | null {
  const { viewer } = useCesium();
  const { isVisible, property } = primitive ?? {};
  const { tileset, styleUrl, shadows } = (property as Property | undefined)?.default ?? {};
  const style = useMemo<Cesium3DTileStyle | undefined>(
    () => (styleUrl ? new Cesium3DTileStyle(styleUrl) : undefined),
    [styleUrl],
  );
  const ref = useCallback(
    (tileset: CesiumComponentRef<Cesium3DTilesetType> | null) => {
      if (tileset?.cesiumElement) {
        (tileset?.cesiumElement as any).__resium_primitive_id = primitive?.id;
      }
    },
    [primitive],
  );

  return !isVisible || !tileset ? null : (
    <Cesium3DTileset
      ref={ref}
      url={tileset}
      shadows={shadowMode(shadows)}
      style={style}
      onReady={_debugFlight ? t => viewer?.zoomTo(t) : undefined}
    />
  );
}

const _debugFlight = false;
