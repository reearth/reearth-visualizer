import type { GeometryObject, Feature as GeoJSONFeature, FeatureCollection } from "geojson";

import type { Data, DataRange, Feature } from "../../types";
import { processGeoJSON } from "../geojson";
import { f, FetchOptions, generateRandomString } from "../utils";

import { parseZip } from "./parseZip";

export async function combine(
  shp: GeoJSONFeature<GeometryObject>[],
  dbf?: any[],
): Promise<FeatureCollection> {
  const out: FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };
  const len = shp.length;
  dbf = dbf || [];
  for (let i = 0; i < len; i++) {
    out.features.push({
      type: "Feature",
      geometry: shp[i].geometry,
      id: generateRandomString(12),
      properties: dbf[i] || {},
    });
  }
  return out;
}

export async function fetchShapefile(
  data: Data,
  range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  const arrayBuffer = data.url ? await (await f(data.url, options)).arrayBuffer() : data.value;

  if (!arrayBuffer) {
    console.error("No data provided");
  }

  const geojson = await parseZip(arrayBuffer);
  if (Array.isArray(geojson)) {
    const combinedFeatureCollection: FeatureCollection = {
      type: "FeatureCollection",
      features: geojson.flatMap(layer => (layer as FeatureCollection).features),
    };
    return processGeoJSON(combinedFeatureCollection, range);
  } else {
    return processGeoJSON(geojson as FeatureCollection, range);
  }
}
