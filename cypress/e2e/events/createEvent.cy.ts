// <reference types="cypress" />


describe("CreateEvent", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
   beforeEach(() => {
       cy.task("db:teardown")
           .then(() => cy.task("db:seed"))
           .then(() => cy.login("admin@test.com", "StrongPass123"))
           .then(() => {
               cy.get("a:contains('Manage Clients')").click();
               cy.get("a:contains('c1')").click();
               cy.get("button:contains('Upcoming Events')").click();
               cy.get("a:contains('Add Event')").click();
               cy.get("input[name=beginDate]").type(tomorrow.toISOString().split("T")[0]);
               cy.get("input[name=endDate]").type(tomorrow.toISOString().split("T")[0]);
               cy.get("input[name=beginTime]").type("10:00");
               cy.get("input[name=endTime]").type("11:00");
               cy.get("input[name=numberStaffRequired]").clear().type("2");
               cy.get("textarea[name=description]").type("Test Cypress Event");
               cy.get("select[name=type]").select("WORK");
           })
   });
   it("should create a new event successfully", () => {
      cy.get("input[name=id]").type("event4");
      cy.get("button:contains('Add Event')").click();
      cy.contains("Event successfully added").should("exist");
      cy.url().should("include", "/view-client/c1");
      cy.contains("View Client").should("exist");
      cy.contains("c1").should("exist");
   });
   it("should show validation error for duplicate event ID", () => {
       cy.get("input[name=id]").type("e1");
       cy.get("button:contains('Add Event')").click();
       cy.contains("Event ID already exists").should("exist");
       cy.url().should("include", "/add-event");
   })
});