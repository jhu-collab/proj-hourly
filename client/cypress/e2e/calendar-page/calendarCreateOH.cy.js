describe("Calendar Page: Create Office Hours", () => {
  const BASE_URL = "http://localhost:3000/";

  beforeEach(() => {
    cy.visit(BASE_URL);
    cy.get('input[id=":r1:"]').type("thor");
    cy.get('input[id=":r3:"]').type("thor");
    cy.contains("button", "Login").click();

    cy.contains("p", "Avengers").click();
  });

  it("Can create office hours", () => {
    //This is extremely hard coded, trying to click mid-day on a friday
    /*cy.xpath(
      "/html/body/div[1]/div[2]/main/div[2]/div/div/div/div[2]/div/table/tbody/tr/td/div/div/div/div[2]/table/tbody/tr/td[7]/div"
    ).click({ force: true });
    cy.get('[data-cy="location-input"]').type("Mark's Location");
    cy.get('[data-cy="create-event-submit"').click();*/
  });
});
