describe("Calendar Page: Create Office Hours", () => {
  const BASE_URL = "http://localhost:3000/";

  beforeEach(() => {
    cy.visit(BASE_URL);
    cy.get('input[id=":r1:"]').type("thor");
    cy.get('input[id=":r3:"]').type("thor");
    cy.contains("button", "Login").click();

    cy.contains("p", "Avengers").click();
  });

  afterEach(() => {
    //remove any office hours that were created in the making of the tests
    cy.task("removeOH");
  });

  it("staff can create office hours", () => {
    //Look one week ahead because want to be able to run these tests anytime
    //since cannot make office hours in the past
    cy.get('button[title="Next week"]').should("be.visible").click();

    //This is extremely hard coded, trying to click a time on tuesday
    //It seems difficult to put a data-cy tag on a element because it's
    //a premade calendar
    cy.xpath(
      "/html/body/div[1]/div[2]/main/div[2]/div/div/div/div[2]/div/table/tbody/tr/td/div/div/div/div[2]/table/tbody/tr/td[4]/div"
    ).click({ force: true });

    cy.get('input[id=":r7:"]').should("have.value", "11:30");
    cy.get('input[id=":r9:"]').should("have.value", "12:00");

    const locationName = "Mark's Location";

    cy.get('[data-cy="location-input"]')
      .should("be.visible")
      .type(locationName);
    cy.get('[data-cy="create-event-submit"').should("be.visible").click();

    /**First Fault:
     * After making an office hours, the page needs to be reloaded in order for
     * it to be clickable
     */
    cy.reload();
    cy.get('button[title="Next week"]').should("be.visible").click();
    cy.get(".css-zs52uy > .MuiTypography-root").should("be.visible").click();

    //Test that the Date is mostly correct on Tuesday
    cy.get('[data-cy="date-text"]').should("be.visible").contains("Date: Tue");

    //Test that the time matches with what was inputted
    cy.get('[data-cy="time-text"]')
      .should("be.visible")
      .should("have.text", "Time: 11:30 AM - 12:00 PM");

    //Test that the location matches with what was inputted
    cy.get('[data-cy="location-text"]')
      .should("be.visible")
      .should("have.text", "Location: " + locationName);
  });

  it("staff can delete office hours", () => {
    //Look one week ahead because want to be able to run these tests anytime
    //since cannot make office hours in the past
    cy.get('button[title="Next week"]').should("be.visible").click();

    //This is extremely hard coded, trying to click a time on tuesday
    //It seems difficult to put a data-cy tag on a element because it's
    //a premade calendar
    cy.xpath(
      "/html/body/div[1]/div[2]/main/div[2]/div/div/div/div[2]/div/table/tbody/tr/td/div/div/div/div[2]/table/tbody/tr/td[4]/div"
    ).click({ force: true });

    cy.get('input[id=":r7:"]').should("have.value", "11:30");
    cy.get('input[id=":r9:"]').should("have.value", "12:00");

    const locationName = "Mark's Location";

    cy.get('[data-cy="location-input"]')
      .should("be.visible")
      .type(locationName);
    cy.get('[data-cy="create-event-submit"').should("be.visible").click();

    cy.reload();
    cy.get('button[title="Next week"]').should("be.visible").click();
    //hardcoded to get the office hours "bubble"
    cy.get(".css-zs52uy > .MuiTypography-root").should("be.visible").click();

    cy.get('[data-cy="delete-action-icon"]').should("be.visible").click();
    cy.get('[data-cy="confirm-delete-button"]').should("be.visible").click();

    //hardcoded to get the office hours "bubble"
    cy.get(".css-zs52uy > .MuiTypography-root").should("not.exist");
  });
});
