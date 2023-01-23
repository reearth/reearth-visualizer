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
    if (geo.type === "MultiPoint") {
      return geo.coordinates.flatMap(coord => {
        return processGeoJSON({
          ...geojson,
          geometry: {
            type: "Point",
            coordinates: coord,
          },
        });
      });
    }
    if (geo.type === "MultiLineString") {
      return geo.coordinates.flatMap(coord => {
        return processGeoJSON({
          ...geojson,
          geometry: {
            type: "LineString",
            coordinates: coord,
          },
        });
      });
    }
    if (geo.type === "MultiPolygon") {
      return geo.coordinates.flatMap(coord => {
        return processGeoJSON({
          ...geojson,
          geometry: {
            type: "Polygon",
            coordinates: coord,
          },
        });
      });
    }

    return [
      {
        type: "feature",
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
