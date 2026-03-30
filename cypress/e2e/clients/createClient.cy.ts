/// <reference types="cypress" />


describe('CreateClient', () => {
    beforeEach(() => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.login("admin@test.com", "StrongPass123"))
            .then(() => {
                cy.get("a:contains('Manage Clients')").click();
                cy.get("a:contains('Add Client')").click();
            })
    });
    const sharedFieldEntries = () => {
        cy.get("input[name=legalName]").type("Test Client");
        cy.get("input[name=dateOfBirth]").type("2000-04-12");
    }
    it('should create a new client successfully', () => {
        sharedFieldEntries();
       cy.get("input[name=id]").type("T12345");
       cy.get("button:contains('Add Client')").click();
       cy.contains("Client successfully added").should("exist");
       cy.url().should("include", "/view-clients");
    });
    it("should show validation error for duplicate client ID", () => {
        sharedFieldEntries();
        cy.get("input[name=id]").type("c1");
        cy.get("button:contains('Add Client')").click();
        cy.contains("Client ID already exists").should("exist");
        cy.url().should("include", "/add-client");
    });
    it("should display validation errors for empty fields", () => {
        cy.get("button:contains('Add Client')").click();
        cy.contains("Client ID is required").should("exist");
        cy.contains("Legal name is required").should("exist");
        cy.contains("Date of Birth is required").should("exist");
        cy.url().should("include", "/add-client");
    });
});