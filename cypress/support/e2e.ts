/// <reference types="." />

import "@testing-library/cypress/add-commands";
import * as config from "./config";

Cypress.Commands.add("init", () => {
  Cypress.log({
    name: "init",
    message: `${config.api}/graphql`,
  });

  cy.intercept(`${config.api}/graphql`).as("graphql");

  cy.login()
    .then(token =>
      cy.request({
        method: "POST",
        url: `${config.api}/graphql`,
        body: {
          query: `mutation($userId: ID!, $teamId: ID!, $lang: Lang, $secret: String) {
  deleteMe(input: { userId: $userId }) { userId }
  signup(input: { lang: $lang, userId: $userId, teamId: $teamId, secret: $secret }) { user { id } }
}`,
          variables: {
            userId: config.userId,
            teamId: config.teamId,
            secret: config.signUpSecret,
            lang: "en",
          },
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    )
    .then(req => {
      if (req.body.errors) {
        throw new Error(`GraphQL error: ${JSON.stringify(req.body)}`);
      }
    });
});

Cypress.Commands.add("login", () => {
  Cypress.log({
    name: "login",
  });

  return cy
    .request({
      method: "POST",
      url: `${oauthDomain(config.authUrl)}/oauth/token`,
      body: {
        username: config.userName,
        password: config.password,
        audience: config.authAudience,
        client_id: config.authClientId,
        grant_type: "password",
        scope: "openid profile email",
      },
    })
    .then(resp => {
      const { access_token } = resp.body;
      if (!access_token) {
        throw new Error("access token is missing!");
      }
      return access_token;
    });
});

Cypress.Commands.add("loginAndVisit", (url, options) => {
  Cypress.log({
    name: "loginAndVisit",
  });

  cy.login().then(token => {
    return cy.visit(url, {
      ...options,
      failOnStatusCode: false,
      onBeforeLoad(win) {
        options?.onBeforeLoad?.(win);
        win.REEARTH_E2E_ACCESS_TOKEN = token;
      },
    });
  });
});

Cypress.Commands.add("waitForGraphQL", () =>
  cy.wait("@graphql", {
    timeout: 1000 * 10,
  }),
);

Cypress.Commands.add("cesiumViewer", () => {
  cy.window().then(w => w.REEARTH_E2E_CESIUM_VIEWER);
});

function oauthDomain(u: string | undefined): string {
  if (!u) return "";
  if (!u.startsWith("https://") && !u.startsWith("http://")) {
    u = "https://" + u;
  }
  return u.endsWith("/") ? u.slice(0, -1) : u;
}
