/**
 * Tile Provider Service
 * ----------------------
 * Creates TileProviderConfig based on application configuration.
 * All tile URLs are constructed here from env vars and passed to core
 * as override arrays — core never generates or hard-codes URLs.
 *
 * Note: Cesium Ion is not a system-level provider. When users select
 * cesiumion terrain in the editor, the token flows through
 * meta.cesiumIonAccessToken separately.
 */

import type { TileProviderConfig } from "@reearth/core";
import { createTerravistaConfig, createCustomConfig } from "@reearth/core";

import { config } from "../config";

let cachedTileProviderConfig: TileProviderConfig | undefined;
let lastConfigHash: string | null = null;

/**
 * Get TileProviderConfig based on application configuration.
 * Returns undefined if no provider is configured.
 */
export function getTileProviderConfig(): TileProviderConfig | undefined {
  const appConfig = config();

  const configHash = JSON.stringify({
    type: appConfig?.tileProviderType,
    terravistaToken: appConfig?.terravistaAccessToken,
    terravistaBaseUrl: appConfig?.terravistaBaseUrl,
    terravistaTerrainUrl: appConfig?.terravistaTerrainUrl,
    terravistaImageryDefaultUrl: appConfig?.terravistaImageryDefaultUrl,
    terravistaImageryRoadUrl: appConfig?.terravistaImageryRoadUrl,
    terravistaImageryBlackMarbleUrl: appConfig?.terravistaImageryBlackMarbleUrl,
    terravistaImageryOsmUrl: appConfig?.terravistaImageryOsmUrl,
    terravistaGoogle3dUrl: appConfig?.terravistaGoogle3dUrl,
  });

  if (lastConfigHash !== null && configHash === lastConfigHash) {
    return cachedTileProviderConfig;
  }

  const providerType = appConfig?.tileProviderType;

  if (providerType === "terravista") {
    if (!appConfig?.terravistaAccessToken) {
      console.warn(
        "[TileProvider] Terravista selected but no access token configured."
      );
      cachedTileProviderConfig = undefined;
    } else {
      const baseUrl = appConfig.terravistaBaseUrl ?? "https://tiles.eukarya.io";
      cachedTileProviderConfig = createTerravistaConfig(
        appConfig.terravistaAccessToken,
        {
          baseUrl,
          imageryTileOverrides: [
            {
              id: "default",
              url: appConfig.terravistaImageryDefaultUrl ?? `${baseUrl}/imagery/google-satellite/{z}/{x}/{y}.webp`,
              credit: appConfig.terravistaImageryDefaultCredit ?? "© Google",
            },
            {
              id: "default_road",
              url: appConfig.terravistaImageryRoadUrl ?? `${baseUrl}/imagery/google-roadmap/{z}/{x}/{y}.webp`,
              credit: appConfig.terravistaImageryRoadCredit ?? "© Google",
            },
            {
              id: "black_marble",
              url: appConfig.terravistaImageryBlackMarbleUrl ?? `${baseUrl}/imagery/blackmarble/{z}/{x}/{y}.png`,
              credit: appConfig.terravistaImageryBlackMarbleCredit ?? "NASA GIBS VIIRS",
              maxZoomLevel: 8,
            },
            {
              id: "osm",
              url: appConfig.terravistaImageryOsmUrl ?? `${baseUrl}/imagery/osm/{z}/{x}/{y}.png`,
              credit: appConfig.terravistaImageryOsmCredit ?? "© OpenStreetMap contributors",
            },
          ],
          terrainOverrides: [
            {
              id: "default",
              url: appConfig.terravistaTerrainUrl ?? `${baseUrl}/cesium-mesh/ellipsoid`,
              credit: appConfig.terravistaTerrainCredit,
            },
          ],
          layerSourceOverrides: [
            {
              id: "googlePhotorealistic",
              url: appConfig.terravistaGoogle3dUrl ?? `${baseUrl}/google3d/root.json`,
              credit: appConfig.terravistaGoogle3dCredit,
            },
          ],
          onTokenExpired: async () => {
            console.warn("[TileProvider] Terravista token expired");
            return { accessToken: appConfig.terravistaAccessToken ?? "" };
          },
        }
      );
    }
  } else if (providerType === "custom") {
    // Custom provider — caller populates overrides via separate config fields if needed.
    // For now, return an empty custom config; extend this as custom env vars are added.
    cachedTileProviderConfig = createCustomConfig({});
  } else {
    cachedTileProviderConfig = undefined;
  }

  lastConfigHash = configHash;
  return cachedTileProviderConfig;
}

/**
 * Clear cached TileProviderConfig (call if configuration changes at runtime)
 */
export function clearTileProviderCache(): void {
  cachedTileProviderConfig = undefined;
  lastConfigHash = null;
}

export function isTerravistaProvider(): boolean {
  return config()?.tileProviderType === "terravista";
}
