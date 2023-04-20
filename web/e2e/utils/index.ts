// eslint-disable-next-line no-restricted-imports
import { type APIRequestContext, request, test as base, type Page } from "@playwright/test";

import { config, getAccessToken, type Config } from "./config";

// eslint-disable-next-line no-restricted-imports
export { expect } from "@playwright/test";

export type Reearth = {
  initUser: () => Promise<{
    token: string;
    userId: string;
    teamId: string;
    userName: string;
  }>;
  goto: Page["goto"];
  token: string | undefined;
  gql: <T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: { ignoreError?: boolean },
  ) => Promise<T>;
} & Config;

export const test = base.extend<{
  reearth: Reearth;
}>({
  reearth: async ({ page, request }, use) => {
    use({
      ...config,
      token: getAccessToken(),
      initUser() {
        return initUser(this.token || "", request);
      },
      async goto(url, options) {
        const res = await page.goto(url, options);
        if (this.token) {
          await page.evaluate(`window.REEARTH_E2E_ACCESS_TOKEN = ${JSON.stringify(this.token)};`);
        }
        return res;
      },
      async gql(query, variables, options) {
        if (!this.token) throw new Error("access token is not initialized");

        const resp = await request.post(config.api + "/graphql", {
          data: {
            query,
            variables,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        const body = await resp.json();
        if (!options?.ignoreError && (!resp.ok() || body.errors)) {
          throw new Error(`GraphQL error: ${JSON.stringify(body)}`);
        }

        return body;
      },
    });
  },
});

export async function initUser(
  token: string,
  ctx?: APIRequestContext,
): Promise<{
  token: string;
  userId: string;
  teamId: string;
  userName: string;
}> {
  if (!token) {
    throw new Error("access token is not initialized");
  }

  const { userName, userId, teamId, api, signUpSecret } = config;

  if (!userName || !userId || !teamId || !api) {
    throw new Error(
      `either userName, userId, teamId and api are missing: ${JSON.stringify({
        userName,
        userId,
        teamId,
        api,
        signUpSecret: signUpSecret ? "***" : "",
      })}`,
    );
  }

  ctx = ctx || (await request.newContext());

  const resp = await ctx.post(api + "/graphql", {
    data: {
      query: `mutation($userId: ID!, $teamId: ID!, $lang: Lang, $secret: String) {
        deleteMe(input: { userId: $userId }) { userId }
        signup(input: { lang: $lang, userId: $userId, teamId: $teamId, secret: $secret }) { user { id } }
      }`,
      variables: {
        userId,
        teamId,
        secret: signUpSecret,
        lang: "en",
      },
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await resp.json();
  if (!resp.ok() || body.errors) {
    throw new Error(
      `failed to init an user: ${JSON.stringify(body)} with ${JSON.stringify({
        userName,
        userId,
        teamId,
        api,
        signUpSecret: signUpSecret ? "***" : "",
      })}`,
    );
  }

  return {
    token,
    userName,
    userId: body.data.signup.user.id,
    teamId,
  };
}
