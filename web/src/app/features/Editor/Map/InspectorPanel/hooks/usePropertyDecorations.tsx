import { useCesiumIonAccessToken } from "@reearth/app/features/Editor/atoms";
import { CesiumIonAssetFallbackWarning } from "@reearth/app/features/Editor/common";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { FieldContext } from "@reearth/app/ui/fields/Properties";
import { useT } from "@reearth/services/i18n/hooks";
import { ReactNode, useCallback } from "react";

export type PropertyDecorations = {
  titleAdornment?: ReactNode;
  beforeInput?: ReactNode;
  afterInput?: ReactNode;
  disabled?: boolean;
  overrideValue?: unknown;
};

/**
 * Hook to compute property field decorations based on business rules.
 * This contains Editor-specific business logic for decorating property fields.
 *
 * Used by InspectorPanel to inject decorations into generic PropertyField components.
 */
export const usePropertyDecorations = () => {
  const [cesiumIonAccessToken] = useCesiumIonAccessToken();
  const t = useT();

  return useCallback(
    (
      schemaId: string,
      schemaGroup: string,
      value: unknown,
      allFields: FieldContext[],
      allListItemsFields?: FieldContext[][]
    ): PropertyDecorations => {
      const decorations: PropertyDecorations = {};

      // Business Rule: Cesium Ion tile type warning
      // Show warning when cesium_ion tile type is selected but no token is configured
      if (
        schemaId === "tile_type" &&
        schemaGroup === "tiles" &&
        value === "cesium_ion" &&
        !cesiumIonAccessToken
      ) {
        decorations.afterInput = <CesiumIonAssetFallbackWarning />;
      }

      // Business Rule: Cesium Ion terrain type warning
      // Show warning when cesium terrain type is selected but no token is configured
      if (
        schemaId === "terrainType" &&
        schemaGroup === "terrain" &&
        value === "cesium" &&
        !cesiumIonAccessToken
      ) {
        decorations.afterInput = <CesiumIonAssetFallbackWarning />;
      }

      // Business Rule: Google tiles opacity override
      // Disable opacity field and override its value to 1 for Google tiles
      if (
        schemaId === "tile_opacity" &&
        schemaGroup === "tiles"
      ) {
        const tileTypeField = allFields.find((f) => f.id === "tile_type");
        const tileType = tileTypeField?.value;

        // Check if current tile is a Google tile
        const isCurrentTileGoogle = tileType === "google_satellite" || tileType === "google_roadmap";

        // Check if any other tile in the list is a Google tile
        const hasGoogleTileInList = allListItemsFields?.some((itemFields) => {
          const itemTileType = itemFields.find((f) => f.id === "tile_type")?.value;
          return itemTileType === "google_satellite" || itemTileType === "google_roadmap";
        }) ?? false;

        if (isCurrentTileGoogle) {
          // Current tile is Google - use specific message
          decorations.disabled = true;
          decorations.overrideValue = 1;
          decorations.titleAdornment = (
            <Tooltip
              type="custom"
              icon="informationCircle"
              text={t("Disabled: Opacity adjustments are not available for Google Maps tile to ensure compliance with Google Maps Terms of Service.")}
            />
          );
        } else if (hasGoogleTileInList) {
          // Current tile is NOT Google but there's a Google tile in the list
          decorations.disabled = true;
          decorations.overrideValue = 1;
          decorations.titleAdornment = (
            <Tooltip
              type="custom"
              icon="informationCircle"
              text={t("Disabled: Opacity adjustments are not available when Google Maps tiles are present, to ensure compliance with the Google Maps Terms of Service.")}
            />
          );
        }
      }

      // Add more business rules here as needed
      // Example:
      // if (schemaId === "experimental_feature") {
      //   decorations.titleAdornment = <Badge variant="warning">Experimental</Badge>;
      // }

      return decorations;
    },
    [cesiumIonAccessToken, t]
  );
};
