/// <reference types="cypress" />


describe("EditHouse", () => {
    beforeEach(() => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.login("admin@test.com", "StrongPass123"))
            .then(() => {
                cy.get("a:contains('Manage Houses')").click();
                cy.get("a:contains('Edit')").first().click();
            });
    });
    it("should successfully update the house", () => {
       cy.get("input[name=name]").clear().type("Updated House");
       cy.get("button:contains('Update House')").click();
       cy.contains("House successfully updated").should("exist");
       cy.url().should("include", "/view-houses");
       cy.contains("Updated House");
    });
    it("should show validation error for duplicate house name", () => {
        cy.get("input[name=name]").clear().type("Test House 2");
        cy.get("button:contains('Update House')").click();
        cy.contains("House name already exists").should("exist");
        cy.url().should("include", "/edit-house/H1");
    })
});