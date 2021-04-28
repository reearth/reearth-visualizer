import { userName, teamId } from "../common";

beforeEach(() => {
  cy.init();
});

context("Dashboard", () => {
  it("should display page", () => {
    cy.loginAndVisit(`/dashboard/${teamId}`);
    cy.findByText(`${userName}'s workspace`).should("exist");
  });
});
