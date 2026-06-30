import { useCesiumIonAccessToken } from "@reearth/app/features/Editor/atoms";
import { CesiumIonAssetFallbackWarning, SystemTileTypeInfo } from "@reearth/app/features/Editor/common";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import { FieldContext } from "@reearth/app/ui/fields/Properties";
import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n/hooks";
import { ReactNode, useCallback, useMemo } from "react";

export type PropertyDecorations = {
  titleAdornment?: ReactNode;
  beforeInput?: ReactNode;
  afterInput?: ReactNode;
  disabled?: boolean;
  overrideValue?: unknown;
  allowedChoiceKeys?: string[];
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
  const isEE = useMemo(() => config()?.featureCollection === "ee", []);

  return useCallback(
    (
      schemaId: string,
      schemaGroup: string,
      value: unknown,
      allFields: FieldContext[],
      allListItemsFields?: FieldContext[][],
      internalFields?: FieldContext[]
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
      if (schemaId === "tile_opacity" && schemaGroup === "tiles") {
        const tileTypeField = allFields.find((f) => f.id === "tile_type");
        const tileType = tileTypeField?.value;

        // Helper: Check if a tile is or will become a Google tile
        // Asset IDs 2, 3 fallback to google_satellite; 4 to google_roadmap (EE only)
        const GOOGLE_FALLBACK_ASSET_IDS = ["2", "3", "4"];
        const isOrWillBeGoogleTile = (
          type: unknown,
          assetId: unknown
        ): boolean => {
          // Direct Google tile
          if (type === "google_satellite" || type === "google_roadmap") {
            return true;
          }
          // Cesium Ion tile without token that will fallback to Google (EE only)
          if (
            isEE &&
            type === "cesium_ion" &&
            !cesiumIonAccessToken &&
            assetId !== undefined &&
            GOOGLE_FALLBACK_ASSET_IDS.includes(String(assetId))
          ) {
            return true;
          }
          return false;
        };

        // Check if current tile is or will become a Google tile
        const cesiumAssetIdField = allFields.find(
          (f) => f.id === "cesium_ion_asset_id"
        );
        const cesiumAssetId = cesiumAssetIdField?.value;
        const isCurrentTileGoogle = isOrWillBeGoogleTile(
          tileType,
          cesiumAssetId
        );

        // Check if any other tile in the list is or will become a Google tile
        const hasGoogleTileInList =
          allListItemsFields?.some((itemFields) => {
            const itemTileType = itemFields.find(
              (f) => f.id === "tile_type"
            )?.value;
            const itemAssetId = itemFields.find(
              (f) => f.id === "cesium_ion_asset_id"
            )?.value;
            return isOrWillBeGoogleTile(itemTileType, itemAssetId);
          }) ?? false;

        if (isCurrentTileGoogle) {
          // Current tile is Google - use specific message
          decorations.disabled = true;
          decorations.overrideValue = 1;
          decorations.titleAdornment = (
            <Tooltip
              type="custom"
              icon="informationCircle"
              text={t(
                "Disabled: Opacity adjustments are not available for Google Maps tiles to comply with Google Maps Map Tiles API Policies."
              )}
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
              text={t(
                "Disabled: Opacity adjustments are not available when Google Maps tiles are present, to comply with Google Maps Map Tiles API Policies."
              )}
            />
          );
        }
      }

      // Business Rule: System tile type options restricted
      // Only allow google_satellite and google_roadmap for system tiles
      if (schemaId === "tile_type" && schemaGroup === "tiles") {
        const tileCategoryField = internalFields?.find((f) => f.id === "tile_category");
        if (tileCategoryField?.value === "system") {
          decorations.allowedChoiceKeys = ["google_satellite", "google_roadmap"];
          decorations.afterInput = <SystemTileTypeInfo />;
        }
      }

      // Business Rule: System tile zoom level disabled
      // Disable zoom level fields when tile_category is system (managed programmatically)
      if (
        (schemaId === "tile_zoomLevel" || schemaId === "tile_zoomLevelForURL") &&
        schemaGroup === "tiles"
      ) {
        const tileCategoryField = internalFields?.find((f) => f.id === "tile_category");
        if (tileCategoryField?.value === "system") {
          decorations.disabled = true;
          decorations.titleAdornment = (
            <Tooltip
              type="custom"
              icon="informationCircle"
              text={t(
                "Disabled: Zoom level configuration is not available for system tiles."
              )}
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
    [cesiumIonAccessToken, isEE, t]
  );
};
