import { useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource } from "resium";

import type { LegacyResourceAppearance } from "../../..";
import { type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;
export type Property = LegacyResourceAppearance;
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

export default function Resource({ isVisible, property }: Props) {
  const { url, type, clampToGround } = property ?? {};
  const ext = useMemo(
    () => (!type || type === "auto" ? url?.match(/\.([a-z]+?)(?:\?.*?)?$/) : undefined),
    [type, url],
  );
  const actualType = ext ? types[ext[1]] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  if (!isVisible || !Component || !url) return null;

  return <Component data={url} clampToGround={clampToGround} />;
}

export const config: FeatureComponentConfig = {};
