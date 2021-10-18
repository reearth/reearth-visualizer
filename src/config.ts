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
};
declare global {
  interface Window {
    REEARTH_CONFIG?: Config;
  }
}

export const defaultConfig: Config = {
  api: "/api",
  plugins: "/plugins",
  published: window.origin + "/p/{}/",
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };

  if (!window.REEARTH_CONFIG?.passwordPolicy) return;

  window.REEARTH_CONFIG.passwordPolicy = Object.entries(
    Object.values(window.REEARTH_CONFIG.passwordPolicy).map((k, v) => {
      if (typeof v !== "string") return undefined;
      try {
        return [k, new RegExp(v)];
      } catch {
        return undefined;
      }
    }),
  ) as Config["passwordPolicy"];
}
