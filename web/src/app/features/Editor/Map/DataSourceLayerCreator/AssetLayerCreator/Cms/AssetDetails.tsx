import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating
} from "@floating-ui/react";
import {
  Icon,
  IconButton,
  IconName,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode, useEffect, useState } from "react";

import Spinner from "../Spinner";
import { AssetTab, LayerAsset } from "../types";
import { FORMAT_LABELS, assetFormat, formatBytes } from "../utils";

import { Shape, loadPreview, quickPreview, shapePaths } from "./preview";

type Props = {
  asset: LayerAsset;
  tab: AssetTab;
  // The card it belongs to.
  reference: HTMLElement;
  onClose: () => void;
};

const BOX = { width: 284, height: 90 };
const MIN_LOADING_MS = 1000;

// A CMS asset's or model's details, opened from its card's info button: a
// preview of its data, and a link to it in CMS. Shown to the right of the
// card, or to the left when there's no room.
const AssetDetails: FC<Props> = ({ asset, tab, reference, onClose }) => {
  const t = useT();
  const theme = useTheme();
  const { refs, floatingStyles } = useFloating({
    placement: "right-start",
    elements: { reference },
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ fallbackPlacements: ["left-start"] }),
      shift({ padding: 8 })
    ]
  });

  // Loaded again only when what the preview is made from changes.
  const isModel = tab === "cmsModels";
  const { url, size, private: isPrivate, format } = asset;
  const [preview, setPreview] = useState(() => quickPreview(asset, isModel));
  useEffect(() => {
    const controller = new AbortController();
    const source = { url, size, private: isPrivate, format };
    const minLoading = quickPreview(source, isModel) ? 0 : MIN_LOADING_MS;
    Promise.all([
      loadPreview(source, isModel, controller.signal),
      new Promise((resolve) => setTimeout(resolve, minLoading))
    ]).then(([p]) => !controller.signal.aborted && setPreview(p));
    return () => controller.abort();
  }, [url, size, isPrivate, format, isModel]);

  const layerFormat = assetFormat(asset);
  const formatLabel = layerFormat && FORMAT_LABELS[layerFormat];
  const meta = isModel
    ? [t("Model"), asset.projectName]
    : [formatLabel, formatBytes(size), asset.projectName];

  const footnote = (text: string) => (
    <Typography size="footnote" color={theme.content.weak}>
      {text}
    </Typography>
  );

  const notes: Record<
    string,
    { icon: IconName; text: string; warn?: boolean }
  > = {
    unsupported: {
      icon: "informationCircle",
      text: t(
        "{{format}} can't be previewed here. Add it as a layer to see it on the map, or open it in CMS.",
        { format: formatLabel || t("This format") }
      )
    },
    private: {
      icon: "lock",
      text: t(
        "This asset is private. Make it public in CMS to preview it or add it as a layer."
      )
    },
    tooLarge: {
      icon: "informationCircle",
      text: t(
        "This file is too large to preview. Files up to 10 MB can be previewed."
      )
    },
    error: {
      icon: "warning",
      warn: true,
      text: t("Couldn't load the preview. Close and reopen to try again.")
    }
  };

  let body: ReactNode;
  if (!preview) {
    body = (
      <Box data-testid="asset-layer-creator-details-loading">
        <Spinner size={14} />
        {footnote(t("Loading preview..."))}
      </Box>
    );
  } else if (preview.type === "table") {
    body = (
      <>
        {preview.noGeometry && (
          <Note
            icon="warning"
            warn
            text={t(
              "No geometry field, so this model can't be added as a layer."
            )}
          />
        )}
        {preview.total !== undefined &&
          footnote(
            t("First {{shown}} of {{total}} items", {
              shown: preview.rows.length,
              total: preview.total.toLocaleString("en-US")
            })
          )}
        {!!preview.rows.length && (
          <Table columns={preview.columns} rows={preview.rows} />
        )}
        {preview.hasLatLng && (
          <Note
            icon="mapPin"
            text={t("Latitude and longitude columns found")}
          />
        )}
      </>
    );
  } else if (preview.type === "features") {
    const tags = preview.properties.slice(0, 3);
    const more = preview.properties.length - tags.length;
    body = (
      <>
        <Box>
          <Shapes shapes={preview.shapes} />
        </Box>
        {footnote(
          [
            preview.geometryType,
            t("{{count}} features", { count: preview.count })
          ]
            .filter(Boolean)
            .join(" · ")
        )}
        {!!tags.length && (
          <Tags>
            {[...tags, ...(more > 0 ? [`+${more}`] : [])].map((tag) => (
              <Tag key={tag} data-testid="asset-layer-creator-details-tag">
                {tag}
              </Tag>
            ))}
          </Tags>
        )}
      </>
    );
  } else {
    body = <Note {...notes[preview.type]} />;
  }

  return (
    <FloatingPortal>
      <Wrapper
        ref={refs.setFloating}
        style={floatingStyles}
        role="dialog"
        aria-label={asset.name}
        data-testid="asset-layer-creator-details"
      >
        <Header>
          <Column>
            <Ellipsis size="body">{asset.name}</Ellipsis>
            {footnote(meta.filter(Boolean).join(" · "))}
          </Column>
          <IconButton
            icon="close"
            size="small"
            appearance="simple"
            ariaLabel={t("Close")}
            onClick={onClose}
          />
        </Header>
        <Column>{body}</Column>
        {asset.editorUrl && (
          <Link
            href={asset.editorUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="asset-layer-creator-open-in-cms"
          >
            <Icon icon="arrowSquareOut" size="small" />
            {t("Open in CMS")}
          </Link>
        )}
      </Wrapper>
    </FloatingPortal>
  );
};

