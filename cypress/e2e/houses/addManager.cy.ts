/// <reference types="cypress" />

describe("Add Manager to House", () => {
    it("should successfully add the manager to the house", () => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.login("admin@test.com", "StrongPass123"))
            .then(() => {
                cy.get("a:contains('Manage Houses')").click();
                cy.get("button:contains('▶')").first().click();
                cy.get("[data-testid='primary-add']").click();
                cy.url().should("include", "/house/H1/add-manager?position=primary");
                cy.get("button:contains('Add')").first().click();
                cy.contains("Manager added to house successfully").should("be.visible");
                cy.get("button:contains('▶')").first().click();
                cy.contains("Bob Manager").should("be.visible");
            });
    })
})