import { getExtname } from "@reearth/util/path";

import type { Data, DataRange, Feature } from "../types";

import { fetchCSV } from "./csv";
import { fetchGeoJSON } from "./geojson";
import { fetchGPXfile } from "./gpx";
import { fetchShapefile } from "./shapefile";

export type DataFetcher = (data: Data, range?: DataRange) => Promise<Feature[] | void>;

const registry: Record<string, DataFetcher> = {
  geojson: fetchGeoJSON,
  csv: fetchCSV,
  shapefile: fetchShapefile,
  gpx: fetchGPXfile,
};

export async function fetchData(data: Data, range?: DataRange): Promise<Feature[] | void> {
  const ext = !data.type || (data.type as string) === "auto" ? getExtname(data.url) : undefined;
  return registry[ext || data.type]?.(data, range);
}
