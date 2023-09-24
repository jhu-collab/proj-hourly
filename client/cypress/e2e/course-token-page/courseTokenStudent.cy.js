describe("Course Tokens Page Student", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly/";

  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';

  const noTokenAlert = '[daya-cy="no-tokens-alert"]';

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
  const cancelDeleteButton = '[data-cy="cancel-delete-button"]';
  const confirmDeleteButton = '[data-cy="confirm-delete-button"]';
  const tokenNameInput = '[data-cy="token-name-input"]';
  const tokenDescriptionInput = '[data-cy="token-description-input"]';
  const tokenQuantityInput = '[data-cy="token-quantity-input"]';
  const createTokenButton = '[data-cy="create-token-button"]';
  const courseTokensListStaff = '[data-cy="course-tokens-list-staff"]';

  beforeEach(() => {
    //cy.task("createTokensForCourse", courseCode, tokens)
    cy.task("enableCourseTokens", "ali-the-professor");

    cy.visit(BASE_URL + "login");

    cy.get(userNameInputText).type("ali-the-student");
    cy.get(passwordInputText).type("ali-the-student");
    cy.get(loginButton).click();

    cy.contains("p", "Data Structures").click();
  });

  describe("No Tokens", () => {
    it("No Tokens Student View", () => {
      cy.get(navbarButton).click();
      cy.get(navbar).contains("a", "course tokens").click();
      cy.get("body").click();
      cy.get(noTokenAlert).should("be.visible");
    });
  });

  describe("One Token", () => {
    it("Tokens Student View", () => {});
  });

  describe("Multiple Tokens", () => {
    it("Tokens Student View", () => {});
  });
});
