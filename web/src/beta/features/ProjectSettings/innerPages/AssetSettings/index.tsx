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
    wrapperRef,
    isLoading,
    hasMoreAssets,
    searchTerm,
    localSearchTerm,
    deleteModalVisible,
    selectedAssets,
    selectAsset,
    onGetMoreAssets,
    onSortChange,
    onScrollToBottom,
    onSearchInputChange,
    onSearch,
    openDeleteModal,
    closeDeleteModal,
    onRemove,
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
        wrapperRef={wrapperRef}
        selectedAssets={selectedAssets}
        isLoading={isLoading}
        openDeleteModal={openDeleteModal}
        deleteModalVisible={deleteModalVisible}
        hasMoreAssets={hasMoreAssets}
        searchTerm={searchTerm}
        localSearchTerm={localSearchTerm}
        onGetMore={onGetMoreAssets}
        onSelect={handleSelect}
        onSortChange={onSortChange}
        onScrollToBottom={onScrollToBottom}
        closeDeleteModal={closeDeleteModal}
        handleRemove={onRemove}
        handleSearch={onSearch}
        handleSearchInputChange={onSearchInputChange}
      />
    </InnerPage>
  );
};

export default AssetSettings;
