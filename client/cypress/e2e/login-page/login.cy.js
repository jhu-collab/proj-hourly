describe("Login Page", () => {
  const BASE_URL = "http://localhost:3000/";

  const signInAsUserButton = '[data-cy="sign-in-as-user-button"]';
  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';

  beforeEach(() => {
    cy.visit(BASE_URL + "login");
  });

  /** Test: Layout Contains all Required Elements
   * This test verifies that all elements on the /login endpoint are visible/enabled as expected.
   * 1. Page should contain an input field and corresponding label for the login username.
   * 2. Page should contain an input field and corresponding label for the login password.
   * 3. Page should contain a clickable button to login.
   * 4. Page should contain a clickable button to sign in as a user.
   */
  it.only("Layout Contains all Required Elements", () => {
    cy.get(signInAsUserButton).should("be.visible").should("be.enabled");
    cy.get(userNameInputText).should("be.visible");
    cy.get(passwordInputText).should("be.visible");
    cy.get(loginButton).should("be.visible").should("be.enabled");
  });

  /** Test: Successful Login
   * This test verifies that the user is able to successfully login with a valid username and password
   * when the "Login" button is clicked.
   * 1. Verify that the user is redirected to the / endpoint.
   */
  it("Successful Login", () => {
    cy.get(userNameInputText).type("user-1");
    cy.get(passwordInputText).type("user-1");
    cy.get(loginButton).click();

    cy.url().should("be.equal", BASE_URL);
  });

  /** Test: Failed Login with Invalid Username
   * This test verifies that the user is displayed with a valid error message if they enter an invalid
   * username and clicks the "Login" button.
   * 1. Verify that a toast message is displayed with the text "Wrong username or password".
   */
  it("Failed Login with Invalid Username", () => {
    cy.get(userNameInputText).type("InvalidUsername");
    cy.get(passwordInputText).type("user-1");
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
  it("Failed Login with Invalid Password", () => {
    cy.get(userNameInputText).type("user-1");
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
});
