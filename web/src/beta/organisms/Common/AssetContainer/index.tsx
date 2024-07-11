import React, { useEffect, useCallback } from "react";

import MoleculeAssetContainer, {
  Asset as AssetType,
  Props as AssetContainerProps,
} from "@reearth/beta/molecules/Common/AssetModal/AssetContainer";

import useHooks from "./hooks";

export type Asset = AssetType;

export type Props = AssetContainerProps;

const AssetContainer: React.FC<Props> = ({
  workspaceId,
  initialAssetUrl,
  onAssetUrlSelect,
  videoOnly,
  smallCardOnly,
  allowDeletion,
  height,
  isMultipleSelectable,
  onURLShow,
}) => {
  const {
    assets,
    initialAsset,
    isLoading,
    hasMoreAssets,
    sort,
    searchTerm,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
    removeAssets,
  } = useHooks(workspaceId, initialAssetUrl, allowDeletion);

  useEffect(() => {
    onURLShow?.(assets);
  }, [assets, onURLShow]);

  useEffect(() => {
    if (initialAsset) {
      selectAsset([initialAsset]);
    }
  }, [selectAsset, initialAsset]);

  const handleSelect = useCallback(
    (asset?: Asset) => {
      if (!asset) return;
      if (selectedAssets.includes(asset)) {
        selectAsset(selectedAssets.filter(a => a !== asset));
      } else if (isMultipleSelectable) {
        selectAsset(assets => [...assets, asset]);
      } else {
        selectAsset([asset]);
        onAssetUrlSelect?.(asset.url);
      }
    },
    [isMultipleSelectable, selectedAssets, selectAsset, onAssetUrlSelect],
  );

  return (
    <MoleculeAssetContainer
      assets={assets}
      initialAsset={initialAsset}
      selectedAssets={selectedAssets}
      isLoading={isLoading}
      isMultipleSelectable={isMultipleSelectable}
      videoOnly={videoOnly}
      height={height}
      hasMoreAssets={hasMoreAssets}
      sort={sort}
      searchTerm={searchTerm}
      smallCardOnly={smallCardOnly}
      onCreateAssets={createAssets}
      onRemove={removeAssets}
      onGetMore={handleGetMoreAssets}
      onSelect={handleSelect}
      onSortChange={handleSortChange}
      onSearch={handleSearchTerm}
    />
  );
};

export default AssetContainer;
