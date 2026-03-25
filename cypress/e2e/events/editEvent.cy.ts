// <reference types="cypress" />


describe("EditEvent", () => {
    it("should successfully update the event", () => {
        cy.task("db:teardown")
            .then(() => cy.task("db:seed"))
            .then(() => cy.login("admin@test.com", "StrongPass123"))
            .then(() => {
                cy.get("a:contains('Manage Clients')").click();
                cy.get("a:contains('c1')").click();
                cy.get("button:contains('Upcoming Events')").click();
                cy.get("a:contains('e1')").click();
                cy.get("a:contains('Edit')").click();
                cy.get("textarea[name=description]").clear().type("Updated Description");
                cy.get("button:contains('Update Event')").click();
                cy.contains("Event successfully updated").should("exist");
                //cy.contains("View Event").should("exist");
                cy.contains("Updated Description").should("exist");
            });
    })
});