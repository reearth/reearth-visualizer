import type { Data, DataRange, DataType, Feature } from "../types";

import { fetchCSV } from "./csv";
import { fetchGeoJSON } from "./geojson";
import { fetchGeoRSS } from "./georss";
import { fetchGMLData } from "./gml";
import { fetchGPXfile } from "./gpx";
import { fetchGTFS } from "./gtfs";
import { fetchShapefile } from "./shapefile";
import { FetchOptions } from "./utils";

export type DataFetcher = (
  data: Data,
  range?: DataRange,
  options?: FetchOptions,
) => Promise<Feature[] | void>;

const registry: Record<string, DataFetcher> = {
  geojson: fetchGeoJSON,
  csv: fetchCSV,
  shapefile: fetchShapefile,
  gpx: fetchGPXfile,
  gtfs: fetchGTFS,
  georss: fetchGeoRSS,
  gml: fetchGMLData,
};

export async function fetchData(
  data: Data,
  range?: DataRange,
  options?: FetchOptions,
): Promise<Feature[] | void> {
  const ext = !data.type || (data.type as string) === "auto" ? guessType(data.url) : undefined;
  return registry[ext || data.type]?.(data, range, options);
}

export function guessType(url: string | undefined): DataType | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const path = new URL(url).pathname
      .split("/")
      .map(p => (p === "%7Bz%7D" ? "{z}" : p === "%7Bx%7D" ? "{x}" : p === "%7By%7D" ? "{y}" : p));

    const file = path[path.length - 1];
    if (file === "tileset.json") {
      return "3dtiles";
    }

    const ext = file.split(".")[1];
    if (extensions[ext]) {
      return extensions[ext];
    }

    if (path.findIndex(p => p === "{z}") >= 0) {
      return "tiles";
    }

    return ext as DataType;
  } catch {
    return undefined;
  }
}

const extensions: Record<string, DataType> = {
  json: "geojson",
  topojson: "geojson",
  mvt: "mvt", // If this is missing, {z} will be detected and return value will be "tiles", but it's wrong.
  kmz: "kml",
  glb: "gltf",
};
