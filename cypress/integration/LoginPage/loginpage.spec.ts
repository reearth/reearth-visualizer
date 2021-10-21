import "../common";

beforeEach(() => {
  cy.init();
});

context("LoginPage", () => {
  it("should display a log in button", () => {
    cy.visit("/login");
    cy.findByRole("button").should("is.visible");
  });
});
