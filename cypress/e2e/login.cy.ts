/// <reference types="cypress" />



describe("Login Page", () => {
    beforeEach(() => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.visit("/login"));


    });
    it("should login as admin and redirect to admin dashboard", () => {
        cy.get("input[name=email]").type("admin@test.com");
        cy.get("input[name=password]").type("StrongPass123");
        cy.get("button[type=submit]").click();
        cy.url().should("include", "/dashboard");
        cy.contains("Dashboard");
        cy.contains("a", "Manage Clients").should("exist");
        cy.contains("a", "Manage Houses").should("exist");
    });
    it("should show error for invalid credentials", () => {
        cy.get("input[name=email]").type("admin@test.com");
        cy.get("input[name=password]").type("WrongPassword");
        cy.get("button[type=submit]").click();
        cy.contains("Invalid email or password.").should("exist");
    })
})