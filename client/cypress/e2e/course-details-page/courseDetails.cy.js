describe("Course Details Page: Staff", () => {
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

  const courseDetailsTitle = '[data-cy="course-details-title"]';
  const courseDetailsNumber = '[data-cy="course-details-number"]';
  const courseDetailsSemester = '[data-cy="course-details-semester"]';
  const courseDetailsYear = '[data-cy="course-details-year"]';
  const courseDetailsCode = '[data-cy="course-details-code"]';

  const courseTitle = "Machine Learning";
  const courseNumber = "601.475";
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
    cy.get(navbar).contains("a", "course details").click();
    cy.get("body").click();
  });

  it("Course Details Look as Expected", () => {
    cy.get(courseDetailsTitle).contains(`Course Name: ${courseTitle}`);
    cy.get(courseDetailsNumber).contains(`Course Number: ${courseNumber}`);
    cy.get(courseDetailsSemester).contains(`Semester: ${courseSemester}`);
    cy.get(courseDetailsYear).contains(`Year: ${courseYear}`);
    cy.task("getCourseByNumber", courseNumber).then((course) => {
      cy.get(courseDetailsCode).contains(`Code: ${course.code}`);
    });
  });
});

describe("Course Details Page: Student", () => {
  const BASE_URL = "http://localhost:3000/";

  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';

  const addCourseButton = '[data-cy="add-course-button"]';
  const joinCourseButton = '[data-cy="join-course-button"]';
  const joinCourseInput = '[data-cy="join-course-input"]';

  const navbarButton = '[data-cy="navbar-button"]';
  const navbar = '[data-cy="navbar"]';

  const courseDetailsTitle = '[data-cy="course-details-title"]';
  const courseDetailsNumber = '[data-cy="course-details-number"]';
  const courseDetailsSemester = '[data-cy="course-details-semester"]';
  const courseDetailsYear = '[data-cy="course-details-year"]';
  const leaveCourseButton = '[data-cy="leave-course-button"]';

  const leaveCourseConfirmButton = '[data-cy="confirm-delete-button"]';
  const leaveCourseCancelButton = '[data-cy="cancel-delete-button"]';

  const studentCourseList = '[data-cy="student-course-list"]';

  const courseCode = "AVENGE";

  beforeEach(() => {
    cy.task("deleteStudentCourses", "user-1");
    cy.task("deleteInstructorCourses", "user-1");

    cy.visit(BASE_URL + "login");

    cy.get(userNameInputText).type("user-1");
    cy.get(passwordInputText).type("user-1");
    cy.get(loginButton).click();

    cy.get(addCourseButton).click();
    cy.get(joinCourseInput).type(courseCode);
    cy.get(joinCourseButton).click();

    cy.wait(1000);

    cy.task("getCourseByCode", courseCode).then((course) => {
      const courseCard = `[data-cy="${course.courseNumber}"]`;
      cy.get(courseCard).click();

      cy.get(navbarButton).click();
      cy.get(navbar).contains("a", "course details").click();
      cy.get("body").click();
    });
  });

  it("Course Details Look as Expected", () => {
    cy.task("getCourseByCode", courseCode).then((course) => {
      cy.get(courseDetailsTitle).contains(`Course Name: ${course.title}`);
      cy.get(courseDetailsNumber).contains(
        `Course Number: ${course.courseNumber}`
      );
      cy.get(courseDetailsSemester).contains(`Semester: ${course.semester}`);
      cy.get(courseDetailsYear).contains(`Year: ${course.calendarYear}`);
      cy.get(leaveCourseButton).should("be.visible").should("be.enabled");
    });
  });

  it("Leave Course Successful", () => {
    cy.get(leaveCourseButton).click();
    cy.get(leaveCourseConfirmButton).click();

    cy.url().should("be.equal", BASE_URL);
    cy.get(".Toastify")
      .contains("div", "Successfully removed course!")
      .should("be.visible");
    cy.get(studentCourseList)
      .should("be.visible")
      .should("have.length", 1)
      .contains(
        "You are not enrolled in any courses in which you are a student."
      );
  });

  it("Leave Course Cancelled", () => {
    cy.get(leaveCourseButton).click();
    cy.get(leaveCourseCancelButton).click();

    cy.url().should("be.equal", BASE_URL + "courseinformation");
    cy.task("getCourseByCode", courseCode).then((course) => {
      cy.get(courseDetailsTitle).contains(`Course Name: ${course.title}`);
      cy.get(courseDetailsNumber).contains(
        `Course Number: ${course.courseNumber}`
      );
      cy.get(courseDetailsSemester).contains(`Semester: ${course.semester}`);
      cy.get(courseDetailsYear).contains(`Year: ${course.calendarYear}`);
      cy.get(leaveCourseButton).should("be.visible").should("be.enabled");
    });
  });
});