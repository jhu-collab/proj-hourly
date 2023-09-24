describe("Registrations Page: Staff", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly/";

  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';

  const addCourseButton = '[data-cy="add-course-button"]';
  const createCourseButton = '[data-cy="create-course-button"]';
  const createCourseTitle = '[data-cy="course-title-input"]';
  const createCourseNumber = '[data-cy="course-number-input"]';
  const createCourseSemesterDropdown = '[data-cy="form-input-dropdown"]';
  const createCourseYear = '[data-cy="course-year-input"]';
  const createButton = '[data-cy="create-button"]';

  const navbarButton = '[data-cy="navbar-button"]';
  const navbar = '[data-cy="navbar"]';

  const courseTitle = "Machine Learning";
  const courseNumber = "601.475";
  const courseSemester = "Fall";
  const courseYear = "2023";

  const createCourseSemester = `[data-cy="${courseSemester}"]`;
  const courseCard = `[data-cy="${courseNumber}"]`;

  const upcomingRegistrationsTab = '[data-cy="upcoming-registrations-tab"]';
  const ongoingRegistrationsTab = '[data-cy="ongoing-registrations-tab"]';
  const pastRegistrationsTab = '[data-cy="past-registrations-tab"]';
  const registrationTypesTab = '[data-cy="registration-types-tab"]';

  const noUpcomingRegistrationsAlert =
    '[data-cy="no-upcoming-registrations-alert"]';
  const noOngoingRegistrationsAlert =
    '[data-cy="no-ongoing-registrations-alert"]';
  const noPastRegistrationsAlert = '[data-cy="no-past-registrations-alert"]';

  const registrationTypeNameInput = '[data-cy="registration-type-name-input"]';
  const registrationTypeDurationInput =
    '[data-cy="registration-type-duration-input"]';
  const createRegistrationTypeButton =
    '[data-cy="create-registration-type-button"]';

  const editRegistrationTypeNameInput =
    '[data-cy="edit-registration-type-name-input"]';
  const editRegistrationTypeDurationInput =
    '[data-cy="edit-registration-type-duration-input"]';

  const registrationTypeList = '[data-cy="registration-type-list"]';

  const addRegistrationTypeButton = '[data-cy="add-registration-type-button"]';

  const cancelDeleteButton = '[data-cy="cancel-delete-button"]';
  const confirmDeleteButton = '[data-cy="confirm-delete-button"]';

  beforeEach(() => {
    cy.task("deleteStudentCourses", "user-1");
    cy.task("deleteInstructorCourses", "user-1");

    cy.visit(BASE_URL + "login");

    cy.get(userNameInputText).type("user-1");
    cy.get(passwordInputText).type("user-1");
    cy.get(loginButton).click();

    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();
    cy.get(createCourseTitle).type(courseTitle);
    cy.get(createCourseNumber).type(courseNumber);
    cy.get(createCourseSemesterDropdown).click();
    cy.get(createCourseSemester).click();
    cy.get(createCourseYear).type(courseYear);
    cy.get(createButton).click();

    cy.wait(1000);

    cy.get(courseCard).click();

    cy.wait(1000);

    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "registrations").click();
    cy.get("body").click();
  });

  it("Registrations Tab Bar Looks as Expected", () => {
    cy.get(upcomingRegistrationsTab).should("be.visible").should("be.enabled");
    cy.get(ongoingRegistrationsTab).should("be.visible").should("be.enabled");
    cy.get(pastRegistrationsTab).should("be.visible").should("be.enabled");
    cy.get(registrationTypesTab).should("be.visible").should("be.enabled");
  });

  it("Upcoming Registrations Tab should look as expected", () => {
    cy.get(noUpcomingRegistrationsAlert).should("be.visible");
  });

  it("Ongoing Registrations Tab should look as expected", () => {
    cy.get(ongoingRegistrationsTab).click();
    cy.get(noOngoingRegistrationsAlert).should("be.visible");
  });

  it("Past Registrations Tab should look as expected", () => {
    cy.get(pastRegistrationsTab).click();
    cy.get(noPastRegistrationsAlert).should("be.visible");
  });

  it("Registration Types Tab should look as expected", () => {
    cy.get(registrationTypesTab).click();
    cy.get(registrationTypeList).children().should("have.length", 1);

    const defaultRegistrationTypeName = "Default";
    const defaultRegistrationTypeDuration = 10;

    const defaultRegistrationType = `[data-cy="${defaultRegistrationTypeName}"]`;

    cy.get(defaultRegistrationType).contains(defaultRegistrationTypeName);
    cy.get(defaultRegistrationType).contains(defaultRegistrationTypeDuration);
    cy.get(defaultRegistrationType).contains("button", "Edit");
    cy.get(defaultRegistrationType).contains("button", "Delete");
    cy.get(addRegistrationTypeButton).should("be.visible").should("be.enabled");
  });

  it("Create New Registration Type Popup Looks as Epxected", () => {
    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();

    cy.get(registrationTypeNameInput).should("be.visible");
    cy.get(registrationTypeDurationInput).should("be.visible");
    cy.get(createRegistrationTypeButton)
      .should("be.visible")
      .should("be.enabled");
  });

  it("Failed Creation of New Registration Type with Empty Name and Duration", () => {
    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(createRegistrationTypeButton).click();

    cy.get(registrationTypeNameInput).contains(
      "p",
      "Registration name is required"
    );
    cy.get(registrationTypeDurationInput).contains(
      "p",
      "Please enter a valid duration"
    );
    cy.get(registrationTypeList).children().should("have.length", 1);
  });

  it("Failed Creation of New Registration Type with Invalid Duration", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "-1";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    cy.get(registrationTypeDurationInput).contains(
      "p",
      "Duration must be at least 10 minutes"
    );
    cy.get(registrationTypeList).children().should("have.length", 1);
  });

  it("Failed Creation of New Registration Type when Duration is not a Multiple of 5", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "13";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    cy.get(registrationTypeDurationInput).contains(
      "p",
      "Duration must be a multiple of 5"
    );
    cy.get(registrationTypeList).children().should("have.length", 1);
  });

  it("Successfully Creating a New Registration Type", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    cy.get(registrationTypeList).children().should("have.length", 2);
    cy.get(".Toastify")
      .contains(
        "div",
        `Successfully created ${registrationTypeName} registration type!`
      )
      .should("be.visible");

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).should("be.visible");
    cy.get(registrationType).contains(registrationTypeName);
    cy.get(registrationType).contains(registrationTypeDuration);
  });

  it("Failed Editing of Registration Type with Empty Name and Duration", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).contains("button", "Edit").click();

    cy.get(editRegistrationTypeNameInput)
      .type("{selectAll}")
      .type("{backspace}");
    cy.get(editRegistrationTypeDurationInput)
      .type("{selectAll}")
      .type("{backspace}");
    cy.get(registrationType).contains("button", "Submit").click();

    cy.get(editRegistrationTypeNameInput).contains(
      "p",
      "Registration name is required"
    );
    cy.get(editRegistrationTypeDurationInput).contains(
      "p",
      "Please enter a valid duration"
    );
  });

  it("Failed Editing of Registration Type with Invalid Duration", () => {
    const registrationTypeName = "Registration Type 1";
    const oldRegistrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(oldRegistrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).contains("button", "Edit").click();

    const newRegistrationTypeDuration = "-1";

    cy.get(editRegistrationTypeDurationInput)
      .type("{selectAll}")
      .type("{backspace}")
      .type(newRegistrationTypeDuration);
    cy.get(registrationType).contains("button", "Submit").click();

    cy.get(editRegistrationTypeDurationInput).contains(
      "p",
      "Duration must be at least 10 minutes"
    );
  });

  it("Failed Editing of Registration Type when Duration is not a Multiple of 5", () => {
    const registrationTypeName = "Registration Type 1";
    const oldRegistrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(oldRegistrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).contains("button", "Edit").click();

    const newRegistrationTypeDuration = "11";

    cy.get(editRegistrationTypeDurationInput)
      .type("{selectAll}")
      .type("{backspace}")
      .type(newRegistrationTypeDuration);
    cy.get(registrationType).contains("button", "Submit").click();

    cy.get(editRegistrationTypeDurationInput).contains(
      "p",
      "Duration must be a multiple of 5"
    );
  });

  it("Successfully Editing a Registration Type", () => {
    const oldRegistrationTypeName = "Registration Type 1";
    const oldRegistrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(oldRegistrationTypeName);
    cy.get(registrationTypeDurationInput).type(oldRegistrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const oldRegistrationType = `[data-cy="${oldRegistrationTypeName}"]`;

    cy.get(oldRegistrationType).contains("button", "Edit").click();

    const newRegistrationTypeName = "Long Session";
    const newRegistrationTypeDuration = "20";

    cy.get(editRegistrationTypeNameInput)
      .type("{selectAll}")
      .type("{backspace}")
      .type(newRegistrationTypeName);
    cy.get(editRegistrationTypeDurationInput)
      .type("{selectAll}")
      .type("{backspace}")
      .type(newRegistrationTypeDuration);
    cy.get(oldRegistrationType).contains("button", "Submit").click();

    cy.get(".Toastify")
      .contains("div", "Successfully updated the registration type!")
      .should("be.visible");

    const newRegistrationType = `[data-cy="${newRegistrationTypeName}"]`;

    cy.get(newRegistrationType).should("be.visible");
    cy.get(newRegistrationType).contains(newRegistrationTypeName);
    cy.get(newRegistrationType).contains(newRegistrationTypeDuration);
  });

  it("Cancelling Editing a Registration Type", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).contains("button", "Edit").click();

    cy.get(editRegistrationTypeNameInput)
      .type("{selectAll}")
      .type("{backspace}");
    cy.get(editRegistrationTypeDurationInput)
      .type("{selectAll}")
      .type("{backspace}");
    cy.get(registrationType).contains("button", "Cancel").click();

    cy.get(registrationType).contains(registrationTypeName);
    cy.get(registrationType).contains(registrationTypeDuration);
  });

  it("Delete Registration Type Popup Looks as Expected", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).contains("button", "Delete").click();

    cy.get(cancelDeleteButton).should("be.visible").should("be.enabled");
    cy.get(confirmDeleteButton).should("be.visible").should("be.enabled");
  });

  it("Confirming Deletion of Registration Type", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).contains("button", "Delete").click();
    cy.get(confirmDeleteButton).click();

    cy.get(".Toastify")
      .contains(
        "div",
        `Successfully deleted the "${registrationTypeName}" registration type!`
      )
      .should("be.visible");
    cy.get(registrationTypeList).should("have.length", 1);
  });

  it("Cancelling Deletion of Registration Type", () => {
    const registrationTypeName = "Registration Type 1";
    const registrationTypeDuration = "15";

    cy.get(registrationTypesTab).click();
    cy.get(addRegistrationTypeButton).click();
    cy.get(registrationTypeNameInput).type(registrationTypeName);
    cy.get(registrationTypeDurationInput).type(registrationTypeDuration);
    cy.get(createRegistrationTypeButton).click();

    const registrationType = `[data-cy="${registrationTypeName}"]`;

    cy.get(registrationType).contains("button", "Delete").click();
    cy.get(cancelDeleteButton).click();

    cy.get(registrationTypeList).should("have.length", 2);
    cy.get(registrationType).contains(registrationTypeName);
    cy.get(registrationType).contains(registrationTypeDuration);
  });

  it("Failed Deletion if there is Only One Registration Type", () => {
    const registrationType = '[data-cy="Default"]';

    cy.get(registrationTypesTab).click();
    cy.get(registrationType).contains("button", "Delete").click();
    cy.get(confirmDeleteButton).click();

    cy.get(".Toastify")
      .contains(
        "div",
        "ERROR: cannot delete the only time offering for the course"
      )
      .should("be.visible");
    cy.get(registrationTypeList).should("have.length", 1);
  });
});

