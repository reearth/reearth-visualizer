export const config = {
  api: process.env["REEARTH_WEB_API"],
  userId: process.env["REEARTH_WEB_E2E_USER_ID"],
  userName: process.env["REEARTH_WEB_E2E_USERNAME"],
  password: process.env["REEARTH_WEB_E2E_PASSWORD"],
  teamId: process.env["REEARTH_WEB_E2E_TEAM_ID"],
  authAudience: process.env["REEARTH_WEB_AUTH0_AUDIENCE"],
  authClientId: process.env["REEARTH_WEB_AUTH0_CLIENT_ID"],
  authUrl: process.env["REEARTH_WEB_AUTH0_DOMAIN"],
  signUpSecret: process.env["REEARTH_WEB_E2E_SIGNUP_SECRET"],
};

export type Config = typeof config;

export function setAccessToken(accessToken: string) {
  process.env.REEARTH_WEB_E2E_ACCESS_TOKEN = accessToken;
}

export function getAccessToken(): string | undefined {
  return process.env.REEARTH_WEB_E2E_ACCESS_TOKEN;
}
