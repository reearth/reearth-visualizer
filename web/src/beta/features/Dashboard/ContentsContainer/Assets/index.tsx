import { FC } from "react";

import Loading from "@reearth/beta/components/Loading";
import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import useHooks from "@reearth/beta/features/Assets/hooks";
import useFileUploaderHook from "@reearth/beta/hooks/useAssetUploader/hooks";
import { Typography } from "@reearth/beta/lib/reearth-ui";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { TabProps } from "..";
import { CommonHeader } from "../header";

import { AssetCard } from "./AssetCard";

const AssetFolders = [
  {
    id: "one",
    name: "Sample one",
    icon: "folder",
  },
  {
    id: "two",
    name: "Sample two",
    icon: "folder",
  },
];

export const Assets: FC<TabProps> = ({ workspaceId, viewState, onChangeView }) => {
  const t = useT();
  const theme = useTheme();
  const {
    assets,
    assetsWrapperRef,
    isAssetsLoading: isLoading,
    hasMoreAssets,
    sortOptions,
    selectedAsset,
    handleAssetSelect,
    handleGetMoreAssets,
    onScrollToBottom,
    handleSortChange,
  } = useHooks({ workspaceId });

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
        onChangeView={onChangeView}
        onClick={handleFileUpload}
      />
      <AssetsWrapper
        ref={assetsWrapperRef}
        onScroll={e => !isLoading && hasMoreAssets && onScrollToBottom?.(e, handleGetMoreAssets)}>
        <AssetGridWrapper>
          {viewState === "grid" && (
            <>
              <Typography size="body" weight="bold" color={theme.content.weak}>
                {t("Folder")}
              </Typography>
              <AssetsRow>
                {AssetFolders?.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    icon={"folder"}
                    selectedAssetId={selectedAsset?.id}
                    onAssetSelect={handleAssetSelect}
                  />
                ))}
              </AssetsRow>
            </>
          )}
          {isLoading && <Loading />}
        </AssetGridWrapper>
        <AssetGridWrapper>
          <Typography size="body" weight="bold" color={theme.content.weak}>
            {t("Assets")}
          </Typography>
          <AssetsRow>
            {assets?.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                icon={
                  checkIfFileType(asset.url, FILE_FORMATS)
                    ? "file"
                    : checkIfFileType(asset.url, IMAGE_FORMATS)
                    ? "image"
                    : "assetNoSupport"
                }
                selectedAssetId={selectedAsset?.id}
                onAssetSelect={handleAssetSelect}
              />
            ))}
          </AssetsRow>
          {isLoading && <Loading />}
        </AssetGridWrapper>
      </AssetsWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
}));

const AssetsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  maxHeight: "calc(100vh - 24px)",
  flexDirection: "column",
  overflowY: "auto",
  gap: theme.spacing.large,
}));

const AssetGridWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
}));

const AssetsRow = styled("div")(({ theme }) => ({
  gap: theme.spacing.normal,
  padding: 0,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 160px)",
  gridTemplateRows: "repeat(auto-fill, 130px)",
}));
