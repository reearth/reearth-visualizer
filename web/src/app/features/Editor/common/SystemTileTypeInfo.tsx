import { Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { FC } from "react";

/**
 * Informational text displayed when the selected tile is a system tile.
 *
 * Street View and Google Map Search require a Google Maps tile type
 * (google_satellite, google_roadmap)
 */
export const SystemTileTypeInfo: FC = () => {
  const t = useT();

  return (
    <Typography size="footnote" color="weak">
      {t(
        "Street View and Google Map Search require a Google Maps tile type to comply with Google Maps policies. Please select Google Satellite or Google Road Map."
      )}
    </Typography>
);
};
