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
    it("staff can create office hours", () => {
      //Look one week ahead because want to be able to run these tests anytime
      //since cannot make office hours in the past
      cy.get('button[title="Next week"]').should("be.visible").click();

      //This is extremely hard coded, trying to click a time on tuesday
      //It seems difficult to put a data-cy tag on a element because it's
      //a premade calendar
      cy.get('[data-cy="full-calendar"]').click();

      cy.get('input[id=":r7:"]').should("have.value", "06:30");
      cy.get('input[id=":r9:"]').should("have.value", "07:00");

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
        .contains("Date: Wed");

      //Test that the time matches with what was inputted
      cy.get('[data-cy="time-text"]')
        .should("be.visible")
        .should("have.text", "Time: 6:30 AM - 7:00 AM");

      //Test that the location matches with what was inputted
      cy.get('[data-cy="location-text"]')
        .should("be.visible")
        .should("have.text", "Location: " + locationName);
    });

    it("staff can create recurring office hours and it should show up for same week", () => {
      //Look one week ahead because want to be able to run these tests anytime
      //since cannot make office hours in the past
      cy.get('button[title="Next week"]').should("be.visible").click();

      //This is extremely hard coded, trying to click a time on tuesday
      //It seems difficult to put a data-cy tag on a element because it's
      //a premade calendar
      cy.get('[data-cy="full-calendar"]').click();

      cy.get('input[id=":r7:"]').should("have.value", "06:30");
      cy.get('input[id=":r9:"]').should("have.value", "07:00");

      //Activate recurring
      cy.get('input[name="recurringEvent"]').check();

      const newDate = new Date(now.setMonth(now.getMonth() + 1));
      const newDateStr = formatCypressDate(newDate);
      cy.get('[data-cy="create-end-date-text"]').clear().type(newDateStr);

      const locationName = "Mark's Location";
      cy.get('[data-cy="create-location-input"]')
        .should("be.visible")
        .type(locationName);

      cy.get('button[value="Monday"]').click();
      cy.get('button[value="Wednesday"]').click();
      cy.get('button[value="Friday"]').click();

      cy.get('[data-cy="create-event-submit"]').should("be.visible").click();

      cy.reload();
      cy.get('button[title="Next week"]').should("be.visible").click();
      //It should be 2 because I clicked on wednesday, then recurred for MWF. Clicking on wednesday
      //should make it so that this week's wednesday and friday should have an event
      cy.get("[data-cy^=event-]").should("have.length", 2);

      //The number of recurrences should be about 12
      cy.get('button[value="month"]').click();
      let countOfElements = 0;
      cy.get('div[class="fc-event-title"]').then(($elements) => {
        cy.log($elements.length);
        countOfElements += $elements.length;
        cy.get('button[title="Next month"]').should("be.visible").click();
        cy.get('div[class="fc-event-title"]').then(($elements) => {
          cy.log($elements.length);
          countOfElements += $elements.length;
          cy.wrap(countOfElements).should("be.lte", 14);
          cy.wrap(countOfElements).should("be.gte", 10);
        });
      });
    });
  });

  describe("deleting office hours", () => {
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
      cy.get('[data-cy="full-calendar"]').click();

      cy.get('input[id=":r7:"]').should("have.value", "06:30");
      cy.get('input[id=":r9:"]').should("have.value", "07:00");

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

  describe("editing one day office hours", () => {
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
      cy.get('[data-cy="full-calendar"]').click();

      cy.get('input[id=":r7:"]').should("have.value", "06:30");
      cy.get('input[id=":r9:"]').should("have.value", "07:00");

      const locationName = "Mark's Location";

      cy.get('[data-cy="create-location-input"]')
        .should("be.visible")
        .type(locationName);
      cy.get('[data-cy="create-event-submit"').should("be.visible").click();

      cy.reload();
      cy.get('button[title="Next week"]').should("be.visible").click();
    });

    it("edit location", () => {
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
        .contains("Date: Wed");

      //Test that the time did not change
      cy.get('[data-cy="time-text"]')
        .should("be.visible")
        .should("have.text", "Time: 6:30 AM - 7:00 AM");

      //Test that the location is new
      cy.get('[data-cy="location-text"]')
        .should("be.visible")
        .should("have.text", "Location: " + newLocationName);
    });

    it("edit time", () => {
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
        .contains("Date: Wed");

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

    it("edit day", () => {
      cy.get("[data-cy^=event-]").should("have.length", 1).click();
      cy.get("[data-cy=edit-action-icon]").click();

      //The actual edit form should exist
      cy.get('[data-cy="edit-event-form"]').should("be.visible");

      //Change the date
      now.setDate(now.getDate() + 9);
      const nowStr = formatCypressDate(now);

      cy.get('[data-cy="edit-start-date-text"]').clear().type(`${nowStr}`);
      cy.get('[data-cy="edit-event-submit"').should("be.visible").click();

      cy.get("[data-cy^=event-]").should("have.length", 1);
      cy.get("[data-cy^=event-]").click();

      //Test that the Date changed one day
      cy.get('[data-cy="date-text"]')
        .should("be.visible")
        .contains("Date: Thu");

      //Test that the time did not change
      cy.get('[data-cy="time-text"]')
        .should("be.visible")
        .should("have.text", "Time: 6:30 AM - 7:00 AM");

      const locationName = "Mark's Location";

      //Test that the location did not change
      cy.get('[data-cy="location-text"]')
        .should("be.visible")
        .should("have.text", "Location: " + locationName);
    });
  });
  
  describe("editing recurring office hours", () => {
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
      cy.get('[data-cy="full-calendar"]').click();

      //Activate recurring
      cy.get('input[name="recurringEvent"]').check();

      const newDate = new Date(now.setMonth(now.getMonth() + 1));
      const newDateStr = formatCypressDate(newDate);
      cy.get('[data-cy="create-end-date-text"]').clear().type(newDateStr);

      const locationName = "Mark's Location";
      cy.get('[data-cy="create-location-input"]')
        .type(locationName);

      cy.get('button[value="Monday"]').click();
      cy.get('button[value="Wednesday"]').click();
      cy.get('button[value="Friday"]').click();

      cy.get('[data-cy="create-event-submit"]').click();

      cy.reload();
      cy.get('button[title="Next week"]').click();
    });
    afterEach(() => {
      //remove any office hours that were created in the making of the tests
      cy.task("removeOH", "AVENGE");
    });
    it("edit end day", () => {
      cy.get("[data-cy^=event-]").first().click();
      cy.get("[data-cy=edit-action-icon]").click();
      cy.get('input[name="recurringEvent"]').check();

      let newDate = new Date();
      newDate.setDate(now.getDate() + 15);
      const newDateStr = formatCypressDate(newDate);
      cy.get('[data-cy="edit-end-date-text"]').clear().type(newDateStr);

      cy.get('button[value="Monday"]').click();
      cy.get('button[value="Wednesday"]').click();
      cy.get('button[value="Friday"]').click();

      cy.get('[data-cy="edit-event-submit"]').click();

      cy.get('button[value="month"]').click();
      let countOfElements = 0;
      cy.get('div[class="fc-event-title"]').then(($elements) => {
        cy.log($elements.length);
        countOfElements += $elements.length;
        cy.get('button[title="Next month"]').should("be.visible").click();
        cy.get('div[class="fc-event-title"]').then(($elements) => {
          cy.log($elements.length);
          countOfElements += $elements.length;
          cy.wrap(countOfElements).should("be.lte", 8);
          cy.wrap(countOfElements).should("be.gte", 5);
        });
      });
    })
  })
});
