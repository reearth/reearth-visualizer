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
  flex: "1 1 calc(14% - 1px)",
  padding: theme.spacing.smallest,
  border: isSelected ? `1px solid ${theme.select.main}` : "none",
  maxWidth: "calc(14% - 1px)",
  "@media only screen and (max-width: 1200px)": {
    flex: "1 1 calc(20% - 10px)",
    maxWidth: "calc(20% - 10px)",
  },
  "@media only screen and (max-width: 900px)": {
    flex: "1 1 calc(25% - 10px)",
    maxWidth: "calc(25% - 10px)",
  },
  "@media only screen and (max-width: 600px)": {
    flex: "1 1 calc(33.33% - 10px)",
    maxWidth: "calc(33.33% - 10px)",
  },
  "@media only screen and (max-width: 400px)": {
    flex: "1 1 calc(50% - 10px)",
    maxWidth: "calc(50% - 10px)",
  },
}));

const AssetImage = styled("div")<{ url?: string }>(({ theme, url }) => ({
  background: url ? `url(${url}) center/cover` : theme.bg[1],
  borderRadius: theme.radius.small,
  height: "100px",
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
}));
