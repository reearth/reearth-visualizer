import { useCallback } from "react";

import useHooks from "@reearth/beta/features/Assets/hooks";
import { Asset } from "@reearth/beta/features/Assets/types";

import { InnerPage } from "../common";

import AssetContainer from "./AssetContainer";

type Props = {
  workspaceId?: string;
};

const AssetSettings: React.FC<Props> = ({ workspaceId }) => {
  const {
    assets,
    assetsWrapperRef,
    isAssetsLoading,
    hasMoreAssets,
    searchTerm,
    localSearchTerm,
    deleteModalVisible,
    selectedAssets,
    selectAsset,
    handleGetMoreAssets,
    handleSortChange,
    onScrollToBottom,
    handleSearchInputChange,
    handleSearch,
    openDeleteModal,
    closeDeleteModal,
    handleRemove,
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
        workspaceId={workspaceId}
        assets={assets}
        wrapperRef={assetsWrapperRef}
        selectedAssets={selectedAssets}
        isLoading={isAssetsLoading}
        openDeleteModal={openDeleteModal}
        deleteModalVisible={deleteModalVisible}
        hasMoreAssets={hasMoreAssets}
        searchTerm={searchTerm}
        localSearchTerm={localSearchTerm}
        onGetMore={handleGetMoreAssets}
        onSelect={handleSelect}
        onSortChange={handleSortChange}
        onScrollToBottom={onScrollToBottom}
        closeDeleteModal={closeDeleteModal}
        handleRemove={handleRemove}
        handleSearch={handleSearch}
        handleSearchInputChange={handleSearchInputChange}
      />
    </InnerPage>
  );
};

export default AssetSettings;
