/// <reference types="cypress" />

describe("Register Page", () => {
    beforeEach(() => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.visit("/register"));
    });

    it("should register a new employee and redirect to login", () => {
        cy.get("input[name=id]").type("E12345");
        cy.get("input[name=name]").type("New Employee");
        cy.get("input[name=email]").type("new@associate.com");
        cy.get("input[name=password]").type("StrongPass123");
        cy.get("input[name=confirmPassword]").type("StrongPass123");
        cy.get("input[name=hireDate]").type("2024-06-01");
        cy.get("button[type=submit]").click();
        cy.url().should("include", "/dashboard");
        cy.contains("Dashboard");
    });

    it("should show validation error for duplicate employee ID", () => {
        cy.get("input[name=id]").type("test123");
        cy.get("input[name=name]").type("Duplicate Employee");
        cy.get("input[name=email]").type("duplicate@mail.com");
        cy.get("input[name=password]").type("StrongPass123");
        cy.get("input[name=confirmPassword]").type("StrongPass123");
        cy.get("input[name=hireDate]").type("2024-06-01");
        cy.get("button[type=submit]").click();
        cy.contains("Id already exists");
    });

    it("should show validation error for duplicate email", () => {
        cy.get("input[name=id]").type("E54321");
        cy.get("input[name=name]").type("Duplicate Email");
        cy.get("input[name=email]").type("admin@test.com");
        cy.get("input[name=password]").type("StrongPass123");
        cy.get("input[name=confirmPassword]").type("StrongPass123");
        cy.get("input[name=hireDate]").type("2024-06-01");
        cy.get("button[type=submit]").click();
        cy.contains("Email already exists");
    })
});