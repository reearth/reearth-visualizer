import type { Data, DataRange, Feature } from "../types";

import { fetchCSV } from "./csv";
import { fetchGeoJSON } from "./geojson";

export type DataFetcher = (data: Data, range?: DataRange) => Promise<Feature[] | void>;

const registry: Record<string, DataFetcher> = {
  geojson: fetchGeoJSON,
  csv: fetchCSV,
};

export async function fetchData(data: Data, range?: DataRange): Promise<Feature[] | void> {
  return registry[data.type]?.(data, range);
}
