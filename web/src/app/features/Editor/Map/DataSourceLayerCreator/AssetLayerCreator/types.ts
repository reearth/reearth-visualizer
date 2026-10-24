import { Asset } from "@reearth/app/features/AssetsManager/types";
import { AssetSortField, SortDirection } from "@reearth/services/gql";

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

// What each tab provides to the shared asset browser.
export type AssetSource = {
  assets: Asset[];
  loading: boolean;
  loadMore: () => void;
  // Omitted for sources that can't be uploaded to (hides the Upload button).
  upload?: () => void;
};
