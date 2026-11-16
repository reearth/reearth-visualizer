import { Icon, Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, KeyboardEvent } from "react";

import { AssetTab, LayerAsset } from "./types";
import {
  FORMAT_LABELS,
  LIST_COLUMNS,
  assetFormat,
  formatBytes,
  formatDate
} from "./utils";

type Props = {
  asset: LayerAsset;
  selected: boolean;
  onSelect: (id: string) => void;
};

// Shortened to fit the cards and badges.
const formatLabel = (asset: LayerAsset) => {
  const format = assetFormat(asset);
  if (format === "3dtiles") return "3D";
  return format ? FORMAT_LABELS[format] : "";
};

// Cards and rows act as toggle buttons, so they are focusable and selectable
// with Enter or Space.
const selectableProps = ({ asset, selected, onSelect }: Props) => ({
  role: "button",
  tabIndex: 0,
  "aria-pressed": selected,
  title: asset.name,
  onClick: () => onSelect(asset.id),
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    onSelect(asset.id);
  }
});

// Grid view: the format name (or a folder for CMS models) as a tile, with the
// name below (and the CMS project above it).
export const AssetCard: FC<Props & { tab: AssetTab }> = ({ tab, ...props }) => {
  const t = useT();
  const { asset, selected } = props;
  return (
    <Card
      selected={selected}
      {...selectableProps(props)}
      data-testid={`asset-layer-creator-card-${asset.id}`}
    >
      <CardPreview selected={selected}>
        {tab === "cmsModels" ? (
          <>
            <Icon icon="folderSimple" size="large" />
            {t("Model")}
          </>
        ) : (
          formatLabel(asset)
        )}
      </CardPreview>
      <CardInfo>
        {asset.projectName && (
          <CardName size="footnote" color="weak">
            {asset.projectName}
          </CardName>
        )}
        <CardName size="footnote">{asset.name}</CardName>
      </CardInfo>
    </Card>
  );
};

// List view, with columns per tab (see LIST_COLUMNS):

export const AssetRow: FC<Props & { tab: AssetTab }> = ({ tab, ...props }) => {
  const { asset, selected } = props;
  const isModel = tab === "cmsModels";
  return (
    <Row
      selected={selected}
      tab={tab}
      {...selectableProps(props)}
      data-testid={`asset-layer-creator-row-${asset.id}`}
    >
      <NameCell>
        {isModel ? (
          <Badge>
            <Icon icon="folderSimple" size="small" />
          </Badge>
        ) : (
          <Badge>{formatLabel(asset).replace("GeoJSON", "Geo JSON")}</Badge>
        )}
        <Ellipsis>{asset.name}</Ellipsis>
      </NameCell>
      {tab !== "visualizer" && <Ellipsis>{asset.projectName}</Ellipsis>}
      {!isModel && <Cell>{formatBytes(asset.size)}</Cell>}
      <Cell>{formatDate(asset.createdAt)}</Cell>
    </Row>
  );
};

const Card = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected"
})<{ selected: boolean }>(({ theme, selected }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  border: `1px solid ${selected ? theme.select.main : "transparent"}`,
  cursor: css.cursor.pointer,
  borderRadius: theme.radius.small,
  overflow: css.overflow.hidden,
  boxShadow: "2px 2px 2px 0 rgba(0, 0, 0, 0.25)"
}));

const CardPreview = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected"
})<{ selected: boolean }>(({ theme, selected }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  gap: theme.spacing.smallest,
  minHeight: 80,
  fontSize: theme.fonts.sizes.h5,
  fontWeight: theme.fonts.weight.bold,
  background: selected ? theme.select.main : theme.bg[2]
}));

const CardInfo = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`
}));

const CardName = styled(Typography)(() => ({
  whiteSpace: css.whiteSpace.nowrap,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis
}));

const Row = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected" && prop !== "tab"
})<{ selected: boolean; tab: AssetTab }>(({ theme, selected, tab }) => ({
  display: "grid",
  gridTemplateColumns: LIST_COLUMNS[tab],
  alignItems: css.alignItems.center,
  gap: theme.spacing.normal,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.small,
  background: selected ? theme.select.main : "transparent",
  cursor: css.cursor.pointer
}));

const NameCell = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  minWidth: 0
}));

const Badge = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  flexShrink: 0,
  width: 24,
  height: 24,
  borderRadius: theme.radius.small,
  background: theme.bg[3],
  color: theme.content.main,
  fontSize: 8,
  fontWeight: theme.fonts.weight.bold,
  lineHeight: 1,
  textAlign: "center"
}));

const Cell = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.footnote,
  whiteSpace: css.whiteSpace.nowrap
}));

const Ellipsis = styled(Cell)(() => ({
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis
}));
