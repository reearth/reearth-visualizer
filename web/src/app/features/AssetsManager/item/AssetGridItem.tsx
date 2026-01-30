import { Icon, IconName, Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, MouseEvent, useCallback, useMemo } from "react";

import { AssetItemProps } from "./type";
import { getAssetType } from "./utils";

const AssetGridItem: FC<AssetItemProps> = ({
  asset,
  selectedAssetIds,
  onSelect
}) => {
  const selected = useMemo(
    () => selectedAssetIds.includes(asset.id),
    [selectedAssetIds, asset.id]
  );

  const type = useMemo(() => getAssetType(asset), [asset]);
  const theme = useTheme();

  const ext = useMemo(() => asset.url.split(".").pop()?.toLowerCase(), [asset]);

  const iconType: IconName = useMemo(() => {
    switch (ext) {
      case "csv":
        return "fileCSV";
      case "geojson":
        return "fileGeoJSON";
      case "czml":
        return "fileCzml";
      case "kml":
        return "fileKml";
      default:
        return "file";
    }
  }, [ext]);

  const handleAssetClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onSelect?.(asset.id);
    },
    [asset, onSelect]
  );

  return (
    <Wrapper selected={selected} title={asset.name} onClick={handleAssetClick}>
      <ThumbnailWrapper>
        <Thumbnail>
          {type === "image" ? (
            <AssetImage url={asset.url} />
          ) : (
            <IconWrapper>
              <Icon icon={iconType} color={theme.content.weak} size={64} />
            </IconWrapper>
          )}
        </Thumbnail>
      </ThumbnailWrapper>
      <AssetName>
        <Typography size="body">{asset.name}</Typography>
      </AssetName>
    </Wrapper>
  );
};

export default AssetGridItem;

const Wrapper = styled("div")<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    display: css.display.flex,
    flexDirection: css.flexDirection.column,
    boxSizing: css.boxSizing.borderBox,
    width: "100%",
    padding: theme.spacing.smallest,
    borderRadius: theme.radius.small,
    gap: theme.spacing.smallest,
    cursor: css.cursor.pointer,
    backgroundColor: selected ? theme.select.main : "transparent",
    transition: "background-color 0.1s ease",
    ["&:hover"]: {
      background: selected ? theme.select.main : theme.relative.light,
      borderRadius: theme.radius.small
    }
  })
);

const ThumbnailWrapper = styled("div")(() => ({
  position: css.position.relative,
  paddingBottom: "62.5%"
}));

const Thumbnail = styled("div")(({ theme }) => ({
  position: css.position.absolute,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100%",
  borderRadius: theme.radius.small,
  overflow: css.overflow.hidden,
  display: css.display.flex
}));

const AssetImage = styled("div")<{ url?: string }>(({ theme, url }) => ({
  background: url ? `url(${url}) center/contain no-repeat` : theme.bg[1],
  borderRadius: theme.radius.small,
  width: "100%"
}));

const IconWrapper = styled("div")(() => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  width: "100%"
}));

const AssetName = styled("div")(() => ({
  textAlign: css.textAlign.center,
  wordBreak: css.wordBreak.breakWord,
  whiteSpace: css.whiteSpace.nowrap,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  padding: "1px 0"
}));
