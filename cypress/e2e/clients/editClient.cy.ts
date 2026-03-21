/// <reference types="cypress" />


describe("EditClient", () => {
    it("should successfully update the client",() => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.login("admin@test.com","StrongPass123"))
            .then(() => {
                cy.get("a:contains('Manage Clients')").click();
                cy.get("a:contains('c1')").click();
                cy.get("a:contains('Edit Client')").click();
                cy.get("input[name=legalName]").clear().type("Updated Client");
                cy.get("button:contains('Update Client')").click();
                cy.contains("Client successfully updated").should("exist");
                cy.url().should("include", "/view-client/c1");
                cy.contains("Updated Client").should("exist");
            });
    });
})