import "@testing-library/cypress/add-commands";
import "./types";

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
    message: `${Cypress.env("REEARTH_WEB_API")}`,
  });

  cy.intercept(Cypress.env("REEARTH_WEB_API")).as("graphql");

  return cy
    .login()
    .then(token =>
      cy.request({
        method: "POST",
        url: Cypress.env("REEARTH_WEB_API"),
        body: {
          query: `mutation($userId: ID!, $teamId: ID!, $name: String!, $lang: String!) {
  deleteMe(input: { userId: $userId }) { userId }
  signup(input: { userId: $userId, teamId: $teamId }) { user { id } }
  updateMe(input: { name: $name, lang: $lang }) { user { id, name, lang } }
}`,
          variables: {
            userId: Cypress.env("REEARTH_WEB_E2E_USER_ID"),
            teamId: Cypress.env("REEARTH_WEB_E2E_TEAM_ID"),
            name: Cypress.env("REEARTH_WEB_E2E_USERNAME"),
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
      url: `https://${Cypress.env("REEARTH_WEB_AUTH0_DOMAIN")}/oauth/token`,
      body: {
        username: Cypress.env("REEARTH_WEB_E2E_USERNAME"),
        password: Cypress.env("REEARTH_WEB_E2E_PASSWORD"),
        client_id: Cypress.env("REEARTH_WEB_AUTH0_CLIENT_ID"),
        grant_type: "password",
        scope: "openid email profile",
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
