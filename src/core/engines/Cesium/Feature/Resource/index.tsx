import {
  KmlDataSource as CesiumKmlDataSource,
  CzmlDataSource as CesiumCzmlDataSource,
  GeoJsonDataSource as CesiumGeoJsonDataSource,
} from "cesium";
import { useCallback, useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource, useCesium } from "resium";

import { DataType, evalFeature } from "@reearth/core/mantle";

import type { ResourceAppearance, AppearanceTypes } from "../../..";
import { extractSimpleLayerData, type FeatureComponentConfig, type FeatureProps } from "../utils";

import { attachStyle } from "./utils";

export type Props = FeatureProps<Property>;
export type Property = ResourceAppearance;
const types: Record<string, "geojson" | "kml" | "czml"> = {
  kml: "kml",
  geojson: "geojson",
  czml: "czml",
};

const comps = {
  kml: KmlDataSource,
  czml: CzmlDataSource,
  geojson: GeoJsonDataSource,
};

const delegatingAppearance: Record<keyof typeof comps, (keyof AppearanceTypes)[]> = {
  kml: ["marker", "polyline", "polygon"],
  geojson: ["marker", "polyline", "polygon"],
  czml: ["marker", "polyline", "polygon"],
};

const DataTypeListAllowsOnlyProperty: DataType[] = ["geojson"];

export default function Resource({ isVisible, property, layer }: Props) {
  const { clampToGround } = property ?? {};
  const [type, url] = useMemo((): [ResourceAppearance["type"], string | undefined] => {
    const data = extractSimpleLayerData(layer);
    const type = property?.type;
    const url = property?.url;
    return [
      type ?? (data?.type as ResourceAppearance["type"]),
      url ?? (data && !DataTypeListAllowsOnlyProperty.includes(data.type) ? data?.url : undefined),
    ];
  }, [property, layer]);
  const { viewer } = useCesium();

  const ext = useMemo(
    () => (!type || type === "auto" ? url?.match(/\.([a-z]+?)(?:\?.*?)?$/) : undefined),
    [type, url],
  );
  const actualType = ext ? types[ext[1]] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;
  const appearances = actualType ? delegatingAppearance[actualType] : undefined;

  const handleOnChange = useCallback(
    (e: CesiumCzmlDataSource | CesiumKmlDataSource | CesiumGeoJsonDataSource) => {
      attachStyle(e, appearances, layer, evalFeature, viewer.clock.currentTime);
    },
    [appearances, layer, viewer],
  );

  if (!isVisible || !Component || !url) return null;

  return (
    <Component data={url} show={true} clampToGround={clampToGround} onChange={handleOnChange} />
  );
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
