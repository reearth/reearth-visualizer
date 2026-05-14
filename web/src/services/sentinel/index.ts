import {
  registerAssetSecurity,
  updateToken,
  clearToken,
  getSecurityStatus,
  unregisterAssetSecurity,
} from "@reearth/sentinel";
import type { AssetSecurityStatus, TokenUpdateOptions } from "@reearth/sentinel";

import { config } from "../config";

export type { AssetSecurityStatus, TokenUpdateOptions };

let isInitialized = false;

/**
 * Initialize Sentinel Service Worker for Terravista Bearer-token injection.
 * Must be called after loadConfig() resolves, before the viewer mounts.
 */
export async function initializeSentinel(): Promise<void> {
  const appConfig = config();

  if (!appConfig?.terravistaAccessToken || appConfig?.tileProviderType !== "terravista") {
    return;
  }

  if (isInitialized) return;

  try {
    const baseUrl = appConfig.terravistaBaseUrl ?? "https://tiles.eukarya.io";
    const protectedDomain = new URL(baseUrl).host;

    await registerAssetSecurity({
      // proxyUrl is required by Sentinel's API validation; Terravista validates
      // Bearer tokens directly so no separate proxy is needed — point at origin.
      proxyUrl: baseUrl,
      protectedDomains: [protectedDomain],
      namespace: "reearth-visualizer",
      // Override default rasterTiles pattern to match all Terravista paths.
      // Default pattern (/tiles/{name}/{z}/{x}/{y}) does NOT match Terravista URLs,
      // so terrain/imagery/3D-tiles requests would not be intercepted without this.
      assetPatterns: {
        rasterTiles: /\/(?:cesium-mesh|imagery|google3d|v1\/3dtiles)\//,
      },
      tokenConfig: {
        memoryCacheTTL: 300_000,  // 5 min
        refreshThreshold: 60_000, // refresh 1 min before expiry
      },
      debug: import.meta.env.DEV,
      onTokenExpired: async () => {
        // Terravista token is a server-side secret in GCP Secret Manager.
        // Re-fetch reearth_config.json (no-store) to pick up a rotated token.
        try {
          const res = await fetch("/reearth_config.json", { cache: "no-store" });
          const freshConfig = await res.json();
          const newToken: string | undefined = freshConfig?.terravistaAccessToken;
          if (newToken) {
            await updateToken({
              accessToken: newToken,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000, // re-check in 24h
            });
          } else {
            console.warn("[Sentinel] Token expired and no new token found in config");
          }
        } catch (err) {
          console.error("[Sentinel] Token refresh failed:", err);
        }
      },
    });

    await updateToken({
      accessToken: appConfig.terravistaAccessToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // re-check in 24h via onTokenExpired
    });

    isInitialized = true;
    console.log("[Sentinel] Initialized for", protectedDomain);
  } catch (error) {
    // Non-fatal: viewer works without Sentinel but tile auth will fail
    console.error("[Sentinel] Initialization failed:", error);
  }
}

export async function clearSentinelToken(): Promise<void> {
  if (!isInitialized) return;
  await clearToken();
}

export async function updateSentinelToken(options: TokenUpdateOptions): Promise<void> {
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
