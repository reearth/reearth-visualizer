import { getExtname } from "@reearth/util/path";

import type { Data, DataRange, Feature } from "../types";

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
  const ext = !data.type || (data.type as string) === "auto" ? getExtname(data.url) : undefined;
  return registry[ext || data.type]?.(data, range, options);
}
