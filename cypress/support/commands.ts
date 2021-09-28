import "@testing-library/cypress/add-commands";
import "./types";
import * as config from "./config";

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// ***********************************************
// ⚠️ DON'T FORGET TO ADD A NEW TYPE DEFINITION TO types.ts!
// ***********************************************

Cypress.Commands.add("init", () => {
  Cypress.log({
    name: "init",
    message: `${config.api}/graphql`,
  });

  cy.intercept(`${config.api}/graphql`).as("graphql");

  return cy
    .login()
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

Cypress.Commands.add("loginAndVisit", (url: string, options?: Partial<Cypress.VisitOptions>) => {
  Cypress.log({
    name: "loginAndVisit",
  });

  return cy.login().then(token => {
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

Cypress.Commands.add("cesiumViewer", () => cy.window().then(w => w.REEARTH_E2E_CESIUM_VIEWER));

function oauthDomain(u: string | undefined): string {
  if (!u) return u;
  if (!u.startsWith("https://") && !u.startsWith("http://")) {
    u = "https://" + u;
  }
  return u.endsWith("/") ? u.slice(0, -1) : u;
}
