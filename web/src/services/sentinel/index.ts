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
        // Re-fetch reearth_config.json (no-store) to pick up a rotated token.
        try {
          const res = await fetch("/reearth_config.json", {
            cache: "no-store"
          });
          const freshConfig = await res.json();
          const newToken: string | undefined = freshConfig?.tileServerToken;
          if (newToken) {
            await updateToken({
              accessToken: newToken,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000 // re-check in 24h
            });
          } else {
            console.warn(
              "[Sentinel] Token expired and no new token found in config"
            );
          }
        } catch (err) {
          console.error("[Sentinel] Token refresh failed:", err);
        }
      }
    });

    // On first install the SW won't control this page until clients.claim() fires.
    // Wait for it before mounting the app so tile requests aren't made without auth.
    if (navigator.serviceWorker && !navigator.serviceWorker.controller) {
      await new Promise<void>(resolve => {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true }
        );
        setTimeout(resolve, 3000); // fallback: don't block indefinitely
      });
    }

    await updateToken({
      accessToken: appConfig.tileServerToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // re-check in 24h via onTokenExpired
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
