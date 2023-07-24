import { Config } from ".";

export const defaultConfig: Config = {
  api: "/api",
  plugins: "/plugins",
  published: window.origin + "/p/{}/",
  auth0Audience: "http://localhost:8080",
  auth0Domain: "http://localhost:8080",
  auth0ClientId: "reearth-authsrv-client-default",
  authProvider: "auth0",
  policy: {
    modalTitle: {
      en: "Re:Earth Cloud",
      ja: "Re:Earth Cloud",
    },
    modalDescription: {
      en: "This is your currently subscribed to plan. If this plan stops meeting your needs, Re:Earth has other plans available. ",
      ja: "日本語版にほなsdflkjlksdjf",
    },
    url: {
      en: "https://reearth.io/service/cloud",
      ja: "https://reearth.io/ja/service/cloud",
    },
    limitNotifications: {
      asset: {
        en: "Your workspace has reached its plan's limit for assets. Please check reearth.io/service/cloud for details.",
        ja: "",
      },
      createProject: {
        en: "Your workspace has reached its plan's limit for projects. Please check reearth.io/service/cloud for details.",
        ja: "",
      },
      dataset: {
        en: "Your workspace has reached its plan's limit for dataset. Please check reearth.io/service/cloud for details.",
        ja: "",
      },
      member: {
        en: "Your workspace has reached its plan's limit for new members. Please check reearth.io/service/cloud for details.",
        ja: "",
      },
      layer: {
        en: "Your workspace has reached its plan's limit for layers. Please check reearth.io/service/cloud for details.",
        ja: "",
      },
      publishProject: {
        en: "Your workspace has reached its plan's limit for publishing projects. Please check reearth.io/service/cloud for details.",
        ja: "",
      },
    },
  },
};
