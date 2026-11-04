import { Typography } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, KeyboardEvent } from "react";

import { LayerAsset } from "./types";
import { FORMAT_LABELS, assetFormat, formatBytes, formatDate } from "./utils";

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

// Grid view: the format name as a tile, with the file name below (and the
// CMS project above it).
export const AssetCard: FC<Props> = (props) => {
  const { asset, selected } = props;
  return (
    <Card
      selected={selected}
      {...selectableProps(props)}
      data-testid={`asset-layer-creator-card-${asset.id}`}
    >
      <CardPreview selected={selected}>{formatLabel(asset)}</CardPreview>
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

// List view: format badge, name, size and upload time. CMS assets also show
// their project and model.
export const AssetRow: FC<Props & { cms?: boolean }> = ({ cms, ...props }) => {
  const { asset, selected } = props;
  return (
    <Row
      selected={selected}
      cms={cms}
      {...selectableProps(props)}
      data-testid={`asset-layer-creator-row-${asset.id}`}
    >
      <NameCell>
        {/* GeoJSON wraps onto two lines to fit the badge. */}
        <Badge>{formatLabel(asset).replace("GeoJSON", "Geo JSON")}</Badge>
        <Ellipsis>{asset.name}</Ellipsis>
      </NameCell>
      {cms && (
        <>
          <Ellipsis>{asset.projectName}</Ellipsis>
          <Ellipsis>
            {asset.modelUrl ? (
              <ModelLink
                href={asset.modelUrl}
                target="_blank"
                rel="noreferrer"
                selected={selected}
                // Opening the model shouldn't toggle the row's selection.
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {asset.modelName}
              </ModelLink>
            ) : (
              asset.modelName
            )}
          </Ellipsis>
        </>
      )}
      <Cell>{formatBytes(asset.size)}</Cell>
      <Cell>{formatDate(asset.createdAt)}</Cell>
    </Row>
  );
};

export const LIST_COLUMNS = "1fr 120px 140px";
export const CMS_LIST_COLUMNS =
  "minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr) 80px 120px";

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
  shouldForwardProp: (prop) => prop !== "selected" && prop !== "cms"
})<{ selected: boolean; cms?: boolean }>(({ theme, selected, cms }) => ({
  display: "grid",
  gridTemplateColumns: cms ? CMS_LIST_COLUMNS : LIST_COLUMNS,
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

const ModelLink = styled("a", {
  shouldForwardProp: (prop) => prop !== "selected"
})<{ selected: boolean }>(({ theme, selected }) => ({
  color: selected ? theme.content.main : theme.select.strong,
  textDecoration: "underline"
}));
