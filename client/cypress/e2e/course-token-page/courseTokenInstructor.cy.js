describe("Course Tokens Page", () => {
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
  const ellipsisIconButton = '[data-cy="ellipsis-icon-button"]';
  const profileNameButton = '[data-cy="profile-name-button"]';
  const addTokenButton = '[data-cy="add-token-button"]';
  const noTokensAlert = '[data-cy="no-tokens-alert"]';
  const editTokenName = '[data-cy="edit-token-name"]';
  const editTokenDescription = '[data-cy="edit-token-description]';
  const editTokenQuantity = '[data-cy="edit-token-quantity"]';
  // const courseTopicsList = '[data-cy="course-topics-list"]';

  // const topicNameInput = '[data-cy="topic-name-input"]';
  // const createTopicButton = '[data-cy="create-topic-button"]';
  // const editTopicInput = '[data-cy="edit-topic-input"]';
  // const cancelDeleteButton = '[data-cy="cancel-delete-button"]';
  // const confirmDeleteButton = '[data-cy="confirm-delete-button"]';
  const tokenNameInput = '[data-cy="token-name-input"]';
  const tokenDescriptionInput = '[data-cy="token-description-input"]';
  const tokenQuantityInput = '[data-cy="token-quantity-input"]';
  const createTokenButton = '[data-cy="create-token-button"]';
  const courseTokensListStaff = '[data-cy="course-tokens-list-staff"]';

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
    cy.task("enableCourseTokens", "user-1");
    cy.visit(BASE_URL + "login");
    cy.get(courseCard).click();

    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "course tokens").click();
    cy.get("body").click();
    cy.task("enableCourseTokens", "user-1");
  });

  it("Layout Contains All Required Elements", () => {
    cy.get(navbarButton).should("be.visible").should("be.enabled");
    if (window.innerWidth < 1024) {
      cy.get(ellipsisIconButton).should("be.visible");
    } else {
      cy.get(profileNameButton).should("be.visible");
    }
    cy.get(addTokenButton).should("be.visible").should("be.enabled");
    cy.get(noTokensAlert).should("be.visible");
  });

  it("Add Topic Popup Looks as Expected", () => {
    cy.get(addTokenButton).click();

    cy.get(tokenNameInput).should("be.visible");
    cy.get(tokenDescriptionInput).should("be.visible");
    cy.get(tokenQuantityInput).should("be.visible");
    cy.get(createTokenButton).should("be.visible").should("be.enabled");
  });

  it("Failure when Adding a Topic with Empty Name and Qauntity", () => {
    cy.get(addTokenButton).click();
    cy.get(createTokenButton).click();

    cy.get(tokenNameInput).contains("p", "Token name is required");
    cy.get(tokenQuantityInput).contains(
      "p",
      "Must have at least 1 of each token"
    );
  });
  it("Failure when Adding a Topic with Empty Name", () => {
    cy.get(addTokenButton).click();
    cy.get(tokenQuantityInput).type(3);
    cy.get(createTokenButton).click();

    cy.get(tokenNameInput).contains("p", "Token name is required");
  });
  it("Failure when Adding a Topic with Empty Name and Negative Quantity", () => {
    cy.get(addTokenButton).click();
    cy.get(tokenQuantityInput).type(-3);
    cy.get(createTokenButton).click();

    cy.get(tokenNameInput).contains("p", "Token name is required");
    cy.get(tokenQuantityInput).contains(
      "p",
      "Must have at least 1 of each token"
    );
  });
  it("Failure when Adding a Topic with Empty Quantity", () => {
    cy.get(addTokenButton).click();
    cy.get(tokenNameInput).type("Clue Token");
    cy.get(createTokenButton).click();

    cy.get(tokenQuantityInput).contains(
      "p",
      "Must have at least 1 of each token"
    );
  });

  it("Successfully Adding a Token w/o Description", () => {
    const tokenName = "Clue Token";
    const tokenQuantity = 3;
    cy.get(addTokenButton).click();
    cy.get(tokenNameInput).type(tokenName);
    cy.get(tokenQuantityInput).type(tokenQuantity);
    cy.get(createTokenButton).click();

    const tokenCard = `[data-cy="${tokenName}"]`;

    cy.wait(1000);

    cy.get(courseTokensListStaff).children().should("have.length", 1);
    cy.get(".Toastify")
      .contains("div", `Successfully created the "${tokenName}" token!`)
      .should("be.visible");
    cy.get(tokenCard).contains("h5", tokenName);
    cy.get(tokenCard).contains("h5", tokenQuantity);
    cy.get(tokenCard).contains("button", "Edit");
    cy.get(tokenCard).contains("button", "Delete");
  });

  it("Successfully Adding a Token w/ Description", () => {
    const tokenName = "Clue Token";
    const tokenQuantity = 3;
    const description = "used for autograder clue";
    cy.get(addTokenButton).click();
    cy.get(tokenNameInput).type(tokenName);
    cy.get(tokenQuantityInput).type(tokenQuantity);
    cy.get(tokenDescriptionInput).type(description);
    cy.get(createTokenButton).click();

    const tokenCard = `[data-cy="${tokenName}"]`;

    cy.wait(1000);

    cy.get(courseTokensListStaff).children().should("have.length", 1);
    cy.get(".Toastify")
      .contains("div", `Successfully created the "${tokenName}" token!`)
      .should("be.visible");
    cy.get(tokenCard).contains("h5", tokenName);
    cy.get(tokenCard).contains("h5", tokenQuantity);
    cy.get(tokenCard).contains("h5", description);
    cy.get(tokenCard).contains("button", "Edit");
    cy.get(tokenCard).contains("button", "Delete");
  });

  it("Failure when Editing a Token with Empty Name", () => {
    const tokenName = "Clue Token";
    const tokenQuantity = 3;
    cy.get(addTokenButton).click();
    cy.get(tokenNameInput).type(tokenName);
    cy.get(tokenQuantityInput).type(tokenQuantity);
    cy.get(createTokenButton).click();

    const tokenCard = `[data-cy="${tokenName}"]`;

    cy.wait(1000);

    cy.get(tokenCard).contains("button", "Edit").click();
    cy.get(editTokenName).type("{selectAll}").type("{backspace}");
    cy.get(tokenCard).contains("button", "Submit").click();

    cy.get(editTokenName).contains("p", "Token name is required");
  });

  it("Failure when Editing a Token with Empty quantity", () => {
    const tokenName = "Clue Token";
    const tokenQuantity = 3;
    cy.get(addTokenButton).click();
    cy.get(tokenNameInput).type(tokenName);
    cy.get(tokenQuantityInput).type(tokenQuantity);
    cy.get(createTokenButton).click();

    const tokenCard = `[data-cy="${tokenName}"]`;

    cy.wait(1000);

    cy.get(tokenCard).contains("button", "Edit").click();
    cy.get(editTokenQuantity).type("{backspace}");
    cy.get(tokenCard).contains("button", "Submit").click();

    cy.get(editTokenQuantity).contains("p", "You must specify a number");
  });

  it("Failure when Editing a Token with Empty quantity", () => {
    const tokenName = "Clue Token";
    const tokenQuantity = 3;
    cy.get(addTokenButton).click();
    cy.get(tokenNameInput).type(tokenName);
    cy.get(tokenQuantityInput).type(tokenQuantity);
    cy.get(createTokenButton).click();

    const tokenCard = `[data-cy="${tokenName}"]`;

    cy.wait(1000);

    cy.get(tokenCard).contains("button", "Edit").click();
    cy.get(editTokenQuantity).type(0);
    cy.get(tokenCard).contains("button", "Submit").click();

    cy.get(editTokenQuantity).contains(
      "p",
      "Must have at least 1 of each token"
    );
  });

  // it("Successfully Editing a Topic", () => {
  //   const oldTopicName = "Caches";

  //   cy.get(addTopicButton).click();
  //   cy.get(topicNameInput).type(oldTopicName);
  //   cy.get(createTopicButton).click();

  //   const oldTopicCard = `[data-cy="${oldTopicName}"]`;

  //   cy.wait(1000);

  //   const newTopicName = "Multi-threaded Networks";

  //   cy.get(oldTopicCard).contains("button", "Edit").click();
  //   cy.get(editTopicInput)
  //     .type("{selectAll}")
  //     .type("{backspace}")
  //     .type(newTopicName);
  //   cy.get(oldTopicCard).contains("button", "Submit").click();

  //   const newTopicCard = `[data-cy="${newTopicName}"]`;

  //   cy.get(".Toastify")
  //     .contains("div", `Successfully updated the topic!`)
  //     .should("be.visible");
  //   cy.get(newTopicCard).contains("h5", newTopicName);
  // });

  // it("Cancelling Editing a Topic", () => {
  //   const topicName = "Caches";

  //   cy.get(addTopicButton).click();
  //   cy.get(topicNameInput).type(topicName);
  //   cy.get(createTopicButton).click();

  //   const topicCard = `[data-cy="${topicName}"]`;

  //   cy.get(topicCard).contains("button", "Edit").click();
  //   cy.get(editTopicInput).type("{selectAll}").type("{backspace}");
  //   cy.get(topicCard).contains("button", "Cancel").click();

  //   cy.wait(1000);

  //   cy.get(topicCard).contains("h5", topicName);
  // });

  // it("Confirm Delete Topic Popup Looks as Expected", () => {
  //   const topicName = "Caches";

  //   cy.get(addTopicButton).click();
  //   cy.get(topicNameInput).type(topicName);
  //   cy.get(createTopicButton).click();

  //   const topicCard = `[data-cy="${topicName}"]`;

  //   cy.wait(1000);

  //   cy.get(topicCard).contains("button", "Delete").click();
  //   cy.get(cancelDeleteButton).should("be.visible").should("be.enabled");
  //   cy.get(confirmDeleteButton).should("be.visible").should("be.enabled");
  // });

  // it("Successfully Deleting a Topic", () => {
  //   const topicName = "Caches";

  //   cy.get(addTopicButton).click();
  //   cy.get(topicNameInput).type(topicName);
  //   cy.get(createTopicButton).click();

  //   const topicCard = `[data-cy="${topicName}"]`;

  //   cy.wait(1000);

  //   cy.get(topicCard).contains("button", "Delete").click();
  //   cy.get(confirmDeleteButton).click();
  //   cy.get(".Toastify")
  //     .contains("div", `Successfully deleted the "${topicName}" topic!`)
  //     .should("be.visible");
  //   cy.get(noTopicsAlert).should("be.visible");
  // });

  // it("Cancelling Deleting a Topic", () => {
  //   const topicName = "Caches";

  //   cy.get(addTopicButton).click();
  //   cy.get(topicNameInput).type(topicName);
  //   cy.get(createTopicButton).click();

  //   const topicCard = `[data-cy="${topicName}"]`;

  //   cy.wait(1000);

  //   cy.get(topicCard).contains("button", "Delete").click();
  //   cy.get(cancelDeleteButton).click();
  //   cy.get(topicCard).contains("h5", topicName);
  // });
});
