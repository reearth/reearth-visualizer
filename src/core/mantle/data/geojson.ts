import type { GeoJSON } from "geojson";

import type { Data, DataRange, Feature } from "../types";

import { f, generateRandomString } from "./utils";

export async function fetchGeoJSON(data: Data, range?: DataRange): Promise<Feature[] | void> {
  const d = data.url ? await (await f(data.url)).json() : data.value;
  return processGeoJSON(d, range);
}

export function processGeoJSON(geojson: GeoJSON, range?: DataRange): Feature[] {
  if (geojson.type === "FeatureCollection") {
    return geojson.features.flatMap(f => processGeoJSON(f, range));
  }

  if (geojson.type === "Feature") {
    const geo = geojson.geometry;
    return [
      {
        id: (geojson.id && String(geojson.id)) || generateRandomString(12),
        geometry:
          geo.type === "Point" || geo.type === "LineString" || geo.type === "Polygon"
            ? geo
            : undefined,
        properties: geojson.properties,
        range,
      },
    ];
  }

  return [];
}
