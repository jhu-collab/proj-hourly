const formatCypressDate = (date) => {
  const year = date.toLocaleString("default", { year: "numeric" });
  const month = date.toLocaleString("default", { month: "2-digit" });
  const day = date.toLocaleString("default", { day: "2-digit" });

  // Generate yyyy-mm-dd date string
  return year + "-" + month + "-" + day;
};
describe("Calendar Page: Staff Office Hours", () => {
  const BASE_URL = "http://localhost:3000/";
  //Set the date used for the tests
  let now = new Date();

  before(() => {
    cy.task("removeOH", "AVENGE");
  });

  after(() => {
    cy.task("removeOH", "AVENGE");
  });

  describe("creating office hours", () => {
    beforeEach(() => {
      cy.visit(BASE_URL);
      cy.get('input[id=":r1:"]').type("thor");
      cy.get('input[id=":r3:"]').type("thor");
      cy.contains("button", "Login").click();

      cy.contains("p", "Avengers").click();
    });

    afterEach(() => {
      //remove any office hours that were created in the making of the tests
      cy.task("removeOH", "AVENGE");
    });
    it.skip("staff can create office hours", () => {
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

      cy.get('[data-cy="create-location-input"]')
        .should("be.visible")
        .type(locationName);
      cy.get('[data-cy="create-event-submit"]').should("be.visible").click();

      /**First Fault:
       * After making an office hours, the page needs to be reloaded in order for
       * it to be clickable
       */
      cy.reload();
      cy.get('button[title="Next week"]').should("be.visible").click();
      cy.get("[data-cy^=event-]").should("have.length", 1).click();

      //Test that the Date is mostly correct on Tuesday
      cy.get('[data-cy="date-text"]')
        .should("be.visible")
        .contains("Date: Tue");

      //Test that the time matches with what was inputted
      cy.get('[data-cy="time-text"]')
        .should("be.visible")
        .should("have.text", "Time: 11:30 AM - 12:00 PM");

      //Test that the location matches with what was inputted
      cy.get('[data-cy="location-text"]')
        .should("be.visible")
        .should("have.text", "Location: " + locationName);
    });

    it.skip("staff can create recurring office hours", () => {
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

      cy.get('input[id=":rb:"]').type("2023-04-25");

      const locationName = "Mark's Location";

      cy.get('[data-cy="create-location-input"]')
        .should("be.visible")
        .type(locationName);
      cy.get('[data-cy="create-event-submit"]').should("be.visible").click();

      cy.reload();
      cy.get('button[title="Next week"]').should("be.visible").click();
      cy.get("[data-cy^=event-]").should("have.length", 1).click();
    });
  });

  describe.skip("deleting office hours", () => {
    beforeEach(() => {
      cy.visit(BASE_URL);
      cy.get('input[id=":r1:"]').type("thor");
      cy.get('input[id=":r3:"]').type("thor");
      cy.contains("button", "Login").click();

      cy.contains("p", "Avengers").click();
    });

    afterEach(() => {
      //remove any office hours that were created in the making of the tests
      cy.task("removeOH", "AVENGE");
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

      cy.get('[data-cy="create-location-input"]')
        .should("be.visible")
        .type(locationName);
      cy.get('[data-cy="create-event-submit"').should("be.visible").click();

      cy.reload();
      cy.get('button[title="Next week"]').should("be.visible").click();
      cy.get("[data-cy^=event-]").should("have.length", 1).click();

      cy.get('[data-cy="delete-action-icon"]').should("be.visible").click();
      cy.get('[data-cy="confirm-delete-button"]').should("be.visible").click();

      cy.get("[data-cy^=event-]").should("have.length", 0);
    });
  });

  describe("editing office hours", () => {
    beforeEach(() => {
      now = new Date();
      cy.task("removeOH", "AVENGE");

      cy.visit(BASE_URL);
      cy.get('input[id=":r1:"]').type("thor");
      cy.get('input[id=":r3:"]').type("thor");
      cy.contains("button", "Login").click();

      cy.contains("p", "Avengers").click();

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

      cy.get('[data-cy="create-location-input"]')
        .should("be.visible")
        .type(locationName);
      cy.get('[data-cy="create-event-submit"').should("be.visible").click();

      cy.reload();
      cy.get('button[title="Next week"]').should("be.visible").click();
    });

    it.skip("edit location", () => {
      cy.get("[data-cy^=event-]").should("have.length", 1).click();
      cy.get("[data-cy=edit-action-icon]").click();

      //The actual edit form should exist
      cy.get('[data-cy="edit-event-form"]').should("be.visible");

      const newLocationName = "Malone 122";

      cy.get('[data-cy="edit-location-input"]')
        .should("be.visible")
        .type("{selectall}{backspace}")
        .type(newLocationName);
      cy.get('[data-cy="edit-event-submit"').should("be.visible").click();

      cy.get("[data-cy^=event-]").should("have.length", 1);
      cy.get("[data-cy^=event-]").click();

      //Test that the Date is mostly correct on Tuesday
      cy.get('[data-cy="date-text"]')
        .should("be.visible")
        .contains("Date: Tue");

      //Test that the time did not change
      cy.get('[data-cy="time-text"]')
        .should("be.visible")
        .should("have.text", "Time: 11:30 AM - 12:00 PM");

      //Test that the location is new
      cy.get('[data-cy="location-text"]')
        .should("be.visible")
        .should("have.text", "Location: " + newLocationName);
    });

    it.skip("edit time", () => {
      cy.get("[data-cy^=event-]").should("have.length", 1).click();
      cy.get("[data-cy=edit-action-icon]").click();

      //The actual edit form should exist
      cy.get('[data-cy="edit-event-form"]').should("be.visible");

      //Edit to start at 9:30 am
      cy.get('[data-cy="edit-start-time-text"]')
        .should("be.visible")
        .type("21:30");
      //Edit to end at 11:30 am
      cy.get('[data-cy="edit-end-time-text"]')
        .should("be.visible")
        .type("23:30");

      cy.get('[data-cy="edit-event-submit"').should("be.visible").click();

      cy.get("[data-cy^=event-]").should("have.length", 1);
      cy.get("[data-cy^=event-]").click();

      //Test that the Date is mostly correct on Tuesday
      cy.get('[data-cy="date-text"]')
        .should("be.visible")
        .contains("Date: Tue");

      //Test that the time did change
      cy.get('[data-cy="time-text"]')
        .should("be.visible")
        .should("have.text", "Time: 9:30 PM - 11:30 PM");

      const locationName = "Mark's Location";

      //Test that the location did not change
      cy.get('[data-cy="location-text"]')
        .should("be.visible")
        .should("have.text", "Location: " + locationName);
    });

    //TODO: Broken
    it("edit day", () => {
      cy.get("[data-cy^=event-]").should("have.length", 1).click();
      cy.get("[data-cy=edit-action-icon]").click();

      //The actual edit form should exist
      cy.get('[data-cy="edit-event-form"]').should("be.visible");

      cy.log(formatCypressDate(now));
      //Edit to start at 9  :30 am
      now.setDate(now.getDate() + 8);
      const nowStr = formatCypressDate(now);

      //TODO: This is broken.
      //It is very hard to change the date when creating/editing an event
      cy.log(nowStr);
      cy.get('input[id=":r9:"]').clear().type(`${nowStr}`);
    });
  });
});
