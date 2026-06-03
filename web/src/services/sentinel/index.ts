import {
  registerAssetSecurity,
  updateToken,
  clearToken,
  getSecurityStatus,
  unregisterAssetSecurity
} from "@reearth/sentinel";
import type {
  AssetSecurityStatus,
  TokenUpdateOptions
} from "@reearth/sentinel";

import { config } from "../config";

export type { AssetSecurityStatus, TokenUpdateOptions };

let isInitialized = false;

/**
 * Initialize Sentinel Service Worker
 * Must be called after loadConfig() resolves, before the viewer mounts.
 *
 * registerAssetSecurity() handles waiting for the SW to control the page
 * (including hard reload scenarios via CLAIM_CLIENTS), so updateToken()
 * is safe to call immediately after.
 */
export async function initializeSentinel(): Promise<void> {
  const appConfig = config();

  if (!appConfig?.tileServerToken || !appConfig?.tileServerBaseUrl) {
    return;
  }

  if (isInitialized) return;

  try {
    const baseUrl = appConfig.tileServerBaseUrl;
    const protectedDomain = new URL(baseUrl).host;

    await registerAssetSecurity({
      proxyUrl: baseUrl,
      protectedDomains: [protectedDomain],
      namespace: "reearth-visualizer",
      assetPatterns: {
        rasterTiles: /\/(?:cesium-mesh|imagery|google3d|v1\/3dtiles)\//
      },
      tokenConfig: {
        memoryCacheTTL: 300_000, // 5 min
        refreshThreshold: 60_000 // refresh 1 min before expiry
      },
      debug: import.meta.env.DEV,
      onTokenExpired: async () => {
        try {
          const res = await fetch("/reearth_config.json", {
            cache: "no-store"
          });
          const freshConfig = await res.json();
          const newToken: string | undefined = freshConfig?.tileServerToken;
          if (newToken) {
            await updateToken({
              accessToken: newToken,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000
            });
          } else {
            console.warn("[Sentinel] Token expired and no new token found in config");
          }
        } catch (err) {
          console.error("[Sentinel] Token refresh failed:", err);
        }
      }
    });

    await updateToken({
      accessToken: appConfig.tileServerToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    isInitialized = true;
    console.log("[Sentinel] Initialized for", protectedDomain);
  } catch (error) {
    console.error("[Sentinel] Initialization failed:", error);
  }
}

export async function clearSentinelToken(): Promise<void> {
  if (!isInitialized) return;
  await clearToken();
}

export async function updateSentinelToken(
  options: TokenUpdateOptions
): Promise<void> {
  if (!isInitialized) return;
  await updateToken(options);
}

export async function getSentinelStatus(): Promise<AssetSecurityStatus | null> {
  if (!isInitialized) return null;
  return getSecurityStatus();
}

export async function unregisterSentinel(): Promise<void> {
  if (!isInitialized) return;
  await unregisterAssetSecurity();
  isInitialized = false;
}
