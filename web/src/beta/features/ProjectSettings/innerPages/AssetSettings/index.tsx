import { useCallback } from "react";

import useHooks from "@reearth/beta/features/Assets/AssetHooks/hooks";
import { Asset } from "@reearth/beta/features/Assets/types";

import { InnerPage } from "../common";

import AssetContainer from "./AssetContainer";

type Props = {
  workspaceId?: string;
};

const AssetSettings: React.FC<Props> = ({ workspaceId }) => {
  const {
    assets,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    handleSortChange,
  } = useHooks({ workspaceId });

  const handleSelect = useCallback(
    (asset?: Asset) => {
      if (!asset) return;
      if (selectedAssets.includes(asset)) {
        selectAsset(selectedAssets.filter(a => a !== asset));
      } else {
        selectAsset(assets => [...assets, asset]);
      }
    },
    [selectedAssets, selectAsset],
  );

  return (
    <InnerPage wide transparent>
      <AssetContainer
        assets={assets}
        selectedAssets={selectedAssets}
        isLoading={isLoading}
        hasMoreAssets={hasMoreAssets}
        sort={sort}
        searchTerm={searchTerm}
        onGetMore={handleGetMoreAssets}
        onSelect={handleSelect}
        onSortChange={handleSortChange}
      />
    </InnerPage>
  );
};

export default AssetSettings;
