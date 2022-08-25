import { Viewer } from "cesium";

export type ExtensionType =
  | "dataset-import"
  | "publication"
  | "plugin-library"
  | "plugin-installed";

export type SharedExtensionProps = {
  theme?: string;
  lang?: string;
  accessToken?: string;
  onNotificationChange?: (
    type: "error" | "warning" | "info" | "success",
    text: string,
    heading?: string,
  ) => void;
};

export type DatasetImportExtensionProps = {
  onReturn?: () => void;
  onUrlChange?: (url: string) => void;
  url?: string;
} & SharedExtensionProps;

export type ProjectPublicationExtensionProps = {
  projectId: string;
  projectAlias?: string;
  publishDisabled?: boolean;
} & SharedExtensionProps;

export type PluginExtensionProps = {
  accessToken?: string;
  selectedPluginId?: string;
  installedPlugins?: {
    id: string;
    version: string;
  }[];
  onInstall?: (pluginId: string) => void;
  onUninstall?: (pluginId: string) => void;
} & SharedExtensionProps;

export type ExtensionProps = {
  "dataset-import": DatasetImportExtensionProps;
  publication: ProjectPublicationExtensionProps;
  "plugin-library": PluginExtensionProps;
  "plugin-installed": PluginExtensionProps;
};

export type Extension<T extends ExtensionType = ExtensionType> = {
  type: T;
  id: string;
  component: React.ComponentType<ExtensionProps[T]>;
  title?: string;
  image?: string;
};

export type Extensions = {
  publication?: Extension<"publication">[];
  datasetImport?: Extension<"dataset-import">[];
  pluginLibrary?: Extension<"plugin-library">[];
  pluginInstalled?: Extension<"plugin-installed">[];
};

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

// module
export async function loadExtensions(urls?: string[]): Promise<Extensions | undefined> {
  if (!urls) return undefined;

  // Entry point for publication extensions is @reearth/components/molecules/Settings/Project/PublishSection/hooks.ts
  const publication: Extension<"publication">[] = [];
  // Entry point for dataset import extensions is @reearth/components/molecules/EarthEditor/DatasetPane/DatasetModal/hooks.ts
  const datasetImport: Extension<"dataset-import">[] = [];
  // Entry point for plugin library extensions is @reearth/components/molecules/Settings/Project/Plugin/PluginSection/PluginInstall
  const pluginLibrary: Extension<"plugin-library">[] = [];
  // Entry point for plugin installed extensions is @reearth/components/molecules/Settings/Project/Plugin/PluginSection/PluginInstall
  const pluginInstalled: Extension<"plugin-installed">[] = [];

  for (const url of urls) {
    try {
      const newExtensions: Extension[] = (await import(/* @vite-ignore */ url)).default;
      newExtensions.forEach(ext =>
        ext.type === "dataset-import"
          ? datasetImport.push(ext as Extension<"dataset-import">)
          : ext.type === "publication"
          ? publication.push(ext as Extension<"publication">)
          : ext.type === "plugin-library"
          ? pluginLibrary.push(ext as Extension<"plugin-library">)
          : ext.type === "plugin-installed"
          ? pluginInstalled.push(ext as Extension<"plugin-installed">)
          : undefined,
      );
    } catch (e) {
      // ignore
    }
  }

  return {
    publication,
    datasetImport,
  };
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
