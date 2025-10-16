import { Browser, BrowserContext } from "@playwright/test";

import {
  createADCIAPContext,
  getADCIAPToken,
  makeADCIAPRequest
} from "./iap-auth-adc";
import { createIdTokenIAPContext } from "./iap-auth-id-token";
import {
  createServiceAccountIAPContext,
  getServiceAccountIAPToken,
  makeServiceAccountIAPRequest
} from "./iap-auth-service-account";

const VALID_METHODS = ["service-account", "adc", "id-token"] as const;
type IAPAuthMethod = (typeof VALID_METHODS)[number];

function resolveMethod(): IAPAuthMethod {
  const explicitMethod = process.env.IAP_AUTH_METHOD?.toLowerCase();
  if (explicitMethod) {
    if ((VALID_METHODS as readonly string[]).includes(explicitMethod)) {
      return explicitMethod as IAPAuthMethod;
    }
    throw new Error(
      `Unsupported IAP auth method "${explicitMethod}". Valid options are: ${VALID_METHODS.join(", ")}`
    );
  }

  return process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? "service-account" : "adc";
}

export const IAP_AUTH_METHOD: IAPAuthMethod = resolveMethod();

export async function createIAPContext(
  browser: Browser,
  baseUrl: string
): Promise<BrowserContext> {
  // Auto-detect environment based on URL if USE_IAP_AUTH is not explicitly set
  const explicitUseIAP = process.env.USE_IAP_AUTH;
  let useIAPAuth = explicitUseIAP === "true";

  // If USE_IAP_AUTH is not explicitly set, auto-detect based on URL
  if (explicitUseIAP === undefined) {
    try {
      const parsedUrl = new URL(baseUrl);
      const hostname = parsedUrl.hostname.toLowerCase();
      // Skip IAP for localhost and production (reearth.io without 'dev' or 'staging')
      const isLocalhost =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1";
      const isProduction =
        hostname === "app.reearth.io" || hostname === "app.reearth.io";
      useIAPAuth = !isLocalhost && !isProduction;
    } catch {
      // If URL parsing fails, default to requiring IAP
      useIAPAuth = true;
    }
  }

  // Skip IAP authentication if not needed
  if (!useIAPAuth) {
    return browser.newContext();
  }

  if (IAP_AUTH_METHOD === "service-account") {
    return createServiceAccountIAPContext(browser, baseUrl);
  }

  if (IAP_AUTH_METHOD === "id-token") {
    return createIdTokenIAPContext(browser);
  }

  return createADCIAPContext(browser, baseUrl);
}

export async function getIAPToken(): Promise<string> {
  if (IAP_AUTH_METHOD === "service-account") {
    return getServiceAccountIAPToken();
  }

  return getADCIAPToken();
}

export async function makeIAPRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  if (IAP_AUTH_METHOD === "service-account") {
    return makeServiceAccountIAPRequest(url, options);
  }

  return makeADCIAPRequest(url, options);
}
