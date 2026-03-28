/// <reference types="cypress" />

describe("Add Client to House", () => {
    it("should successfully add the client to the house", () => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.login("admin@test.com", "StrongPass123"))
            .then(() => {
                cy.get("a:contains('Manage Houses')").click();
                cy.get("button:contains('▶')").first().click();
                cy.get("[data-testid='client-add-button']").first().click();
                cy.url().should("include", "/house/H1/add-client");
                cy.get("button:contains('Add')").first().click();
                cy.contains("Client added to house successfully").should("be.visible");
                cy.contains("1/2").should("be.visible");
                cy.get("button:contains('▶')").first().click();
                cy.get("[data-testid='client-remove-button']").should("have.length", 1);
                cy.contains("Client One").should("be.visible");
            });
    })
})