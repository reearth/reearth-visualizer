import { FC } from "react";

import { Asset } from "@reearth/beta/features/Assets/types";
import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";

type ContentProps = {
  asset: Asset | any;
  icon?: "image" | "file" | "folder" | "assetNoSupport";
  selectedAssetId?: string;
  onAssetSelect?: (assetId: string) => void;
};

export const AssetCard: FC<ContentProps> = ({ asset, icon, selectedAssetId, onAssetSelect }) => {
  const theme = useTheme();

  const renderContent = () => {
    switch (icon) {
      case "image":
        return <AssetImage url={asset.url} />;
      case "file":
        return (
          <IconWrapper>
            <Icon icon="fileFilled" color={theme.content.weak} size="large" />
          </IconWrapper>
        );
      case "folder":
        return (
          <IconWrapper>
            <Icon icon="folderFilled" color={theme.content.weak} size="large" />
          </IconWrapper>
        );

      default:
        return <AssetImage />;
    }
  };

  return (
    <CardWrapper
      isSelected={selectedAssetId === asset.id}
      onClick={() => onAssetSelect?.(asset.id)}>
      {renderContent()}
      <AssetName>
        <Typography size="body">{asset.name}</Typography>
      </AssetName>
    </CardWrapper>
  );
};

const CardWrapper = styled("div")<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  display: "flex",
  flexDirection: "column",
  border: `2px solid ${isSelected ? theme.select.main : "transparent"}`,
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  padding: theme.spacing.smallest,
}));

const AssetImage = styled("div")<{ url?: string }>(({ theme, url }) => ({
  background: url ? `url(${url}) center/cover` : theme.bg[1],
  height: "100px",
  borderRadius: theme.radius.small,
  cursor: "pointer",
}));

const IconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100px",
  cursor: "pointer",
  background: theme.bg[1],
  borderRadius: theme.radius.small,
}));

const AssetName = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing.small,
  textAlign: "center",
  wordBreak: "break-word",
}));
