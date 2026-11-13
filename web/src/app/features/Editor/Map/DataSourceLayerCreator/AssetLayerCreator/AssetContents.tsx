import {
  Icon,
  Loading,
  Selector,
  Typography
} from "@reearth/app/lib/reearth-ui";
import {
  ManagerHeader,
  ManagerHeaderButton
} from "@reearth/app/ui/components/ManagerBase";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, RefObject } from "react";

import { AssetCard, AssetRow } from "./AssetItem";
import { AssetLayout, AssetTab, LayerAsset } from "./types";
import { LIST_COLUMNS } from "./utils";

type Option = { value: string; label: string };

type Props = {
  assets: LayerAsset[];
  loading: boolean;
  // Notes that some items couldn't be loaded.
  incomplete?: boolean;
  wrapperRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  layout: AssetLayout;
  formatFilter: string;
  formatOptions: Option[];
  // Picks the list columns; CMS tabs also add a project filter.
  tab: AssetTab;
  projectFilter: string;
  projectOptions: Option[];
  sort: string;
  sortOptions: Option[];
  selectedId?: string;
  // Hides the Upload button when the source can't be uploaded to.
  onUpload?: () => void;
  onLayoutChange: (layout: AssetLayout) => void;
  onSearch: (keyword?: string) => void;
  onFormatFilterChange: (value: string | string[]) => void;
  onProjectFilterChange: (value: string | string[]) => void;
  onSortChange: (value: string) => void;
  onSelect: (id: string) => void;
};

// The toolbar and grid/list of assets, shared by every tab.
const AssetContents: FC<Props> = ({
  assets,
  loading,
  incomplete,
  wrapperRef,
  contentRef,
  layout,
  formatFilter,
  formatOptions,
  tab,
  projectFilter,
  projectOptions,
  sort,
  sortOptions,
  selectedId,
  onUpload,
  onLayoutChange,
  onSearch,
  onFormatFilterChange,
  onProjectFilterChange,
  onSortChange,
  onSelect
}) => {
  const t = useT();
  const theme = useTheme();

  return (
    <>
      <ManagerHeader
        size="medium"
        iconSize="medium"
        actionsPosition="end"
        actions={[
          onUpload && (
            <ManagerHeaderButton
              key="upload-file"
              title={t("Upload")}
              managerSize="medium"
              icon="uploadSimple"
              onClick={onUpload}
            />
          )
        ]}
        sortValue={sort}
        sortOptions={sortOptions}
        onSortChange={onSortChange}
        layout={layout}
        borderedLayoutButtons
        onLayoutChange={onLayoutChange}
        showSearch
        searchPlaceholder={t("Search by the name")}
        onSearch={onSearch}
        filters={
          <Filters>
            {/* CMS models only come as GeoJSON. */}
            {tab !== "cmsModels" && (
              <Filter>
                <Selector
                  value={formatFilter}
                  options={formatOptions}
                  onChange={onFormatFilterChange}
                  dataTestid="asset-layer-creator-format"
                />
              </Filter>
            )}
            {tab !== "visualizer" && (
              <Filter>
                <Selector
                  value={projectFilter}
                  options={projectOptions}
                  onChange={onProjectFilterChange}
                  dataTestid="asset-layer-creator-project"
                />
              </Filter>
            )}
          </Filters>
        }
      />

      <AssetsArea>
        {incomplete && !loading && (
          <Notice data-testid="asset-layer-creator-incomplete">
            <Icon icon="warning" size="small" color={theme.warning.main} />
            <Typography size="footnote" color={theme.content.weak}>
              {t("Some items could not be loaded from CMS.")}
            </Typography>
          </Notice>
        )}
        {layout === "list" && !loading && !!assets.length && (
          <ListHeaderWrapper>
            <ListHeader tab={tab}>
              <span>{t("Name")}</span>
              {tab !== "visualizer" && <span>{t("Project")}</span>}
              {tab !== "cmsModels" && <span>{t("Size")}</span>}
              <span>
                {tab === "cmsModels" ? t("Created") : t("Uploaded at")}
              </span>
            </ListHeader>
          </ListHeaderWrapper>
        )}
        <AssetsContentWrapper ref={wrapperRef}>
          {loading ? (
            <Loading relative />
          ) : !assets.length ? (
            <NotFound>
              <Icon
                icon="searchNotFound"
                size={50}
                color={theme.content.weak}
              />
              <Typography size="h5">{t("No assets found")}</Typography>
              <Typography size="body" color={theme.content.weak}>
                {t("Try adjusting your search or filters")}
              </Typography>
            </NotFound>
          ) : layout === "grid" ? (
            <Grid ref={contentRef}>
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  tab={tab}
                  selected={asset.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </Grid>
          ) : (
            <List ref={contentRef}>
              {assets.map((asset) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  tab={tab}
                  selected={asset.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </List>
          )}
        </AssetsContentWrapper>
      </AssetsArea>
    </>
  );
};

const Filters = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  flexShrink: 0
}));

const Notice = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.smallest,
  padding: `0 ${theme.spacing.small}px ${theme.spacing.small}px`
}));

const Filter = styled("div")(() => ({
  width: 150
}));

const AssetsArea = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  padding: theme.spacing.small,
  height: 440
}));

// Only the assets scroll. The gutter keeps the scrollbar's space reserved, so
// cards don't shift or touch it, and the padding leaves room for the cards'
// shadow.
const AssetsContentWrapper = styled("div")(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflowY: css.overflow.auto,
  scrollbarGutter: "stable",
  padding: `${theme.spacing.micro}px ${theme.spacing.small}px ${theme.spacing.micro}px ${theme.spacing.micro}px`,
  boxSizing: css.boxSizing.borderBox,
  ...theme.scrollBar
}));

// Same horizontal padding and reserved scrollbar gutter as the scroll area,
// so the header's columns line up with the rows below.
const ListHeaderWrapper = styled("div")(({ theme }) => ({
  overflowY: css.overflow.hidden,
  scrollbarGutter: "stable",
  padding: `0 ${theme.spacing.small}px 0 ${theme.spacing.micro}px`,
  flexShrink: 0,
  ...theme.scrollBar
}));

const Grid = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: theme.spacing.small
}));

const List = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro
}));

const ListHeader = styled("div", {
  shouldForwardProp: (prop) => prop !== "tab"
})<{ tab: AssetTab }>(({ theme, tab }) => ({
  display: "grid",
  gridTemplateColumns: LIST_COLUMNS[tab],
  gap: theme.spacing.normal,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.footnote
}));

const NotFound = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  height: "50%"
}));

export default AssetContents;
