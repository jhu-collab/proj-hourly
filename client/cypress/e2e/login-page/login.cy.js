import { Experimental_CssVarsProvider } from "@mui/material";

describe("Login Page", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly";

  const signInAsUserButton = '[data-cy="sign-in-as-user-button"]';
  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';
  const ellipsisButton = '[data-cy="ellipsis-icon-button"]';
  const profileName = '[data-cy="profile-name"]';
  const loginAlert = '[data-cy="login-alert"]';
  const loginTitle = '[data-cy="login-title"]';
  const loginSubtitle = '[data-cy="login-subtitle"]';
  const loginDivider = '[data-cy="login-divider-or"]';
  const loginEye = '[data-cy="login-password-eye"]';

  beforeEach(() => {
    cy.visit(BASE_URL + "/login");
  });

  describe("Layout", () => {
    /** Test: Layout Contains all Required Elements
     * This test verifies that all elements on the /login endpoint are visible/enabled as expected.
     * 1. Page should contain an input field and corresponding label for the login username.
     * 2. Page should contain an input field and corresponding label for the login password.
     * 3. Page should contain a clickable button to login.
     * 4. Page should contain a clickable button to sign in as a user.
     */
    it("Layout Contains all Required Elements", () => {
      cy.get(loginTitle).should("be.visible");
      cy.get(loginSubtitle).should("be.visible");
      cy.get(loginDivider).should("be.visible");
      cy.get(loginEye).should("be.visible").should("be.enabled");
      cy.get(loginAlert).should("be.visible");
      cy.get(signInAsUserButton).should("be.visible").should("be.enabled");
      cy.get(userNameInputText).should("be.visible");
      cy.get(passwordInputText).find("input[type='password']").should("exist");
      cy.get(passwordInputText)
        .find(".MuiInputBase-input")
        .should("have.attr", "type", "password");
      cy.get(loginButton).should("be.visible").should("be.enabled");
    });

    it("Successful Eye Click to Show Password", () => {
      cy.get(userNameInputText).type("ali-the-professor");
      cy.get(passwordInputText).type("ali-the-professor");
      cy.get(loginEye).click();
      cy.get(passwordInputText)
        .find(".MuiInputBase-input")
        .should("have.attr", "type", "text");
    });

    it("Successful Eye Click to Hide Password", () => {
      cy.get(userNameInputText).type("ali-the-professor");
      cy.get(passwordInputText).type("ali-the-professor");
      cy.get(loginEye).click();
      cy.get(loginEye).click();
      cy.get(passwordInputText)
        .find(".MuiInputBase-input")
        .should("have.attr", "type", "password");
    });
  });

  describe("Student", () => {
    it("Successful Login with Student Username/Password", () => {
      cy.get(userNameInputText).type("ali-the-student");
      cy.get(passwordInputText).type("ali-the-student");
      cy.get(loginButton).click();
      cy.get(ellipsisButton).then(($button) => {
        if ($button.length > 0) {
          expect($button).to.be.visible;
          $button.click();
          cy.get(profileName).should("have.text", "Ali-Student Student");
        } else {
          cy.get(profileName).should("have.text", "Ali-Student Student");
        }
      });
      cy.url().should("be.equal", BASE_URL);
    });

    it("Failed Student Login with Invalid Username", () => {
      cy.get(userNameInputText).type("InvalidUsername");
      cy.get(passwordInputText).type("ali-the-student");
      cy.get(loginButton).click();

      cy.get(".Toastify")
        .contains("div", "Wrong username or password")
        .should("be.visible");
    });

    it("Failed Student Login with Invalid Password", () => {
      cy.get(userNameInputText).type("ali-the-student");
      cy.get(passwordInputText).type("InvalidPassword");
      cy.get(loginButton).click();

      cy.get(".Toastify")
        .contains("div", "Wrong username or password")
        .should("be.visible");
    });
  });

  describe("Staff", () => {
    it("Successful Login with Staff Username/Password", () => {
      cy.get(userNameInputText).type("ali-the-ta");
      cy.get(passwordInputText).type("ali-the-ta");
      cy.get(loginButton).click();
      cy.get(ellipsisButton).then(($button) => {
        if ($button.length > 0) {
          expect($button).to.be.visible;
          $button.click();
          cy.get(profileName).should("have.text", "Ali-TA TA");
        } else {
          cy.get(profileName).should("have.text", "Ali-TA TA");
        }
      });
      cy.url().should("be.equal", BASE_URL);
    });

    it("Failed Staff Login with Invalid Username", () => {
      cy.get(userNameInputText).type("InvalidUsername");
      cy.get(passwordInputText).type("ali-the-ta");
      cy.get(loginButton).click();

      cy.get(".Toastify")
        .contains("div", "Wrong username or password")
        .should("be.visible");
    });

    it("Failed Staff Login with Invalid Password", () => {
      cy.get(userNameInputText).type("ali-the-ta");
      cy.get(passwordInputText).type("InvalidPassword");
      cy.get(loginButton).click();

      cy.get(".Toastify")
        .contains("div", "Wrong username or password")
        .should("be.visible");
    });
  });

  describe("Instructor", () => {
    /** Test: Successful Login
     * This test verifies that the user is able to successfully login with a valid username and password
     * when the "Login" button is clicked.
     * 1. Verify that the user is redirected to the / endpoint.
     */
    it("Successful Login with Instructor Username/Password", () => {
      cy.get(userNameInputText).type("ali-the-professor");
      cy.get(passwordInputText).type("ali-the-professor");
      cy.get(loginButton).click();
      cy.wait(1000);
      cy.get(ellipsisButton).then(($button) => {
        if ($button.length > 0) {
          expect($button).to.be.visible;
          $button.click();
          cy.get(profileName).should("have.text", "Ali-Professor Professor");
        } else {
          cy.get(profileName).should("have.text", "Ali-Professor Professor");
        }
      });
      cy.url().should("be.equal", BASE_URL);
    });
    /** Test: Failed Login with Invalid Username
     * This test verifies that the user is displayed with a valid error message if they enter an invalid
     * username and clicks the "Login" button.
     * 1. Verify that a toast message is displayed with the text "Wrong username or password".
     */
    it("Failed Instructor Login with Invalid Username", () => {
      cy.get(userNameInputText).type("InvalidUsername");
      cy.get(passwordInputText).type("ali-the-professor");
      cy.get(loginButton).click();

      cy.get(".Toastify")
        .contains("div", "Wrong username or password")
        .should("be.visible");
    });

    /** Test: Failed Login with Invalid Password
     * This test verifies that the user is displayed with a valid error message if they enter an invalid
     * password and clicks the "Login" button.
     * 1. Verify that a toast message is displayed with the text "Wrong username or password".
     */
    it("Failed Instructor Login with Invalid Password", () => {
      cy.get(userNameInputText).type("ali-the-professor");
      cy.get(passwordInputText).type("InvalidPassword");
      cy.get(loginButton).click();

      cy.get(".Toastify")
        .contains("div", "Wrong username or password")
        .should("be.visible");
    });
  });
});