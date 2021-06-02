import { userDisplayName, teamId } from "../common";

beforeEach(() => {
  cy.init();
});

context("Dashboard", () => {
  it("should display page", () => {
    cy.loginAndVisit(`/dashboard/${teamId}`);
    cy.findByText(`${userDisplayName}'s workspace`).should("exist");
  });
});
