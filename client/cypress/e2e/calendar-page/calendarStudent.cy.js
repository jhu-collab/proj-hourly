describe("Calendar Page: Student Office Hours", () => {
  const BASE_URL = "http://localhost:3000/";

  before(() => {
    cy.task("removeOH", "ABCDEF");
    cy.task("addOfficeHoursDS");
  });

  after(() => {
    //cy.task("removeOH", "ABCDEF");
  });

  describe("Student registration", () => {
    beforeEach(() => {
      cy.task("removeOH", "ABCDEF");
      cy.task("addOfficeHoursDS");
      cy.visit(BASE_URL);
      cy.get('input[id=":r1:"]').type("ali-the-student");
      cy.get('input[id=":r3:"]').type("ali-the-student");
      cy.contains("button", "Login").click();

      cy.contains("p", "Data Structures").click();
    });
    it("Student cannot make office hours", () => {
      cy.get('button[title="Next week"]').should("be.visible").click();
      cy.get('[data-cy="full-calendar"]').click();
      cy.get('[data-cy="create-event-form"]').should("not.exist");
    });
    it.only("Student can register for Office Hours", () => {
      cy.get("[data-cy^=event-]").first().click({ force: true });
      cy.get('[data-cy="student-register-status"]')
        .should("be.visible")
        .contains("You are not registered for this session");
      cy.get('[data-cy="student-register-button"]')
        .should("be.visible")
        .click();
      cy.get('[data-cy="student-register-text"]').contains(
        "You are about to register for"
      );
      cy.get('[data-cy="oh-topic-dropdown"]').click();

      //Should have only Regular or Debugging options
      //Bug
      cy.get("ul li").should("have.length", 2);

      cy.get('[data-cy="Regular"]').click();
      cy.get('[data-cy="student-time-slots"]').click();

      cy.get("ul>li").eq(3).click();

      //cy.get('[data-cy="student-topic-options"]').click();

      //cy.get("ul>li").eq(3).click();

      cy.get('[data-cy="student-submit-register"]').click();
      cy.get(".Toastify").contains("div", "Successfully registered");

      cy.visit(BASE_URL + "registrations");
      cy.get('[data-cy="registration-text"]').should("have.length", 1);
    });
  });
});
