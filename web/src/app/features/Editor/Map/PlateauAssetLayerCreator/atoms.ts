import { DatasetFormat } from "@reearth/services/plateau/graphql/types/catalog";
import { useAtom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const expandedIds = atomWithReset<string[]>([]);
export const useExpandedIds = () => useAtom(expandedIds);

export const selectedId = atomWithReset<string | null>(null);
export const useSelectedId = () => useAtom(selectedId);

export const selectedDatasetItem = atomWithReset<{
  id: string;
  format: DatasetFormat;
  name: string;
  url: string;
  layers?: string[] | null;
} | null>(null);
export const useSelectedDatasetItem = () => useAtom(selectedDatasetItem);
