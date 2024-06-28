import { FC, useCallback, useMemo, useState } from "react";

import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import useAssets from "@reearth/beta/features/Assets/hooks";
import useFileUploaderHook from "@reearth/beta/hooks/useAssetUploader/hooks";
import { Loading } from "@reearth/beta/lib/reearth-ui";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import CommonHeader from "../CommonHeader";

import AssetCard from "./AssetCard";

const ASSETS_VIEW_STATE_STORAGE_KEY = `reearth-visualizer-dashboard-asset-view-state`;

const Assets: FC<{ workspaceId?: string }> = ({ workspaceId }) => {
  const t = useT();

  const [viewState, setViewState] = useState(
    localStorage.getItem(ASSETS_VIEW_STATE_STORAGE_KEY)
      ? localStorage.getItem(ASSETS_VIEW_STATE_STORAGE_KEY)
      : "grid",
  );
  const handleViewStateChange = useCallback((newView?: string) => {
    if (!newView) return;
    localStorage.setItem(ASSETS_VIEW_STATE_STORAGE_KEY, newView);
    setViewState(newView);
  }, []);

  const {
    assets,
    assetsWrapperRef,
    isAssetsLoading: isLoading,
    hasMoreAssets,
    sortOptions,
    selectedAssets,
    handleGetMoreAssets,
    onScrollToBottom,
    handleSortChange,
    selectAsset,
  } = useAssets({ workspaceId });

  const selectedAssetsIds = useMemo(() => selectedAssets.map(a => a.id), [selectedAssets]);

  const { handleFileUpload } = useFileUploaderHook({
    workspaceId: workspaceId,
  });

  return (
    <Wrapper>
      <CommonHeader
        viewState={viewState || ""}
        title={t("Upload File")}
        icon="uploadSimple"
        options={sortOptions}
        onSortChange={handleSortChange}
        onChangeView={handleViewStateChange}
        onClick={handleFileUpload}
      />
      <AssetsWrapper
        ref={assetsWrapperRef}
        onScroll={e => !isLoading && hasMoreAssets && onScrollToBottom?.(e, handleGetMoreAssets)}>
        <AssetGridWrapper>
          <AssetsRow>
            {assets?.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAssetsIds.includes(asset.id)}
                icon={
                  checkIfFileType(asset.url, FILE_FORMATS)
                    ? "file"
                    : checkIfFileType(asset.url, IMAGE_FORMATS)
                    ? "image"
                    : "assetNoSupport"
                }
                onAssetSelect={selectAsset}
              />
            ))}
          </AssetsRow>
          {isLoading && <Loading />}
        </AssetGridWrapper>
      </AssetsWrapper>
    </Wrapper>
  );
};

export default Assets;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing.largest,
  gap: theme.spacing.large,
}));

const AssetsWrapper = styled("div")(() => ({
  display: "flex",
  maxHeight: "calc(100vh - 76px)",
  flexDirection: "column",
  overflowY: "auto",
}));

const AssetGridWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
}));

const AssetsRow = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing.normal,
  gridTemplateColumns: "repeat(7, 1fr)",

  "@media (max-width: 1200px)": {
    gridTemplateColumns: "repeat(5, 1fr)",
  },
  "@media (max-width: 900px)": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  "@media (max-width: 600px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
}));
