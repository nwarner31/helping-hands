/// <reference types="cypress" />

describe('Create House', () => {
    beforeEach(() => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.login("admin@test.com", "StrongPass123"))
            .then(() => {
                cy.get("a:contains('Manage Houses')").click();
                cy.get("a:contains('Add House')").click();
            });
    });
    const enterSharedData = () => {
        cy.get("input[name=street1]").type("1 W Test Rd");
        cy.get("input[name=city]").type("Testville");
        cy.get("input[name=state]").type("TS");
        cy.get("input[name=maxClients]").type("4");
    }
    it("should create a new house successfully", () => {
        enterSharedData();
       cy.get("input[name=id]").type("H3");
       cy.get("input[name=name]").type("Test House 3");
       cy.get("button:contains('Add House')").click();
       cy.contains("House successfully added");
       cy.url().should("include", "/view-houses");
       cy.contains("H3").should("be.visible");
    });
    it("should show validation errors for duplicate house id and name", () => {
        enterSharedData();
        cy.get("input[name=id]").type("H1");
        cy.get("input[name=name]").type("Test House 1");
        cy.get("button:contains('Add House')").click();
        cy.contains("House ID already exists");
        cy.contains("House Name already exists");
        cy.url().should("include", "/add-house");
    });
    it("should show validation errors for empty fields", () => {
        cy.get("button:contains('Add House')").click();
        cy.contains("House ID is required").should("exist");
        cy.contains("House name is required").should("exist");
        cy.contains("Street 1 is required").should("exist");
        cy.contains("City is required").should("exist");
        cy.contains("State is required").should("exist");
        cy.url().should("include", "/add-house");
    })
})