import { FC } from "react";

import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import useHooks from "@reearth/beta/features/Assets/hooks";
import useFileUploaderHook from "@reearth/beta/hooks/useAssetUploader/hooks";
import { Loading, Typography } from "@reearth/beta/lib/reearth-ui";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import { TabProps } from "..";
import { CommonHeader } from "../header";

import { AssetCard } from "./AssetCard";

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
