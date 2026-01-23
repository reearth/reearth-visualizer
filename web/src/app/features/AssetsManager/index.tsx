import { Loading, Typography } from "@reearth/app/lib/reearth-ui";
import {
  ManagerContent,
  ManagerHeader,
  ManagerHeaderButton,
  ManagerLayout,
  ManagerWrapper
} from "@reearth/app/ui/components/ManagerBase";
import ManagerEmptyContent from "@reearth/app/ui/components/ManagerBase/ManagerEmptyContent";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import { AcceptedAssetsTypes } from "./constants";
import useHooks from "./hooks";
import AssetGridItem from "./item/AssetGridItem";
import AssetListItem from "./item/AssetListItem";
import { Asset } from "./types";

export type AssetsManagerSize = "medium" | "large";

export type AssetsManagerProps = {
  workspaceId?: string;
  projectId?: string;
  size?: AssetsManagerSize;
  enableUpload?: boolean;
  enableDelete?: boolean;
  allowMultipleSelection?: boolean;
  assetsTypes?: AcceptedAssetsTypes;
  layout?: ManagerLayout;
  additionalFilter?: (asset: Asset) => boolean;
  onSelectChange?: (assets: Asset[]) => void;
  onLayoutChange?: (layout: ManagerLayout) => void;
};

const AssetsManager: FC<AssetsManagerProps> = ({
  workspaceId,
  projectId,
  size = "medium",
  enableUpload = true,
  enableDelete = true,
  allowMultipleSelection = true,
  assetsTypes,
  layout,
  additionalFilter,
  onSelectChange,
  onLayoutChange
}) => {
  const {
    filteredAssets,
    sortValue,
    sortOptions,
    handleSortChange,
    localLayout,
    handleLayoutChange,
    selectedAssetIds,
    handleAssetSelect,
    handleAssetDelete,
    assetsWrapperRef,
    assetsContentRef,
    handleSearch,
    handleAssetUpload,
    contentWidth,
    loading,
    loadingMore
  } = useHooks({
    allowMultipleSelection,
    workspaceId,
    projectId,
    assetsTypes,
    layout,
    additionalFilter,
    onSelectChange,
    onLayoutChange
  });
  const t = useT();
  const theme = useTheme();
  return (
    <ManagerWrapper onClick={() => handleAssetSelect(undefined)}>
      <ManagerHeader
        size={size}
        actions={[
          enableUpload && (
            <ManagerHeaderButton
              key={"upload-file"}
              title={t("Upload File")}
              managerSize={size}
              icon="uploadSimple"
              onClick={handleAssetUpload}
            />
          )
        ]}
        sortValue={sortValue}
        sortOptions={sortOptions}
        onSortChange={handleSortChange}
        layout={localLayout}
        onLayoutChange={handleLayoutChange}
        showSearch
        searchPlaceholder={t("Search in all assets library")}
        enableDelete={enableDelete}
        deleteText={`${selectedAssetIds.length} ${
          selectedAssetIds.length > 1
            ? t("Assets selected")
            : t("Asset selected")
        }`}
        selectedIds={selectedAssetIds}
        onCancelSelect={() => handleAssetSelect(undefined)}
        onDelete={handleAssetDelete}
        onSearch={handleSearch}
      />

      {filteredAssets?.length ? (
        <ManagerContent>
          <ContentWrapper size={size}>
            <LayoutWrapper>
              {localLayout === "list" && (
                <ListHeader size={size} width={contentWidth}>
                  <ThumbnailSpacer />
                  <Col width={45}>
                    <Typography
                      weight="bold"
                      size="body"
                      color={theme.content.weak}
                    >
                      {t("Name")}
                    </Typography>
                  </Col>
                  <Col width={20}>
                    <Typography
                      weight="bold"
                      size="body"
                      color={theme.content.weak}
                    >
                      {t("Uploaded At")}
                    </Typography>
                  </Col>
                  <Col width={10}>
                    <Typography
                      weight="bold"
                      size="body"
                      color={theme.content.weak}
                    >
                      {t("Size")}
                    </Typography>
                  </Col>
                  <Col width={20}>
                    <Typography
                      weight="bold"
                      size="body"
                      color={theme.content.weak}
                    >
                      {t("Path")}
                    </Typography>
                  </Col>
                </ListHeader>
              )}
              <AssetsWrapper ref={assetsWrapperRef}>
                <AssetsContent size={size} ref={assetsContentRef}>
                  {/* TODO: Group of folders */}
                  <AssetsGroup layout={localLayout} size={size}>
                    {filteredAssets?.map((asset) =>
                      localLayout === "grid" ? (
                        <AssetGridItem
                          key={asset.id}
                          asset={asset}
                          layout={localLayout}
                          selectedAssetIds={selectedAssetIds}
                          onSelect={handleAssetSelect}
                        />
                      ) : (
                        <AssetListItem
                          key={asset.id}
                          asset={asset}
                          layout={localLayout}
                          selectedAssetIds={selectedAssetIds}
                          onSelect={handleAssetSelect}
                        />
                      )
                    )}
                  </AssetsGroup>
                </AssetsContent>
                {loadingMore && (
                  <LoadingWrapper>
                    <Loading relative />
                  </LoadingWrapper>
                )}
              </AssetsWrapper>
            </LayoutWrapper>
          </ContentWrapper>
        </ManagerContent>
      ) : loading ? (
        <LoadingWrapper>
          <Loading relative />
        </LoadingWrapper>
      ) : (
        <ManagerEmptyContent>
          <Typography size="h5" color={theme.content.weak}>
            {t("No asset has been uploaded yet")}
          </Typography>
        </ManagerEmptyContent>
      )}
    </ManagerWrapper>
  );
};

export default AssetsManager;

const ContentWrapper = styled("div")<{ size: AssetsManagerSize }>(
  ({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.normal,
    flex: 1,
    height: 0
  })
);

const AssetsWrapper = styled("div")(() => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: 0,
  overflow: "auto"
}));

const AssetsContent = styled("div")<{ size: AssetsManagerSize }>(
  ({ theme, size }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing.normal,
    padding: `${theme.spacing.smallest}px ${
      size === "large" ? theme.spacing.large : theme.spacing.small
    }px ${size === "large" ? theme.spacing.large : theme.spacing.small}px`
  })
);

const LayoutWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: 0
}));

const AssetsGroup = styled("div")<{
  layout: ManagerLayout;
  size: AssetsManagerSize;
}>(({ theme, layout, size }) => ({
  ...(layout === "grid"
    ? {
        display: "grid",
        gap: theme.spacing.normal,
        gridTemplateColumns: `repeat(auto-fill, minmax(${size === "medium" ? 96 : 144}px, 1fr))`
      }
    : {}),
  ...(layout === "list"
    ? {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.small
      }
    : {})
}));

const ListHeader = styled("div")<{ size: AssetsManagerSize; width: number }>(
  ({ theme, size, width }) => ({
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    padding: `${theme.spacing.smallest}px ${
      (size === "large" ? theme.spacing.large : theme.spacing.small) +
      theme.spacing.smallest
    }px`,
    gap: theme.spacing.small,
    width: width === 0 ? "100%" : width
  })
);

const ThumbnailSpacer = styled("div")(() => ({
  width: 20,
  flexShrink: 0
}));

const Col = styled("div")<{ width: number }>(({ width }) => ({
  width: `${width}%`,
  flexGrow: 0,
  flexShrink: 0
}));

const LoadingWrapper = styled("div")(() => ({
  width: "100%",
  height: 100,
  paddingBottom: 40
}));
