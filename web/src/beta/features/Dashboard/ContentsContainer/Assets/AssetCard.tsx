import { FC } from "react";

import { Asset } from "@reearth/beta/features/Assets/types";
import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

type AssetCardProps = {
  asset: Asset;
  icon?: "image" | "file" | "assetNoSupport";
  isSelected?: boolean;
  onAssetSelect?: (assets: Asset[]) => void;
};

const AssetCard: FC<AssetCardProps> = ({ asset, icon, isSelected, onAssetSelect }) => {
  const theme = useTheme();

  const renderContent = () => {
    switch (icon) {
      case "image":
        return <AssetImage url={asset.url} />;
      case "file":
      case "assetNoSupport":
        return (
          <IconWrapper>
            <Icon icon="fileFilled" color={theme.content.weak} size="large" />
          </IconWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <CardWrapper onClick={() => onAssetSelect?.([asset])} isSelected={isSelected}>
      {renderContent()}
      <AssetName>
        <Typography size="body">{asset.name}</Typography>
      </AssetName>
    </CardWrapper>
  );
};

export default AssetCard;

const CardWrapper = styled("div")<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${isSelected ? theme.select.main : "transparent"}`,
  boxSizing: "border-box",
  width: "100%",
  height: "160px",
  padding: theme.spacing.smallest,
  borderRadius: theme.radius.small,
}));

const AssetImage = styled("div")<{ url?: string }>(({ theme, url }) => ({
  background: url ? `url(${url}) center/cover` : theme.bg[1],
  borderRadius: theme.radius.small,
  flex: "3",
}));

const IconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.bg[1],
  borderRadius: theme.radius.small,
  flex: "3",
}));

const AssetName = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing.small,
  textAlign: "center",
  wordBreak: "break-word",
  flex: "1",
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
  textOverflow: "ellipsis",
}));
