/// <reference types="cypress" />

export const api: string = Cypress.env("REEARTH_WEB_API");
export const userId: string = Cypress.env("REEARTH_WEB_E2E_USER_ID");
export const userName: string = Cypress.env("REEARTH_WEB_E2E_USERNAME");
export const password: string = Cypress.env("REEARTH_WEB_E2E_PASSWORD");
export const teamId: string = Cypress.env("REEARTH_WEB_E2E_TEAM_ID");
export const authAudience: string = Cypress.env("REEARTH_WEB_AUTH0_AUDIENCE");
export const authClientId: string = Cypress.env("REEARTH_WEB_AUTH0_CLIENT_ID");
export const authUrl: string = Cypress.env("REEARTH_WEB_AUTH0_DOMAIN");
export const signUpSecret: string = Cypress.env("REEARTH_WEB_E2E_SIGNUP_SECRET");
