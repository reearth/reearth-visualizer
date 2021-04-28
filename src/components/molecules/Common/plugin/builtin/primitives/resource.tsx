import React, { useMemo } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource } from "resium";

import { PrimitiveComponent } from "../../PluginPrimitive";

export type Property = {
  default?: {
    url?: string;
    type?: Type | "auto";
  };
};

type Type = "geojson" | "kml" | "czml";

export type PluginProperty = {};

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

const Resource: PrimitiveComponent<Property, PluginProperty> = ({ isVisible, property }) => {
  const url = property?.default?.url;
  const type = property?.default?.type;
  const ext = useMemo(
    () => (!type || type === "auto" ? url?.match(/\.([a-z]+?)(?:\?.*?)?$/) : undefined),
    [type, url],
  );
  const actualType = ext ? types[ext[1]] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  if (!isVisible || !Component || !url) return null;
  return <Component data={url} />;
};

export default Resource;