// The first four columns.
const Table: FC<{ columns: string[]; rows: string[][] }> = ({
  columns,
  rows
}) => (
  <StyledTable>
    <thead>
      <tr>
        {columns.slice(0, 4).map((c, i) => (
          <th key={i} title={c}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.slice(0, 4).map((cell, j) => (
            <td key={j} title={cell}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </StyledTable>
);

const Note: FC<{ icon: IconName; text: string; warn?: boolean }> = ({
  icon,
  text,
  warn
}) => {
  const theme = useTheme();
  const color = warn ? theme.warning.main : theme.content.weak;
  return (
    <Row>
      <Icon icon={icon} size="small" color={color} />
      <Typography size="footnote" color={color}>
        {text}
      </Typography>
    </Row>
  );
};

const Shapes: FC<{ shapes: Shape[] }> = ({ shapes }) => {
  const theme = useTheme();
  return (
    <svg
      width={BOX.width}
      height={BOX.height}
      aria-hidden
      data-testid="asset-layer-creator-details-shapes"
    >
      {shapePaths(shapes, BOX).map(({ kind, d, x, y }, i) =>
        kind === "point" ? (
          <circle key={i} cx={x} cy={y} r={3} fill={theme.select.main} />
        ) : (
          <path
            key={i}
            d={d}
            fill={kind === "polygon" ? theme.select.weak : "none"}
            fillRule="evenodd"
            stroke={theme.select.main}
          />
        )
      )}
    </svg>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  zIndex: theme.zIndexes.editor.popover,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.normal,
  width: 308,
  padding: theme.spacing.normal,
  borderRadius: theme.radius.small,
  border: `1px solid ${theme.outline.weaker}`,
  background: theme.bg[1],
  boxShadow: theme.shadow.tooltip
}));

const Column = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small,
  flex: 1,
  minWidth: 0
}));

const Row = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.smallest
}));

const Header = styled(Row)(({ theme }) => ({ gap: theme.spacing.small }));

const Ellipsis = styled(Typography)(() => ({
  whiteSpace: css.whiteSpace.nowrap,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis
}));

const Box = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  gap: theme.spacing.small,
  height: BOX.height,
  borderRadius: theme.radius.small,
  background: theme.bg[2]
}));

// Rows split by lines, none after the last.
const StyledTable = styled("table")(({ theme }) => ({
  width: "100%",
  tableLayout: "fixed",
  borderCollapse: "collapse",
  fontSize: theme.fonts.sizes.body,
  color: theme.content.main,
  "th, td": {
    padding: `${theme.spacing.smallest}px ${theme.spacing.small}px ${theme.spacing.smallest}px 0`,
    textAlign: "left",
    whiteSpace: css.whiteSpace.nowrap,
    overflow: css.overflow.hidden,
    textOverflow: css.textOverflow.ellipsis,
    borderBottom: `1px solid ${theme.outline.weaker}`
  },
  th: {
    color: theme.content.weak,
    fontWeight: theme.fonts.weight.regular
  },
  "tbody tr:last-of-type td": { borderBottom: "none" },
  "th:last-of-type, td:last-of-type": { paddingRight: 0 }
}));

const Tags = styled(Row)(() => ({ flexWrap: css.flexWrap.wrap }));

const Tag = styled("span")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest}px`,
  borderRadius: theme.radius.smallest,
  background: theme.bg[2],
  color: theme.content.main,
  fontSize: theme.fonts.sizes.footnote
}));

const Link = styled("a")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  alignSelf: css.alignSelf.flexEnd,
  gap: theme.spacing.smallest,
  color: theme.content.main,
  cursor: "pointer",
  fontSize: theme.fonts.sizes.body,
  textDecoration: "none",
  "&:hover": { color: theme.select.strong }
}));

export default AssetDetails;
