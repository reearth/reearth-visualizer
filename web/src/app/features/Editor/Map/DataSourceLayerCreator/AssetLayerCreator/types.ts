import { Asset } from "@reearth/app/features/AssetsManager/types";
import { AssetSortField, SortDirection } from "@reearth/services/gql";

import { LayerFormat } from "./utils";

export type AssetTab = "visualizer" | "cmsAssets" | "cmsModels";

export type AssetLayout = "grid" | "list";

export const SORTS = {
  "date-desc": { field: AssetSortField.Date, direction: SortDirection.Desc },
  "date-asc": { field: AssetSortField.Date, direction: SortDirection.Asc },
  "name-asc": { field: AssetSortField.Name, direction: SortDirection.Asc },
  "name-desc": { field: AssetSortField.Name, direction: SortDirection.Desc },
  "size-asc": { field: AssetSortField.Size, direction: SortDirection.Asc },
  "size-desc": { field: AssetSortField.Size, direction: SortDirection.Desc }
};
export type SortKey = keyof typeof SORTS;

// CMS assets also carry their format, whether they are private (their URL
// needs CMS credentials), and the CMS project and model they belong to.
export type LayerAsset = Asset & {
  format?: LayerFormat;
  private?: boolean;
  projectName?: string;
  modelName?: string;
  modelUrl?: string;
};

// What each tab provides to the shared asset browser.
export type AssetSource = {
  assets: LayerAsset[];
  loading: boolean;
  loadMore: () => void;
  // Some of the source's items couldn't be loaded (e.g. a CMS project).
  incomplete?: boolean;
  // Uploads one file and resolves to the new asset's id. Omitted for sources
  // that can't be uploaded to (hides Upload and disables drag and drop).
  uploadFile?: (file: File) => Promise<string | undefined>;
};
