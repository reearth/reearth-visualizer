import { useCesiumIonAccessToken } from "@reearth/app/features/Editor/atoms";
import { CesiumIonAssetFallbackWarning } from "@reearth/app/features/Editor/common";
import { ReactNode, useCallback } from "react";

export type PropertyDecorations = {
  titleAdornment?: ReactNode;
  beforeInput?: ReactNode;
  afterInput?: ReactNode;
};

/**
 * Hook to compute property field decorations based on business rules.
 * This contains Editor-specific business logic for decorating property fields.
 *
 * Used by InspectorPanel to inject decorations into generic PropertyField components.
 */
export const usePropertyDecorations = () => {
  const [cesiumIonAccessToken] = useCesiumIonAccessToken();

  return useCallback(
    (
      schemaId: string,
      schemaGroup: string,
      value: unknown
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

      // Add more business rules here as needed
      // Example:
      // if (schemaId === "experimental_feature") {
      //   decorations.titleAdornment = <Badge variant="warning">Experimental</Badge>;
      // }

      return decorations;
    },
    [cesiumIonAccessToken]
  );
};
