import { useSceneSettingNavigationTarget } from "@reearth/app/features/Editor/atoms";
import { Banner } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useCallback } from "react";

type Props = {
  "data-testid"?: string;
};

/**
 * Reusable warning banner displayed when a Cesium Ion asset type is selected
 * but no Cesium Ion access token is configured.
 *
 * Shows a warning message indicating that a fallback will be used instead.
 * Includes a clickable link to navigate to Main settings where the token can be configured.
 */
export const CesiumIonAssetFallbackWarning: FC<Props> = ({
  "data-testid": dataTestId = "cesium-ion-warning"
}) => {
  const t = useT();
  const [, setNavigationTarget] = useSceneSettingNavigationTarget();

  const handleNavigateToSettings = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Blur the button to remove focus
    e.currentTarget.blur();
    setNavigationTarget({
      setting: "main",
      fieldId: "ion"
    });
  }, [setNavigationTarget]);

  return (
    <Banner variant="warning" data-testid={dataTestId}>
      {t("Cesium Ion token not configured. Using fallback.")}{" "}
      <SettingsLink
        onClick={handleNavigateToSettings}
        data-testid="configure-token-link"
      >
        {t("Configure token")} →
      </SettingsLink>
    </Banner>
  );
};

const SettingsLink = styled("button")(({ theme }) => ({
  background: "none",
  border: "none",
  padding: 0,
  marginTop: theme.spacing.micro,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.footnote,
  fontWeight: theme.fonts.weight.regular,
  textDecoration: "underline",
  cursor: "pointer",
  display: "block",
  width: "fit-content",
  "&:hover": {
    opacity: 0.8
  }
}));
