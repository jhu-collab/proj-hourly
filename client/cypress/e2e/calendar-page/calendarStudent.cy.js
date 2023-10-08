const userNameInputText = '[data-cy="username-input-text"]';
const passwordInputText = '[data-cy="password-input-text"]';
const loginButton = '[data-cy="login-button"]';
describe("Calendar Page: Student Office Hours", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly/";
  before(() => {
    cy.task("removeOH", "ABCDEF");
    cy.task("addOfficeHoursDS");
  });

  after(() => {
    cy.task("removeOH", "ABCDEF");
  });

  describe("Student registration", () => {
    beforeEach(() => {
      cy.task("removeOH", "ABCDEF");
      cy.task("addOfficeHoursDS");
      cy.visit(BASE_URL);
      cy.get(userNameInputText).type("ali-the-student");
      cy.get(passwordInputText).type("ali-the-student");
      cy.get(loginButton).click();
      cy.contains("p", "Data Structures").click();
    });

    it("Student cannot make office hours", () => {
      cy.get('button[title="Next week"]').should("be.visible").click();
      cy.get('[data-cy="full-calendar"]').click();
      cy.get('[data-cy="create-event-form"]').should("not.exist");
    });

    it("Student can register for Office Hours", () => {
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
      cy.get("ul li").should("have.length", 3);
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

    it("Student can cancel an office hours they registered for", () => {
      cy.get("[data-cy^=event-]").first().click({ force: true });
      cy.get('[data-cy="student-register-button"]').click();
      cy.get('[data-cy="oh-topic-dropdown"]').click();
      cy.get('[data-cy="Regular"]').click();
      cy.get('[data-cy="student-time-slots"]').click();
      cy.get("ul>li").eq(3).click();
      cy.get('[data-cy="student-submit-register"]').click();

      //Click on the event
      cy.get(".css-1fn5qdc").click();
      cy.wait(1000);
      //Click to init cancel
      cy.get('[data-cy="student-register-button"]').click();
      //click b/c 100% sure to cancel
      cy.get('[data-cy="confirm-delete-button"]').click();

      cy.get("[data-cy^=event-]").first().click({ force: true });
      cy.get('[data-cy="student-register-status"]')
        .should("be.visible")
        .contains("You are not registered for this session");

      cy.visit(BASE_URL + "registrations");
      cy.get('[data-cy="registration-text"]').should("have.length", 0);
    });
  });
});
