import {
  KmlDataSource as CesiumKmlDataSource,
  CzmlDataSource as CesiumCzmlDataSource,
  GeoJsonDataSource as CesiumGeoJsonDataSource,
} from "cesium";
import { useCallback, useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource, useCesium } from "resium";

import { ComputedFeature, DataType, evalFeature, Feature } from "@reearth/core/mantle";
import { getExtname } from "@reearth/util/path";

import type { ResourceAppearance } from "../../..";
import {
  attachTag,
  extractSimpleLayerData,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

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

const DataTypeListAllowsOnlyProperty: DataType[] = ["geojson"];

export default function Resource({ isVisible, property, layer, onComputedFeatureFetch }: Props) {
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

  const ext = useMemo(() => (!type || type === "auto" ? getExtname(url) : undefined), [type, url]);
  const actualType = ext ? types[ext] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  const handleOnChange = useCallback(
    (e: CesiumCzmlDataSource | CesiumKmlDataSource | CesiumGeoJsonDataSource) => {
      const features: Feature[] = [];
      const computedFeatures: ComputedFeature[] = [];
      e.entities.values.forEach(e => {
        const res = attachStyle(e, layer, evalFeature, viewer.clock.currentTime);
        if (!res) {
          return;
        }
        const [feature, computedFeature] = res;
        attachTag(e, { layerId: layer?.id, featureId: feature.id });

        features.push(feature);
        computedFeatures.push(computedFeature);
      });

      // GeoJSON is not delegated data, so we need to skip.
      if (type !== "geojson") {
        onComputedFeatureFetch?.(features, computedFeatures);
      }
    },
    [layer, viewer, onComputedFeatureFetch, type],
  );

  if (!isVisible || !Component || !url) return null;

  return (
    <Component data={url} show={true} clampToGround={clampToGround} onChange={handleOnChange} />
  );
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
