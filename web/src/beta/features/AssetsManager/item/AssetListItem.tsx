import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, MouseEvent, useCallback, useMemo } from "react";

import { AssetItemProps } from "./type";
import { getAssetType } from "./utils";

const AssetListItem: FC<AssetItemProps> = ({
  asset,
  selectedAssetIds,
  onSelect,
}) => {
  const selected = useMemo(
    () => selectedAssetIds.includes(asset.id),
    [selectedAssetIds, asset.id],
  );

  const type = useMemo(() => getAssetType(asset), [asset]);

  const theme = useTheme();

  const handleAssetClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onSelect?.(asset.id);
    },
    [asset, onSelect],
  );

  const formattedDate = useMemo(
    () =>
      new Date(asset.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [asset.createdAt],
  );

  const formattedSize = useMemo(() => formatBytes(asset.size), [asset.size]);

  return (
    <Wrapper selected={selected} title={asset.name} onClick={handleAssetClick}>
      <Thumbnail>
        <Icon
          icon={type === "image" ? "image" : "fileFilled"}
          color={theme.content.weak}
          size={20}
        />
      </Thumbnail>
      <AssetName>
        <Typography size="body">{asset.name}</Typography>
      </AssetName>
      <Col width={30}>
        <Typography size="body">{formattedDate}</Typography>
      </Col>
      <Col width={30}>
        <Typography size="body">{formattedSize}</Typography>
      </Col>
    </Wrapper>
  );
};

export default AssetListItem;

const Wrapper = styled("div")<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    display: "flex",
    width: "100%",
    alignItems: "center",
    boxSizing: "border-box",
    padding: theme.spacing.smallest,
    borderRadius: theme.radius.small,
    gap: theme.spacing.small,
    cursor: "pointer",
    backgroundColor: selected ? theme.select.main : "transparent",
    transition: "background-color 0.1s ease",
    overflow: "hidden",
    ["&:hover"]: {
      background: selected ? theme.select.main : theme.relative.light,
      borderRadius: theme.radius.small,
    },
  }),
);

const Thumbnail = styled("div")(() => ({
  width: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

const AssetName = styled("div")(() => ({
  wordBreak: "break-word",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "50%",
  flexGrow: 0,
  flexShrink: 0,
}));

const Col = styled("div")<{ width: number }>(({ width }) => ({
  width: `${width}%`,
  flexGrow: 0,
  flexShrink: 0,
}));

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  let formattedValue;

  if (i === 0) {
    formattedValue = Math.floor(value).toLocaleString();
  } else {
    formattedValue = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return `${formattedValue} ${sizes[i]}`;
}
