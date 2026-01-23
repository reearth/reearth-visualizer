import { ManagerLayout } from "@reearth/app/ui/components/ManagerBase";

import { Asset } from "../types";

export type AssetItemProps = {
  asset: Asset;
  selectedAssetIds: string[];
  layout: ManagerLayout;
  onSelect: (assetId: string) => void;
};
