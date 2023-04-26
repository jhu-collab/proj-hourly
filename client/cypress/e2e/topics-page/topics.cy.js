describe("Topics Page", () => {
  const BASE_URL = "http://localhost:3000/";

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
  const ellipsisIconButton = '[data-cy="ellipsis-icon-button"]';
  const profileNameButton = '[data-cy="profile-name-button"]';
  const addTopicButton = '[data-cy="add-topic-button"]';
  const noTopicsAlert = '[data-cy="no-topics-alert"]';
  const courseTopicsList = '[data-cy="course-topics-list"]';

  const topicNameInput = '[data-cy="topic-name-input"]';
  const createTopicButton = '[data-cy="create-topic-button"]';
  const editTopicInput = '[data-cy="edit-topic-input"]';
  const cancelDeleteButton = '[data-cy="cancel-delete-button"]';
  const confirmDeleteButton = '[data-cy="confirm-delete-button"]';

  const courseTitle = "Computer System Fundamentals";
  const courseNumber = "601.229";
  const courseSemester = "Fall";
  const courseYear = "2023";

  const createCourseSemester = `[data-cy="${courseSemester}"]`;
  const courseCard = `[data-cy="${courseNumber}"]`;

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
    cy.get(navbar).contains("a", "topics").click();
    cy.get("body").click();
  });

  it("Layout Contains All Required Elements", () => {
    cy.get(navbarButton).should("be.visible").should("be.enabled");
    if (window.innerWidth < 1024) {
      cy.get(ellipsisIconButton).should("be.visible");
    } else {
      cy.get(profileNameButton).should("be.visible");
    }
    cy.get(addTopicButton).should("be.visible").should("be.enabled");
    cy.get(noTopicsAlert).should("be.visible");
  });

  it("Add Topic Popup Looks as Expected", () => {
    cy.get(addTopicButton).click();

    cy.get(topicNameInput).should("be.visible");
    cy.get(createTopicButton).should("be.visible").should("be.enabled");
  });

  it("Failure when Adding a Topic with Empty Name", () => {
    cy.get(addTopicButton).click();
    cy.get(createTopicButton).click();

    cy.get(topicNameInput).contains("p", "Topic name is required");
  });

  it("Successfully Adding a Topic", () => {
    const topicName = "Caches";

    cy.get(addTopicButton).click();
    cy.get(topicNameInput).type(topicName);
    cy.get(createTopicButton).click();

    const topicCard = `[data-cy="${topicName}"]`;

    cy.wait(1000);

    cy.get(courseTopicsList).children().should("have.length", 1);
    cy.get(".Toastify")
      .contains("div", `Successfully created the "${topicName}" topic!`)
      .should("be.visible");
    cy.get(topicCard).contains("h5", topicName);
    cy.get(topicCard).contains("button", "Edit");
    cy.get(topicCard).contains("button", "Delete");
  });

  it("Failure when Editing a Topic with Empty Name", () => {
    const topicName = "Caches";

    cy.get(addTopicButton).click();
    cy.get(topicNameInput).type(topicName);
    cy.get(createTopicButton).click();

    const topicCard = `[data-cy="${topicName}"]`;

    cy.wait(1000);

    cy.get(topicCard).contains("button", "Edit").click();
    cy.get(editTopicInput).get("input").clear();
    cy.get(topicCard).contains("button", "Submit").click();

    cy.get(editTopicInput).contains("p", "Topic name is required");
  });

  it("Successfully Editing a Topic", () => {
    const oldTopicName = "Caches";

    cy.get(addTopicButton).click();
    cy.get(topicNameInput).type(oldTopicName);
    cy.get(createTopicButton).click();

    const oldTopicCard = `[data-cy="${oldTopicName}"]`;

    cy.wait(1000);

    const newTopicName = "Multi-threaded Networks";

    cy.get(oldTopicCard).contains("button", "Edit").click();
    cy.get(editTopicInput).get("input").clear();
    cy.get(editTopicInput).type(newTopicName);
    cy.get(oldTopicCard).contains("button", "Submit").click();

    const newTopicCard = `[data-cy="${newTopicName}"]`;

    cy.get(".Toastify")
      .contains("div", `Successfully updated the topic!`)
      .should("be.visible");
    cy.get(newTopicCard).contains("h5", newTopicName);
  });

  it("Cancelling Editing a Topic", () => {
    const topicName = "Caches";

    cy.get(addTopicButton).click();
    cy.get(topicNameInput).type(topicName);
    cy.get(createTopicButton).click();

    const topicCard = `[data-cy="${topicName}"]`;

    cy.get(topicCard).contains("button", "Edit").click();
    cy.get(editTopicInput).get("input").clear();
    cy.get(topicCard).contains("button", "Cancel").click();

    cy.wait(1000);

    cy.get(topicCard).contains("h5", topicName);
  });

  it("Confirm Delete Topic Popup Looks as Expected", () => {
    const topicName = "Caches";

    cy.get(addTopicButton).click();
    cy.get(topicNameInput).type(topicName);
    cy.get(createTopicButton).click();

    const topicCard = `[data-cy="${topicName}"]`;

    cy.wait(1000);

    cy.get(topicCard).contains("button", "Delete").click();
    cy.get(cancelDeleteButton).should("be.visible").should("be.enabled");
    cy.get(confirmDeleteButton).should("be.visible").should("be.enabled");
  });

  it("Successfully Deleting a Topic", () => {
    const topicName = "Caches";

    cy.get(addTopicButton).click();
    cy.get(topicNameInput).type(topicName);
    cy.get(createTopicButton).click();

    const topicCard = `[data-cy="${topicName}"]`;

    cy.wait(1000);

    cy.get(topicCard).contains("button", "Delete").click();
    cy.get(confirmDeleteButton).click();
    cy.get(".Toastify")
      .contains("div", `Successfully deleted the "${topicName}" topic!`)
      .should("be.visible");
    cy.get(noTopicsAlert).should("be.visible");
  });

  it("Cancelling Deleting a Topic", () => {
    const topicName = "Caches";

    cy.get(addTopicButton).click();
    cy.get(topicNameInput).type(topicName);
    cy.get(createTopicButton).click();

    const topicCard = `[data-cy="${topicName}"]`;

    cy.wait(1000);

    cy.get(topicCard).contains("button", "Delete").click();
    cy.get(cancelDeleteButton).click();
    cy.get(topicCard).contains("h5", topicName);
  });
});
