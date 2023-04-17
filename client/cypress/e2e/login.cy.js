describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("should login to site when successful", () => {
    cy.get('input[id=":r1:"]').type("user-1");
    cy.get('input[id=":r3:"]').type("user-1");
    cy.contains("button", "Login").click();

    cy.contains("p", "Staff Courses").should("be.visible");
    cy.contains("p", "Student Courses").should("be.visible");
  });

  it("should not login when wrong password", () => {
    cy.get('input[id=":r1:"]').type("user-1");
    cy.get('input[id=":r3:"]').type("InvalidPassword");
    cy.contains("button", "Login").click();

    cy.get(".Toastify")
      .should("have.length", 1)
      .contains("div", "Wrong username or password")
      .should("be.visible");
  });

  it("should not login when wrong username", () => {
    cy.get('input[id=":r1:"]').type("InvalidUsername");
    cy.get('input[id=":r3:"]').type("user-1");
    cy.contains("button", "Login").click();

    cy.get(".Toastify")
      .should("have.length", 1)
      .contains("div", "Wrong username or password")
      .should("be.visible");
  });
});
