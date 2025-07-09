import { type AuthInfo, getAuthInfo } from "./authInfo";
import { configureCognito } from "./aws";
import { defaultConfig } from "./defaultConfig";
import { type Extensions, loadExtensions } from "./extensions";
import { type PasswordPolicy, convertPasswordPolicy } from "./passwordPolicy";
import {
  type UnsafeBuiltinPlugin,
  loadUnsafeBuiltinPlugins
} from "./unsafeBuiltinPlugin";

export {
  getAuthInfo,
  getSignInCallbackUrl,
  logInToTenant,
  logOutFromTenant
} from "./authInfo";

export type Config = {
  version?: string;
  api: string;
  plugins: string;
  published: string;
  googleApiKey?: string;
  googleClientId?: string;
  sentryDsn?: string;
  sentryEnv?: string;
  cesiumIonAccessToken?: string;
  earlyAccessAdmins?: string[];
  brand?: {
    logoUrl?: string;
    background?: string;
  };
  passwordPolicy?: PasswordPolicy;
  ip?: string;
  policy?: {
    modalTitle: Record<string, string> | string;
    modalDescription: Record<string, string> | string;
    url?: Record<string, string> | string;
    limitNotifications?: {
      asset?: Record<string, string> | string;
      createProject?: Record<string, string> | string;
      dataset?: Record<string, string> | string;
      member?: Record<string, string> | string;
      layer?: Record<string, string> | string;
      publishProject?: Record<string, string> | string;
    };
  };
  documentationUrl?: string;
  marketplaceUrl?: string;
  extensionUrls?: string[];
  unsafePluginUrls?: string[];
  extensions?: Extensions;
  unsafeBuiltinPlugins?: UnsafeBuiltinPlugin[];
  multiTenant?: Record<string, AuthInfo>;
  devPluginUrls?: string[];
  platformUrl?: string;
  saasMode?: boolean;
} & AuthInfo;

declare global {
  let __APP_VERSION__: string;
  let __REEARTH_COMMIT_HASH__: string;
  interface Window {
    REEARTH_CONFIG?: Config;
    REEARTH_COMMIT_HASH?: string;
  }
}

const DEFAULT_CESIUM_ION_TOKEN_LENGTH = 177;

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  const config: Config = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json())
  };

  const cesiumIonToken = await loadCesiumIonToken();
  if (cesiumIonToken) {
    config.cesiumIonAccessToken = cesiumIonToken;
  }

  const authInfo = getAuthInfo(config);
  if (authInfo?.cognito && authInfo.authProvider === "cognito") {
    configureCognito(authInfo.cognito);
  }

  if (config?.passwordPolicy) {
    config.passwordPolicy = convertPasswordPolicy(
      config.passwordPolicy as Record<string, string>
    );
  }

  if (config?.extensionUrls) {
    const extensions = await loadExtensions(config.extensionUrls);
    config.extensions = extensions;
  }

  if (config.unsafePluginUrls) {
    config.unsafeBuiltinPlugins = await loadUnsafeBuiltinPlugins(
      config.unsafePluginUrls
    );
  }

  window.REEARTH_CONFIG = config;
}

async function loadCesiumIonToken(): Promise<string> {
  // updating config JSON by CI/CD sometimes can break the config file, so separate files
  try {
    const res = await fetch("/cesium_ion_token.txt");
    const token = (await res.text()).trim();
    return token.length === DEFAULT_CESIUM_ION_TOKEN_LENGTH ? token : "";
  } catch (_e) {
    // ignore
    return "";
  }
}

export function config(): Config | undefined {
  return window.REEARTH_CONFIG;
}
