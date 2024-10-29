import { Breadcrumb, Loading, Typography } from "@reearth/beta/lib/reearth-ui";
import {
  ManagerContent,
  ManagerHeader,
  ManagerHeaderButton,
  ManagerLayout,
  ManagerWrapper
} from "@reearth/beta/ui/components/ManagerBase";
import ManagerEmptyContent from "@reearth/beta/ui/components/ManagerBase/ManagerEmptyContent";
import { useT } from "@reearth/services/i18n";
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
  size?: AssetsManagerSize;
  enableUpload?: boolean;
  enableDelete?: boolean;
  allowMultipleSelection?: boolean;
  assetsTypes?: AcceptedAssetsTypes;
  onSelectChange?: (assets: Asset[]) => void;
};

const AssetsManager: FC<AssetsManagerProps> = ({
  workspaceId,
  size = "medium",
  enableUpload = true,
  enableDelete = true,
  allowMultipleSelection = true,
  assetsTypes,
  onSelectChange
}) => {
  const {
    filteredAssets,
    paths,
    handlePathClick,
    sortValue,
    sortOptions,
    handleSortChange,
    layout,
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
    assetsTypes,
    onSelectChange
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
        layout={layout}
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
            <PathWrapper size={size}>
              <Breadcrumb
                items={paths}
                size="large"
                onClick={handlePathClick}
              />
            </PathWrapper>
            <LayoutWrapper>
              {layout === "list" && (
                <ListHeader size={size} width={contentWidth}>
                  <ThumbnailSpacer />
                  <Col width={50}>
                    <Typography weight="bold" size="body">
                      {t("Name")}
                    </Typography>
                  </Col>
                  <Col width={20}>
                    <Typography weight="bold" size="body">
                      {t("Uploaded At")}
                    </Typography>
                  </Col>
                  <Col width={20}>
                    <Typography weight="bold" size="body">
                      {t("Size")}
                    </Typography>
                  </Col>
                  <Col width={10}>
                    <Typography weight="bold" size="body">
                      {t("Path")}
                    </Typography>
                  </Col>
                </ListHeader>
              )}
              <AssetsWrapper ref={assetsWrapperRef}>
                <AssetsContent size={size} ref={assetsContentRef}>
                  {/* TODO: Group of folders */}
                  <AssetsGroup layout={layout} size={size}>
                    {filteredAssets?.map((asset) =>
                      layout === "grid" ? (
                        <AssetGridItem
                          key={asset.id}
                          asset={asset}
                          layout={layout}
                          selectedAssetIds={selectedAssetIds}
                          onSelect={handleAssetSelect}
                        />
                      ) : (
                        <AssetListItem
                          key={asset.id}
                          asset={asset}
                          layout={layout}
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
            {t("No Asset has been uploaded yet")}
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

const PathWrapper = styled("div")<{ size: AssetsManagerSize }>(
  ({ theme, size }) => ({
    padding: `0 ${size === "large" ? theme.spacing.large : theme.spacing.small}px`
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
