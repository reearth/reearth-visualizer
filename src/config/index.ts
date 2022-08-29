import { Viewer } from "cesium";

import { Extensions, loadExtensions } from "./extensions";

export type Config = {
  version?: string;
  api: string;
  plugins: string;
  published: string;
  auth0ClientId?: string;
  auth0Domain?: string;
  auth0Audience?: string;
  googleApiKey?: string;
  googleClientId?: string;
  sentryDsn?: string;
  sentryEnv?: string;
  passwordPolicy?: {
    tooShort?: RegExp;
    tooLong?: RegExp;
    whitespace?: RegExp;
    lowSecurity?: RegExp;
    medSecurity?: RegExp;
    highSecurity?: RegExp;
  };
  ip?: string;
  documentationUrl?: string;
  marketplaceUrl?: string;
  extensionUrls?: string[];
  extensions?: Extensions;
};
declare global {
  interface Window {
    REEARTH_CONFIG?: Config;
    REEARTH_E2E_ACCESS_TOKEN?: string;
    REEARTH_E2E_CESIUM_VIEWER?: any;
  }
}

export const defaultConfig: Config = {
  api: "/api",
  plugins: "/plugins",
  published: window.origin + "/p/{}/",
  auth0Audience: "http://localhost:8080",
  auth0Domain: "http://localhost:8080",
  auth0ClientId: "reearth-authsrv-client-default",
};

export function convertPasswordPolicy(passwordPolicy?: {
  [key: string]: string;
}): { [key: string]: RegExp | undefined } | undefined {
  if (!passwordPolicy) return;
  return Object.fromEntries(
    Object.entries(passwordPolicy)
      .map(([k, v]) => {
        if (typeof v !== "string") return [k, undefined];
        try {
          return [k, new RegExp(v)];
        } catch {
          return [k, undefined];
        }
      })
      .filter(i => !!i[1]),
  );
}

// IIFE
// function importExternal(url: string) {
//   return new Promise((res, rej) => {
//     const script = document.createElement("script");
//     script.src = url;
//     script.async = true;
//     script.onload = () => {
//       if (!window.REEARTH_CONFIG) return;
//       res(window.REEARTH_CONFIG.extensions);
//     };
//     script.onerror = rej;

//     document.body.appendChild(script);
//   });
// }

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };

  if (window.REEARTH_CONFIG?.passwordPolicy) {
    window.REEARTH_CONFIG.passwordPolicy = convertPasswordPolicy(
      window.REEARTH_CONFIG.passwordPolicy as { [key: string]: string },
    );
  }

  if (window.REEARTH_CONFIG?.extensionUrls) {
    const extensions = await loadExtensions(window.REEARTH_CONFIG.extensionUrls);
    window.REEARTH_CONFIG.extensions = extensions;
  }
}

export function config(): Config | undefined {
  return window.REEARTH_CONFIG;
}

export function e2eAccessToken(): string | undefined {
  return window.REEARTH_E2E_ACCESS_TOKEN;
}

export function setE2ECesiumViewer(viewer: Viewer | undefined) {
  if (viewer) {
    window.REEARTH_E2E_CESIUM_VIEWER = viewer;
  } else {
    delete window.REEARTH_E2E_CESIUM_VIEWER;
  }
}