describe("Registrations Page: Student", () => {
  const BASE_URL = "http://localhost:3000/";

  const navbarButton = '[data-cy="navbar-button"]';
  const navbar = '[data-cy="navbar"]';

  const noUpcomingRegistrationsAlert =
    '[data-cy="no-upcoming-registrations-alert"]';

  const registrationList = '[data-cy="registration-list"]';

  const cancelDeleteButton = '[data-cy="cancel-delete-button"]';
  const confirmDeleteButton = '[data-cy="confirm-delete-button"]';

  before(() => {
    cy.task("removeOH", "ABCDEF");
    cy.task("addOfficeHoursDS");
  });

  beforeEach(() => {
    cy.task("removeOH", "ABCDEF");
    cy.task("addOfficeHoursDS");
    cy.visit(BASE_URL);
    cy.get('input[id=":r1:"]').type("ali-the-student");
    cy.get('input[id=":r3:"]').type("ali-the-student");
    cy.contains("button", "Login").click();
    cy.contains("p", "Data Structures").click();

    cy.get("[data-cy^=event-]").first().click({ force: true });
    cy.get('[data-cy="student-register-button"]').click();
    cy.get('[data-cy="oh-topic-dropdown"]').click();
    cy.get('[data-cy="Regular"]').click();
    cy.get('[data-cy="student-time-slots"]').click();
    cy.get("ul>li").eq(3).click();
    cy.get('[data-cy="student-submit-register"]').click();
  });

  it("Registered Office Hours Should Be Visible In Upcoming Registrations", () => {
    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "registrations").click();
    cy.get("body").click();

    cy.get(registrationList).should("have.length", 1);
  });

  it("Cancel Registration Popup Looks as Expected", () => {
    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "registrations").click();
    cy.get("body").click();

    cy.get(registrationList)
      .children()
      .click()
      .contains("button", "Cancel")
      .click();

    cy.get(cancelDeleteButton).should("be.visible").should("be.enabled");
    cy.get(confirmDeleteButton).should("be.visible").should("be.visible");
  });

  it("Confirm Cancelling Registration", () => {
    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "registrations").click();
    cy.get("body").click();

    cy.get(registrationList)
      .children()
      .click()
      .contains("button", "Cancel")
      .click();

    cy.get(confirmDeleteButton).click();

    cy.get(registrationList).should("not.be.visible").should("have.length", 0);
    cy.get(noUpcomingRegistrationsAlert).should("be.visible");
  });

  it("Cancel Cancelling Registration", () => {
    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "registrations").click();
    cy.get("body").click();

    cy.get(registrationList)
      .children()
      .click()
      .contains("button", "Cancel")
      .click();

    cy.get(cancelDeleteButton).click();

    cy.get(registrationList).should("have.length", 1);
  });
});
