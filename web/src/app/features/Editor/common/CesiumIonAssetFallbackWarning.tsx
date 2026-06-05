import { Banner } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { FC } from "react";

type Props = {
  "data-testid"?: string;
};

/**
 * Reusable warning banner displayed when a Cesium Ion asset type is selected
 * but no Cesium Ion access token is configured.
 *
 * Shows a warning message indicating that a fallback will be used instead.
 */
export const CesiumIonAssetFallbackWarning: FC<Props> = ({
  "data-testid": dataTestId = "cesium-ion-warning"
}) => {
  const t = useT();

  return (
    <Banner variant="warning" data-testid={dataTestId}>
      {t("Cesium Ion token not set, fallback will be used.")}
    </Banner>
  );
};
