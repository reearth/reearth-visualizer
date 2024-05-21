import { Buffer } from "buffer";

import type {
  GeoJSON,
  GeometryObject,
  Feature as GeoJSONFeature,
  FeatureCollection,
} from "geojson";
import proj4 from "proj4";

import type { Data, DataRange, Feature } from "../../types";
import { processGeoJSON } from "../geojson";
import { f, FetchOptions } from "../utils";

import { parseDbf } from "./parseDbf";
import { parseShp } from "./parseShp";
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
    console.log("ERROR", e, type);
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
      properties: dbf[i] || {},
    });
  }
  return out;
}

async function parseShapefiles(
  shpArrayBuffer: ArrayBuffer,
  dbfArrayBuffer: ArrayBuffer,
  prjString?: string,
): Promise<FeatureCollection> {
  let prj: proj4.Converter | false = false;
  try {
    if (prjString) {
      prj = proj4(prjString);
    }
  } catch (e) {
    prj = false;
  }
  const shpBuffer = Buffer.from(shpArrayBuffer);
  const dbfBuffer = Buffer.from(dbfArrayBuffer);
  const shp = parseShp(shpBuffer, prj);
  const dbf = parseDbf(dbfBuffer);
  return combine(shp, dbf);
}

export default async function convertShapefileToGeoJSON(
  base: string | Buffer | ArrayBuffer,
  whiteList?: string[],
): Promise<GeoJSON | GeoJSON[]> {
  if (typeof base !== "string") {
    return parseZip(base, whiteList);
  }
  if (base.slice(-4).toLowerCase() === ".zip") {
    const a = await binaryAjax(base);
    if (typeof a === "string" || !a) {
      throw new Error("Failed to fetch zip file");
    }
    return parseZip(a, whiteList);
  }
  const [shpBuffer, dbfBuffer, prjString] = await Promise.all([
    binaryAjax(base, "shp"),
    binaryAjax(base, "dbf"),
    binaryAjax(base, "prj"),
  ]);
  if (typeof shpBuffer === "string" || !shpBuffer || typeof dbfBuffer === "string" || !dbfBuffer) {
    throw new Error("Failed to fetch shp or dbf file");
  }
  return parseShapefiles(
    shpBuffer,
    dbfBuffer,
    typeof prjString === "string" ? prjString : undefined,
  );
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
