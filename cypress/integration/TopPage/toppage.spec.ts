import "../common";

beforeEach(() => {
  cy.init();
});

context("TopPage", () => {
  it("should display a log in button", () => {
    cy.visit("/");
    cy.findByRole("button").should("is.visible");
  });
});
