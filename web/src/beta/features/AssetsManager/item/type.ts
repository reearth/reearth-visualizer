import { ManagerLayout } from "@reearth/beta/ui/components/ManagerBase";

import { Asset } from "../types";

export type AssetItemProps = {
  asset: Asset;
  selectedAssetIds: string[];
  layout: ManagerLayout;
  onSelect: (assetId: string) => void;
};
