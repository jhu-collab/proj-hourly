describe("My Courses Page", () => {
  const BASE_URL = "http://localhost:3000/";

  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';

  const navbarButton = '[data-cy="navbar-button"]';
  const navbar = '[data-cy="navbar"]';
  const ellipsisIconButton = '[data-cy="ellipsis-icon-button"]';
  const profileNameButton = '[data-cy="profile-name-button"]';
  const profileButton = '[data-cy="profile-button"]';
  const logoutButton = '[data-cy="logout-button"]';

  const staffCoursesLabel = '[data-cy="staff-courses-label"]';
  const staffCourseList = '[data-cy="staff-course-list"]';
  const studentCoursesLabel = '[data-cy="student-courses-label"]';
  const studentCourseList = '[data-cy="student-course-list"]';

  const addCourseButton = '[data-cy="add-course-button"]';

  const joinCourseButton = '[data-cy="join-course-button"]';
  const joinCourseInput = '[data-cy="join-course-input"]';

  const createCourseButton = '[data-cy="create-course-button"]';
  const createCourseTitle = '[data-cy="course-title-input"]';
  const createCourseNumber = '[data-cy="course-number-input"]';
  const createCourseSemester = '[data-cy="course-semester-input"]';
  const createCourseYear = '[data-cy="course-year-input"]';
  const createButton = '[data-cy="create-button"]';

  beforeEach(() => {
    cy.task("deleteStudentCourses", "user-1");
    cy.task("deleteInstructorCourses", "user-1");

    cy.visit(BASE_URL + "login");

    cy.get(userNameInputText).type("user-1");
    cy.get(passwordInputText).type("user-1");
    cy.get(loginButton).click();
  });

  it("Layout Contains All Required Elements", () => {
    cy.get(navbarButton).should("be.visible").should("be.enabled");
    if (window.innerWidth < 1024) {
      cy.get(ellipsisIconButton).should("be.visible");
    } else {
      cy.get(profileNameButton).should("be.visible");
    }
    cy.get(staffCoursesLabel).should("be.visible");
    cy.get(staffCourseList)
      .should("be.visible")
      .should("have.length", 1)
      .contains(
        "You are not enrolled in any courses in which you are a staff member."
      );
    cy.get(studentCoursesLabel).should("be.visible");
    cy.get(studentCourseList)
      .should("be.visible")
      .should("have.length", 1)
      .contains(
        "You are not enrolled in any courses in which you are a student."
      );
    cy.get(addCourseButton).should("be.visible").should("be.enabled");
  });

  it("Navigation Drawer Opens and Displays My Courses Tab", () => {
    cy.get(navbarButton).click();

    cy.get(navbar).contains("a", "my courses").should("be.visible");
  });

  it("Clicking the Add Course Button Should Display Popup Correctly", () => {
    cy.get(addCourseButton).click();

    cy.get(joinCourseInput).should("be.visible");
    cy.get(joinCourseButton).should("be.visible").should("be.enabled");
    cy.get(createCourseButton).should("be.visible").should("be.enabled");
  });

  it("Failure to Join Student Course With Empty Course Number", () => {
    cy.get(addCourseButton).click();
    cy.get(joinCourseButton).click();

    cy.get(joinCourseInput).contains("p", "Course code is required");
    cy.get(studentCourseList)
      .should("be.visible")
      .should("have.length", 1)
      .contains(
        "You are not enrolled in any courses in which you are a student."
      );
  });

  it("Failure to Join Student Course With Invalid Course Number Length", () => {
    cy.get(addCourseButton).click();
    cy.get(joinCourseInput).type("0000");
    cy.get(joinCourseButton).click();

    cy.get(joinCourseInput).contains("p", "Course code must be 6 characters");
    cy.get(studentCourseList)
      .should("be.visible")
      .should("have.length", 1)
      .contains(
        "You are not enrolled in any courses in which you are a student."
      );
  });

  it("Successfully Joins Student Course With Valid Course Number", () => {
    const courseCode = "AVENGE";

    cy.get(addCourseButton).click();
    cy.get(joinCourseInput).type(courseCode);
    cy.get(joinCourseButton).click();

    cy.task("getCourseByCode", courseCode).then((course) => {
      cy.get(".Toastify")
        .contains(
          "div",
          `Successfully joined ${course.title} course for ${course.semester} ${course.calendarYear}`
        )
        .should("be.visible");
      cy.get(studentCourseList)
        .should("be.visible")
        .should("have.length", 1)
        .contains(course.title);
    });
  });

  it("Clicking the Create a New Course Button Should Display Popup Correctly", () => {
    cy.get(addCourseButton).click();
    cy.get(createCourseButton).click();

    cy.get(createCourseTitle).should("be.visible");
    cy.get(createCourseNumber).should("be.visible");
    cy.get(createCourseSemester).should("be.visible");
    cy.get(createCourseYear).should("be.visible");
    cy.get(createButton).should("be.visible").should("be.enabled");
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
    cy.get(joinCourseInput).type(courseCode);
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
    if (window.innerWidth < 1024) {
      cy.get(ellipsisIconButton).click();
    }
    cy.get(profileNameButton).click();
    cy.get(logoutButton).click();

    cy.url().should("be.equal", BASE_URL + "login");
  });

  it("Successful Navigation to Profile Page", () => {
    if (window.innerWidth < 1024) {
      cy.get(ellipsisIconButton).click();
    }
    cy.get(profileNameButton).click();
    cy.get(profileButton).click();

    cy.url().should("be.equal", BASE_URL + "profile");
  });
});
