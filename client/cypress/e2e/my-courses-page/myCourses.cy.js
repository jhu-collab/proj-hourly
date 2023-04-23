describe("My Courses Page", () => {
  const BASE_URL = "http://localhost:3000/";

  const staffCourseList = '[data-cy="staff-course-list"]';
  const studentCourseList = '[data-cy="student-course-list"]';

  const addCourseButton = '[data-cy="add-course-button"]';

  const joinCourseButton = '[data-cy="join-course-button"]';

  const createCourseButton = '[data-cy="create-course-button"]';
  const createCourseTitle = '[data-cy="course-title-input"]';
  const createCourseNumber = '[data-cy="course-number-input"]';
  const createCourseSemester = '[data-cy="course-semester-input"]';
  const createCourseYear = '[data-cy="course-year-input"]';
  const createButton = '[data-cy="create-button"]';

  before(() => {
    cy.task("deleteCourse", "UKOY1E");
  });

  beforeEach(() => {
    cy.task("deleteStudentCourses", "user-1");
    cy.visit(BASE_URL + "login");

    cy.get('input[id=":r1:"]').type("user-1");
    cy.get('input[id=":r3:"]').type("user-1");
    cy.contains("button", "Login").click();
  });

  it("Layout Contains All Required Elements", () => {});

  it("Navigation Drawer Opens and Displays My Courses Tab", () => {});

  it("Clicking the Add Course Button Should Display Popup Correctly", () => {
    cy.get(addCourseButton).click();

    cy.get('input[id=":r7:"]')
      .should("be.visible")
      .type("abc")
      .should("have.value", "abc");
    cy.get(joinCourseButton).should("be.visible").should("be.enabled");
    cy.get(createCourseButton).should("be.visible").should("be.enabled");
  });

  it("Failure to Join Student Course With Empty Course Number", () => {
    cy.get(addCourseButton).click();
    cy.get(joinCourseButton).click();

    cy.get(
      "body > div.MuiDialog-root.MuiModal-root.css-zw3mfo-MuiModal-root-MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper.css-hz1bth-MuiDialog-container > div > div.MuiDialogContent-root.css-ypiqx9-MuiDialogContent-root > form > div > div.MuiFormControl-root.MuiFormControl-fullWidth.MuiTextField-root.css-wb57ya-MuiFormControl-root-MuiTextField-root"
    ).contains("p", "Course code is required");
  });

  it("Failure to Join Student Course With Invalid Course Number Length", () => {
    cy.get(addCourseButton).click();
    cy.get('input[id=":r7:"]').type("0000");
    cy.get(joinCourseButton).click();

    cy.get(
      "body > div.MuiDialog-root.MuiModal-root.css-zw3mfo-MuiModal-root-MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper.css-hz1bth-MuiDialog-container > div > div.MuiDialogContent-root.css-ypiqx9-MuiDialogContent-root > form > div > div.MuiFormControl-root.MuiFormControl-fullWidth.MuiTextField-root.css-wb57ya-MuiFormControl-root-MuiTextField-root"
    ).contains("p", "Course code must be 6 characters");
  });

  it("Successfully Joins Student Course With Valid Course Number", () => {
    cy.get(addCourseButton).click();
    cy.get('input[id=":r7:"]').type("AVENGE");
    cy.get(joinCourseButton).click();
  });

  it("Clicking the Create a New Course Button Should Display Popup Correctly", () => {
    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();
  });

  it("Failed Creation of Instructor Course with Empty Fields", () => {
    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();
    cy.get(createButton).click();

    // Add Tests
  });

  it("Failed Creation of Instructor Course with Invalid Course Number", () => {
    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();

    cy.get(createButton).click();

    // Add tests
  });

  it("Failed Creation of Instructor Course with Invalid Semester", () => {
    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();

    cy.get(createButton).click();

    // Add tests
  });

  it("Failed Creation of Instructor Course with Invalid Year", () => {
    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();

    cy.get(createButton).click();

    // Add tests
  });

  it("Successful Creation of Instructor Course", () => {
    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();

    cy.get(createButton).click();

    // Add tests
  });

  it("Successfully Opening a Student Course", () => {
    const courseCode = "AVENGE";
    cy.get(addCourseButton).click();
    cy.get('input[id=":r7:"]').type(courseCode);
    cy.get(joinCourseButton).click();

    const courseNumber = "123.456";
    const course = `[data-cy="${courseNumber}"]`;
    cy.get(course).click();

    cy.url().should("be.equal", BASE_URL + "calendar");
  });

  it("Successfully Opening an Instructor Course", () => {
    const courseTitle = "Software Testing and Debugging";
    const courseNumber = "601.422";
    // const courseSemester =
    const courseYear = "2023";

    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();
    cy.get(createCourseTitle).type(courseTitle);
    cy.get(createCourseNumber).type(courseNumber);
    // Select Semester here
    cy.get(createCourseYear).type(courseYear);
    cy.get(createButton).click();

    cy.url().should("be.equal", BASE_URL + "calendar");
  });

  it("Successful Logout", () => {
    cy.get(
      "#root > div.MuiBox-root.css-wp4765 > header > div > div.MuiBox-root.css-1i6hafq > span"
    ).click();
    if (window.innerWidth < 1024) {
      cy.get(
        "#root > div.MuiBox-root.css-wp4765 > header > div > div.css-advny6-MuiPopper-root.MuiPopperUnstyled-root > div > div > div > header > div > div > button"
      ).click();
    }
    cy.get(
      "#root > div.MuiBox-root.css-wp4765 > header > div > div.css-advny6-MuiPopper-root.MuiPopperUnstyled-root > div > div > div > header > div > div > div > div > div > div > div > nav > div:nth-child(2)"
    ).click();
  });

  it("Successful Navigation to Profile Page", () => {
    cy.get(
      "#root > div.MuiBox-root.css-wp4765 > header > div > div.MuiBox-root.css-1i6hafq > span"
    ).click();
    if (window.innerWidth < 1024) {
      cy.get(
        "#root > div.MuiBox-root.css-wp4765 > header > div > div.css-advny6-MuiPopper-root.MuiPopperUnstyled-root > div > div > div > header > div > div > button"
      ).click();
    }
    cy.get(
      "#root > div.MuiBox-root.css-wp4765 > header > div > div.css-advny6-MuiPopper-root.MuiPopperUnstyled-root > div > div > div > header > div > div > div > div > div > div > div > nav > div:nth-child(2)"
    ).click();
  });
});
