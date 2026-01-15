import { DatasetFormat } from "@reearth/services/plateau/graphql/types/catalog";
import { useAtom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const expandedPlateauFolderIds = atomWithReset<string[]>([]);
export const useExpandedPlateauFolderIds = () =>
  useAtom(expandedPlateauFolderIds);

export const selectedPlateauDatasetId = atomWithReset<string | null>(null);
export const useSelectedPlateauDatasetId = () =>
  useAtom(selectedPlateauDatasetId);

export const selectedPlateauDatasetItem = atomWithReset<{
  id: string;
  format: DatasetFormat;
  name: string;
  url: string;
  layers?: string[] | null;
} | null>(null);
export const useSelectedPlateauDatasetItem = () =>
  useAtom(selectedPlateauDatasetItem);
