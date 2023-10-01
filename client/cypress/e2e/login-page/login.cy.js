import { Experimental_CssVarsProvider } from "@mui/material";

describe("Login Page", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly";

  const signInAsUserButton = '[data-cy="sign-in-as-user-button"]';
  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';
  const ellipsisButton = '[data-cy="ellipsis-icon-button"]';
  const profileNameButton = '[data-cy="profile-name-button"]';
  const loginAlert = '[data-cy="login-alert"]';
  const loginTitle = '[data-cy="login-title"]';
  const loginSubtitle = '[data-cy="login-subtitle"]';
  const loginDivider = '[data-cy="login-divider-or"]';
  const loginEye = '[data-cy="login-password-eye"]';

  const accounts = new Map();
  accounts.set("Ali-Student", {
    firstName: "Ali-Student",
    lastName: "Student",
    email: "ali-the-student@jhu.edu",
  });
  accounts.set("Ali-Professor", {
    firstName: "Ali-Professor",
    lastName: "Professor",
    email: "amadooe1@jhu.edu",
  });
  accounts.set("Ali-TA", {
    firstName: "Ali-TA",
    lastName: "TA",
    email: "alimadooei@gmail.com",
  });

  beforeEach(() => {
    cy.visit(BASE_URL + "/login");
  });

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
    cy.get(loginButton).should("be.visible").should("be.enabled");
  });

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
    cy.get(ellipsisButton).should(($button) => {
      if($button.length > 0) {
        expect($button).to.be.visible;
        $button.click();
        cy.get(profileNameButton).should("be.equal", "Ali-Professor Professor");
      } else {
        cy.get(profileNameButton).should("be.equal", "Ali-Professor Professor");
      }
    });
    cy.url().should("be.equal", BASE_URL);
  });

  it("Successful Login with Staff Username/Password", () => {
    cy.get(userNameInputText).type("ali-the-ta");
    cy.get(passwordInputText).type("ali-the-ta");
    cy.get(loginButton).click();
    cy.get(ellipsisButton).click();
    // .should(($button) => {
    //   if($button.length > 0) {
    //     expect($button).to.be.visible;
    //     $button.click();
    //   } else {
    //     cy.get(profileNameButton).should("be.equal", "Ali-TA TA");
    //   }
    // }); 
    cy.get(profileNameButton).should("be.equal", "Ali-TA TA");

    cy.url().should("be.equal", BASE_URL);
  });

  it("Successful Login with Student Username/Password", () => {
    cy.get(userNameInputText).type("ali-the-student");
    cy.get(passwordInputText).type("ali-the-student");
    cy.get(loginButton).click();
    cy.get(ellipsisButton).should(($button) => {
      if($button.length > 0) {
        expect($button).to.be.visible;
        $button.click();
        cy.get(profileNameButton).should("be.equal", "Ali-Student Student");
      } else {
        cy.get(profileNameButton).should("be.equal", "Ali-Student Student");
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

  it("Failed Staff Login with Invalid Username", () => {
    cy.get(userNameInputText).type("InvalidUsername");
    cy.get(passwordInputText).type("ali-the-ta");
    cy.get(loginButton).click();

    cy.get(".Toastify")
      .contains("div", "Wrong username or password")
      .should("be.visible");
  });

  it("Failed Student Login with Invalid Username", () => {
    cy.get(userNameInputText).type("InvalidUsername");
    cy.get(passwordInputText).type("ali-the-student");
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

  it("Failed Staff Login with Invalid Password", () => {
    cy.get(userNameInputText).type("ali-the-ta");
    cy.get(passwordInputText).type("InvalidPassword");
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

  /** Test: Successful Sign In as User
   * This test verifies that the user is signed in as a test user upon clicking the "Sign in as user"
   * button. In the deployed version of the app, this button should be replaced with one allowing JHU
   * single sign on.
   * 1. Verify that the user is redirected to the / endpoint.
   */
  it("Successful Sign In as User", () => {
    cy.get(signInAsUserButton).click();
    cy.url().should("be.equal", BASE_URL);
  });

  it("Successful Eye Click to Show Password", () => {
    cy.get(userNameInputText).type("ali-the-professor");
    cy.get(passwordInputText).type("ali-the-professor");
    cy.get(loginEye).click();
    cy.get(passwordInputText).should("have.attr", "type", "text");
  });

  it("Successful Eye Click to Hide Password", () => {
    cy.get(userNameInputText).type("ali-the-professor");
    cy.get(passwordInputText).type("ali-the-professor");
    cy.get(loginEye).click();
    cy.get(loginEye).click();
    cy.get(passwordInputText).should("have.attr", "type", "password");
  });
});