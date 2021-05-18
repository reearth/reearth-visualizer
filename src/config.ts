export type Config = {
  api: string;
  published: string;
  plugin: string;
  export: string;
  auth0ClientId?: string;
  auth0Domain?: string;
  auth0Audience?: string;
};

declare global {
  interface Window {
    REEARTH_CONFIG?: Config;
  }
}

export const defaultConfig: Config = {
  api: "/api/graphql",
  export: "/api/layers/",
  plugin: "/plugins",
  published: "/p/{}",
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };
}
