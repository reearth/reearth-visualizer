import { Buffer } from "buffer";

import type {
  GeoJSON,
  GeometryObject,
  Feature as GeoJSONFeature,
  FeatureCollection,
} from "geojson";

import type { Data, DataRange, Feature } from "../../types";
import { processGeoJSON } from "../geojson";
import { f, FetchOptions, generateRandomString } from "../utils";

import { parseZip } from "./parseZip";

async function binaryAjax(url: string, type?: string): Promise<Buffer | string | false> {
  const fullUrl = type ? `${url}.${type}` : url;
  const isOptionalTxt = type === "prj" || type === "cpg";
  try {
    const resp = await fetch(fullUrl);
    if (resp.status > 399) {
      throw new Error(resp.statusText);
    }
    if (isOptionalTxt) {
      return resp.text();
    }
    const parsed = await resp.arrayBuffer();
    return Buffer.from(parsed);
  } catch (e) {
    if (isOptionalTxt || type === "dbf") {
      return false;
    }
    throw e;
  }
}

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

export default async function convertShapefileToGeoJSON(
  base: string | Buffer | ArrayBuffer,
): Promise<GeoJSON | GeoJSON[]> {
  if (typeof base !== "string") {
    return parseZip(base);
  }

  const a = await binaryAjax(base);
  if (typeof a === "string" || !a) {
    throw new Error("Failed to fetch zip file");
  }
  return parseZip(a);
}

export async function fetchShapefile(
  data: Data,
  range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  const arrayBuffer = data.url ? await (await f(data.url, options)).arrayBuffer() : data.value;
  if (!arrayBuffer) {
    throw new Error("No data provided");
  }

  const geojson = await convertShapefileToGeoJSON(arrayBuffer);

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
