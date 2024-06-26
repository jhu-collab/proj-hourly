const formatCypressDate = (date) => {
  const year = date.toLocaleString("default", { year: "numeric" });
  const month = date.toLocaleString("default", { month: "2-digit" });
  const day = date.toLocaleString("default", { day: "2-digit" });

  // Generate yyyy-mm-dd date string
  return year + "-" + month + "-" + day;
};

describe("Course Details Page: Instructor", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly";

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

  const courseCalendarEventInfoTitle =
    '[data-cy="coursetype-calendar-event_info_title"]';
  const courseTokenOptionTitle = '[data-cy="coursetype-course-token-title"]';

  const courseTitle = "Machine Learning";
  const courseNumber = "601.475";
  const courseSemester = "Fall";
  const courseYear = new Date().getFullYear().toString();

  const deleteCourseButton = '[data-cy="delete-course-button"]';

  const deleteCourseConfirmButton = '[data-cy="confirm-delete-button"]';
  const deleteCourseCancelButton = '[data-cy="cancel-delete-button"]';

  const createCourseSemester = `[data-cy="${courseSemester}"]`;
  const courseCard = `[data-cy="${courseNumber}"]`;

  const staffCoursesLabel = '[data-cy="staff-courses-label"]';
  const staffCourseList = '[data-cy="staff-course-list"]';

  beforeEach(() => {
    cy.task("deleteStudentCourses", "user-1");
    cy.task("deleteInstructorCourses", "user-1");
    // task to change course token to false / opt out everytime
    // cy.task("optOutCourseToken", "Machine Learning");

    cy.visit(BASE_URL + "/login");

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
    cy.task("optOutCourseToken", "Machine Learning");

    cy.wait(1000);

    cy.get(courseCard).click();
    cy.wait(1000);

    cy.get(navbarButton).click();
    cy.wait(1000);
    cy.get(navbar).contains("a", "course details").click();

    cy.get("body").click();

    // enable all initial course to use tokens
    Cypress.on("uncaught:exception", () => {
      return false;
    });
    cy.wait(1000);
    cy.get(courseTokenOptionTitle).contains(`Course Token Option`);
    cy.get('[data-cy="use-token-submit"]').click();
    cy.wait(1000);
    cy.visit(BASE_URL + "/login");

    // get back to course detail page
    cy.get(courseCard).click();
    cy.get(navbarButton).click();
    cy.wait(1000);
    cy.get(navbar).contains("a", "course tokens");
    cy.wait(1000);
    cy.get(navbar).contains("a", "course details").click();
    cy.wait(1000);
    cy.get("body").click();
  });

  it("Course Details Look as Expected", () => {
    cy.get(courseDetailsTitle).contains(`Course Name: ${courseTitle}`);
    cy.get(courseDetailsNumber).contains(`Course Number: ${courseNumber}`);
    cy.get(courseDetailsSemester).contains(`Semester: ${courseSemester}`);
    cy.get(courseDetailsYear).contains(`Year: ${courseYear}`);
    cy.get(deleteCourseButton).should("be.visible").should("be.enabled");
    Cypress.on("uncaught:exception", () => {
      return false;
    });
    cy.task("getCourseByNumber", courseNumber).then((course) => {
      cy.get(courseDetailsCode).contains(`Code: ${course.code}`);
    });

    cy.get('[data-cy="coursetype-course-pause-or-archive-title"]').contains(
      "Pause or Archive Course"
    );
  });

  it("create course calendar event successful", () => {
    cy.get(courseCalendarEventInfoTitle).contains(
      `Course Calendar Event Information`
    );
    // Activate recurring
    cy.get('input[name="recurringEvent"]').check();
    // Hardcode date
    const now = new Date();
    const beginDate = new Date(now);
    const endDate = new Date(now.setMonth(now.getMonth() + 1));
    // Enter start and end date
    Cypress.on("uncaught:exception", () => {
      return false;
    });
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    while (
      daysOfWeek[beginDate.getDay()] != "Tuesday" &&
      daysOfWeek[beginDate.getDay()] != "Thursday" &&
      daysOfWeek[beginDate.getDay()] != "Sunday"
    ) {
      beginDate.setDate(beginDate.getDate() + 1);
    }
    while (
      daysOfWeek[endDate.getDay()] != "Tuesday" &&
      daysOfWeek[endDate.getDay()] != "Thursday" &&
      daysOfWeek[endDate.getDay()] != "Sunday"
    ) {
      endDate.setDate(endDate.getDate() + 1);
    }
    cy.get('[data-cy="create-start-date-text"]')
      // .clear()
      .type(formatCypressDate(beginDate));
    Cypress.on("uncaught:exception", () => {
      return false;
    });
    cy.get('[data-cy="create-end-date-text"]')
      // .clear()
      .type(formatCypressDate(endDate));
    // Course happens on which days
    cy.get('button[value="Tuesday"]').click();
    cy.get('button[value="Thursday"]').click();
    cy.get('button[value="Sunday"]').click();

    // location
    const locationName = "Malone";
    cy.get('[data-cy="create-location-input"]').type(locationName);

    // submit
    cy.get('[data-cy="create-event-submit"]').click();

    cy.get(navbarButton).click();
    cy.wait(1000);
    cy.get(navbar).contains("a", "calendar").click();
    cy.get("body").click();

    // check if events appear in calendar correctly - hard coded (creating events on Sunday, recurring on every Tues, Thurs, & Sun)
    cy.get('button[title="Next week"]').should("be.visible").click();
    cy.get('div[class="fc-daygrid-event-harness"]').then(($elements) => {
      let countOfElements = 0;
      cy.log($elements.length);
      countOfElements += $elements.length;
      cy.wrap(countOfElements).should("be.lte", 3);
    });

    // // check if token appears to the left
    // cy.wait(1000);
    // cy.get(navbarButton).click();
    // cy.wait(1000);
    // cy.get(navbar).contains("a", "course tokens").click();
  });

  it("opt out of token successful", () => {
    // test opt out of use tokens
    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "course details").click();
    cy.get("body").click();
    cy.get(courseTokenOptionTitle).contains(`Course Token Option`);
    cy.get('[data-cy="use-token-submit"]').click();
    cy.wait(1000);
    cy.get(courseCard).click();
    cy.get(navbarButton).click();
    cy.wait(1000);
    cy.get(navbar).contains("a", "course details").should("exist");
    cy.wait(1000);
    cy.get(navbar).contains("course tokens").should("not.exist");
  });

  it("delete course calendar event successful", () => {
    cy.get(courseCalendarEventInfoTitle).contains(
      `Course Calendar Event Information`
    );
    // Activate recurring
    cy.get('input[name="recurringEvent"]').check();
    // Hardcode date
    const now = new Date();
    const beginDate = new Date(now);
    const endDate = new Date(now.setMonth(now.getMonth() + 1));
    // Enter start and end date
    Cypress.on("uncaught:exception", () => {
      return false;
    });
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    while (
      daysOfWeek[beginDate.getDay()] != "Tuesday" &&
      daysOfWeek[beginDate.getDay()] != "Thursday" &&
      daysOfWeek[beginDate.getDay()] != "Sunday"
    ) {
      beginDate.setDate(beginDate.getDate() + 1);
    }

    cy.get('[data-cy="create-start-date-text"]')
      // .clear()
      .type(formatCypressDate(beginDate));
    Cypress.on("uncaught:exception", () => {
      return false;
    });
    while (
      daysOfWeek[endDate.getDay()] != "Tuesday" &&
      daysOfWeek[endDate.getDay()] != "Thursday" &&
      daysOfWeek[endDate.getDay()] != "Sunday"
    ) {
      endDate.setDate(endDate.getDate() + 1);
    }
    cy.get('[data-cy="create-end-date-text"]')
      // .clear()
      .type(formatCypressDate(endDate));
    // Course happens on which days
    cy.get('button[value="Tuesday"]').click();
    cy.get('button[value="Thursday"]').click();
    cy.get('button[value="Sunday"]').click();

    // location
    const locationName = "Malone";
    cy.get('[data-cy="create-location-input"]').type(locationName);

    // submit
    cy.get('[data-cy="create-event-submit"]').click();
    cy.wait(1000);

    // submit
    cy.get('[data-cy="delete-event-submit"]').click();

    // check if events disappear in calendar correctly - hard coded (creating events on Sunday, recurring on every Tues, Thurs, & Sun)
    cy.get(navbarButton).click();
    cy.get(navbar).contains("a", "calendar").click();
    cy.wait(1000);
    cy.get("body").click();
    cy.get('button[title="Next week"]').should("be.visible").click();
    cy.get('div[class="fc-daygrid-event-harness"]').should("not.exist");
  });
  it("cancel delete course successful", () => {
    cy.get(courseCalendarEventInfoTitle).contains(
      `Course Calendar Event Information`
    );
    cy.get(deleteCourseButton).click();
    cy.get(deleteCourseCancelButton).click();
  });
  it("delete course successful", () => {
    cy.get(courseCalendarEventInfoTitle).contains(
      `Course Calendar Event Information`
    );
    cy.get(deleteCourseButton).click();
    cy.get(deleteCourseConfirmButton).click();
    cy.visit(BASE_URL + "/login");
    cy.get(staffCoursesLabel).should("be.visible");
    cy.get(staffCourseList)
      .children()
      .should("be.visible")
      .should("have.length", 1)
      .contains(
        "You are not enrolled in any courses in which you are a staff member."
      );
  });
});

describe("Course Details Page: Student", () => {
  const BASE_URL = "http://localhost:3000/proj-hourly";

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
  const deleteCourseButton = '[data-cy="delete-course-button"]';

  const leaveCourseConfirmButton = '[data-cy="confirm-delete-button"]';
  const leaveCourseCancelButton = '[data-cy="cancel-delete-button"]';

  const studentCourseList = '[data-cy="student-course-list"]';

  const courseCode = "AVENGE";

  beforeEach(() => {
    cy.task("deleteStudentCourses", "user-1");
    cy.task("deleteInstructorCourses", "user-1");

    cy.visit(BASE_URL + "/login");

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
    Cypress.on("uncaught:exception", () => {
      return false;
    });

    cy.get(leaveCourseButton).click();
    cy.get(leaveCourseConfirmButton).should("be.visible");

    cy.get(leaveCourseConfirmButton).click();

    cy.url().should("be.equal", BASE_URL);
    cy.get(".Toastify")
      .contains("div", "Successfully left course!")
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

    cy.url().should("be.equal", BASE_URL + "/courseinformation");
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
