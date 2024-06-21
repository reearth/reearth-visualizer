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
      <AssetsContainer
        ref={assetsWrapperRef}
        onScroll={e => !isLoading && hasMoreAssets && onScrollToBottom?.(e, handleGetMoreAssets)}>
        <AssetsContant>
          <Typography size="body" weight="bold" color={theme.content.weak}>
            {t("Folder")}
          </Typography>
          {viewState === "grid" && (
            <AssetsRow viewState={viewState}>
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
          )}
          {isLoading && <Loading />}
        </AssetsContant>
        <AssetsContant>
          <Typography size="body" weight="bold" color={theme.content.weak}>
            {t("Assets")}
          </Typography>
          {viewState === "grid" && (
            <AssetsRow viewState={viewState}>
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
          )}
          {isLoading && <Loading />}
        </AssetsContant>
      </AssetsContainer>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  gap: theme.spacing.large,
}));

const AssetsContainer = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  height: "100%",
  flexDirection: "column",
  overflow: "auto",
  gap: theme.spacing.large,
}));

const AssetsContant = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
}));

const AssetsRow = styled("div")<{ viewState: string }>(({ theme, viewState }) => ({
  display: viewState === "grid" ? "flex" : " ",
  flexWrap: "wrap",
  gap: theme.spacing.normal,
}));
