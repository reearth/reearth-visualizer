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
 * Wait for service worker to control the page
 *
 * On hard reload, navigator.serviceWorker.controller is null even though the SW
 * is registered and active. Without a controller, the SW cannot intercept fetch
 * requests, causing 401 errors for protected tile requests.
 *
 * This function sends a CLAIM_CLIENTS message to force the SW to call clients.claim(),
 * which triggers the controllerchange event and allows the SW to intercept requests.
 */
async function waitForServiceWorkerControl(maxAttempts = 100, delayMs = 50): Promise<void> {
  console.log("[Sentinel] Waiting for service worker to control page...");

  // If already controlling, return immediately
  if (navigator.serviceWorker.controller) {
    console.log("[Sentinel] Service worker already controlling the page");
    return;
  }

  // Send CLAIM_CLIENTS message to force SW to take control
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.active) {
    registration.active.postMessage({ type: "CLAIM_CLIENTS" });
    console.log("[Sentinel] Sent CLAIM_CLIENTS message to service worker");
  }

  // Wait for controllerchange event (fired when SW calls clients.claim())
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.warn(
        "[Sentinel] Service worker did not gain control after",
        maxAttempts * delayMs,
        "ms - requests may not be intercepted"
      );
      resolve();
    }, maxAttempts * delayMs);

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        clearTimeout(timeout);
        console.log("[Sentinel] Service worker gained control via controllerchange event");
        resolve();
      },
      { once: true }
    );
  });
}

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

    // Wait for service worker to control the page
    // On hard reload, the SW must gain control before it can intercept requests
    await waitForServiceWorkerControl();

    // Send token to service worker
    const tokenUpdated = await updateToken({
      accessToken: appConfig.tileServerToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // re-check in 24h via onTokenExpired
    });

    if (!tokenUpdated) {
      console.warn("[Sentinel] Failed to update token in service worker");
    }

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
