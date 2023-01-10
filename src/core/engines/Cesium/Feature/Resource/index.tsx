import { useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource } from "resium";

import type { ResourceAppearance } from "../../..";
import { extractSimpleLayerData, type FeatureComponentConfig, type FeatureProps } from "../utils";

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

export default function Resource({ isVisible, property, layer }: Props) {
  const { clampToGround } = property ?? {};
  const [type, url] = useMemo((): [ResourceAppearance["type"], string | undefined] => {
    const data = extractSimpleLayerData(layer);
    const type = property?.type;
    const url = property?.url;
    return [type ?? (data?.type as ResourceAppearance["type"]), url ?? data?.url];
  }, [property, layer]);

  const ext = useMemo(
    () => (!type || type === "auto" ? url?.match(/\.([a-z]+?)(?:\?.*?)?$/) : undefined),
    [type, url],
  );
  const actualType = ext ? types[ext[1]] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  if (!isVisible || !Component || !url) return null;

  return <Component data={url} show={true} clampToGround={clampToGround} />;
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
