import React, { useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource } from "resium";

import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    url?: string;
    type?: Type | "auto";
    clampToGround?: boolean;
  };
};

type Type = "geojson" | "kml" | "czml";

const types: Record<string, Type> = {
  kml: "kml",
  geojson: "geojson",
  czml: "czml",
};

const comps = {
  kml: KmlDataSource,
  czml: CzmlDataSource,
  geojson: GeoJsonDataSource,
};

const Resource: React.FC<Props> = ({ layer }) => {
  const { isVisible, property } = layer ?? {};
  const { url, type, clampToGround } = property?.default ?? {};
  const ext = useMemo(
    () => (!type || type === "auto" ? url?.match(/\.([a-z]+?)(?:\?.*?)?$/) : undefined),
    [type, url],
  );
  const actualType = ext ? types[ext[1]] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  if (!isVisible || !Component || !url) return null;

  return <Component data={url} clampToGround={clampToGround} />;
};

export default Resource;
