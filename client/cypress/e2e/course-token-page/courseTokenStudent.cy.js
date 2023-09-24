describe("Course Tokens Page Student", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly/";

  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';

  const navbarButton = '[data-cy="navbar-button"]';
  const navbar = '[data-cy="navbar"]';
  const noTokensAlert = '[data-cy="no-tokens-alert"]';

  const tokenName = '[data-cy="token-name"]';
  const tokenDescription = '[data-cy="token-description"]';
  const tokenQuantity = '[data-cy="token-quantity-student"]';

  beforeEach(() => {
    //cy.task("createTokensForCourse", courseCode, tokens)
    cy.task("enableCourseTokens", "ali-the-professor");
    cy.task("deleteAllTokens", "ABCDEF");

    cy.visit(BASE_URL + "login");

    cy.get(userNameInputText).type("ali-the-student");
    cy.get(passwordInputText).type("ali-the-student");
    cy.get(loginButton).click();

    cy.contains("p", "Data Structures").click();
  });

  describe("No Tokens", () => {
    before(() => {
      cy.task("deleteAllTokens", "ABCDEF");
    });
    it("No Tokens Student View", () => {
      cy.get(navbarButton).click();
      cy.get(navbar).contains("a", "course tokens").click();
      cy.get("body").click();
      cy.get(noTokensAlert).should("be.visible");
    });
  });

  describe("One Token", () => {
    beforeEach(() => {
      cy.task("deleteAllTokens", "ABCDEF");
      cy.task("createCourseToken", {
        courseCode: "ABCDEF",
        tokenQuantity: 3,
        tokenTitle: "Clue",
      });
      cy.visit(BASE_URL + "login");

      cy.contains("p", "Data Structures").click();
    });
    it("Tokens Student View", () => {
      cy.get(navbarButton).click();
      cy.get(navbar).contains("a", "course tokens").click();
      cy.get("body").click();
      cy.get(tokenName).should("be.visible").contains("h5", "Clue");
      cy.get(tokenDescription).should("not.be.visible");
      cy.get(tokenQuantity).should("be.visible").contains("h5", "3/3");
    });
    it("Tokens Student View - used token", () => {
      cy.task("useStudentsToken", {
        userName: "ali-the-student",
        tokenName: "Clue",
        courseCode: "ABCDEF",
      });
      cy.get(navbarButton).click();
      cy.get(navbar).contains("a", "course tokens").click();
      cy.get("body").click();
      cy.get(tokenName).should("be.visible").contains("h5", "Clue");
      cy.get(tokenDescription).should("not.be.visible");
      cy.get(tokenQuantity).should("be.visible").contains("h5", "2/3");
    });
  });

  describe("Multiple Tokens", () => {
    beforeEach(() => {
      cy.task("deleteAllTokens", "ABCDEF");
      cy.task("createCourseToken", {
        courseCode: "ABCDEF",
        tokenQuantity: 3,
        tokenTitle: "Clue",
      });
      cy.task("createCourseToken", {
        courseCode: "ABCDEF",
        tokenQuantity: 5,
        tokenTitle: "Debugging",
      });
      cy.visit(BASE_URL + "login");

      cy.contains("p", "Data Structures").click();
    });
    it("Tokens Student View", () => {
      cy.get(navbarButton).click();
      cy.get(navbar).contains("a", "course tokens").click();
      cy.get("body").click();
      cy.get(tokenName).should("be.visible").eq(0).contains("h5", "Clue");
      cy.get(tokenDescription).should("not.be.visible");
      cy.get(tokenQuantity).should("be.visible").eq(0).contains("h5", "3/3");
      cy.get(tokenName).should("be.visible").eq(1).contains("h5", "Debugging");
      cy.get(tokenQuantity).should("be.visible").eq(1).contains("h5", "5/5");
    });
  });
});
