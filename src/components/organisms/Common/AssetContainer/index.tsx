import React, { useEffect, useMemo, useCallback } from "react";

import MoleculeAssetContainer, {
  Asset as AssetType,
  Props as AssetContainerProps,
} from "@reearth/components/molecules/Common/AssetModal/AssetContainer";

import useHooks from "./hooks";

export type Asset = AssetType;

export type Props = AssetContainerProps;

const AssetContainer: React.FC<Props> = ({
  teamId,
  initialAssetUrl,
  onAssetUrlSelect,
  fileType,
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
    getMoreAssets,
    createAssets,
    handleSortChange,
    handleSearchTerm,
    removeAssets,
  } = useHooks(teamId, initialAssetUrl, allowDeletion);

  useEffect(() => {
    onURLShow?.(assets);
  }, [assets, onURLShow]);

  useEffect(() => {
    if (initialAsset) {
      selectAsset([initialAsset]);
    }
  }, [selectAsset, initialAsset]);

  const filteredAssets = useMemo(() => {
    if (!assets) return;
    return assets.filter(
      a =>
        !fileType ||
        a.url.match(fileType === "image" ? /\.(jpg|jpeg|png|gif|webp|svg)$/ : /\.(mp4|webm)$/),
    );
  }, [assets, fileType]);

  const accept =
    fileType === "image"
      ? "image/*"
      : fileType === "video"
      ? "video/*"
      : fileType
      ? "*/*"
      : undefined;

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
      assets={filteredAssets}
      initialAsset={initialAsset}
      selectedAssets={selectedAssets}
      isLoading={isLoading}
      isMultipleSelectable={isMultipleSelectable}
      accept={accept}
      fileType={fileType}
      height={height}
      hasMoreAssets={hasMoreAssets}
      sort={sort}
      searchTerm={searchTerm}
      smallCardOnly={smallCardOnly}
      onCreateAssets={createAssets}
      onRemove={removeAssets}
      onGetMore={getMoreAssets}
      onSelect={handleSelect}
      onSortChange={handleSortChange}
      onSearch={handleSearchTerm}
    />
  );
};

export default AssetContainer;
