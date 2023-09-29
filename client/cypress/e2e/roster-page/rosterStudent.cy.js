describe("Student Roster Page", () => {
    const BASE_URL = "http://localhost:3000/proj-hourly/";

  const userNameInputText = '[data-cy="username-input-text"]';
  const passwordInputText = '[data-cy="password-input-text"]';
  const loginButton = '[data-cy="login-button"]';

  const navbarButton = '[data-cy="navbar-button"]';
  const navbar = '[data-cy="navbar"]';
  const ellipsisIconButton = '[data-cy="ellipsis-icon-button"]';
  const profileNameButton = '[data-cy="profile-name-button"]';
  const rosterToolbarRoles = '[data-cy="roster-toolbar-roles"]';
  const rosterToolbarStudent = '[data-cy="roster-toolbar-students"]';
  const rosterToolbarStaff = '[data-cy="roster-toolbar-staff"]';
  const rosterToolbarInstructor = '[data-cy="roster-toolbar-instructors"]';
  const noRosterAlert = '[data-cy="no-roster-alert"]';

  const closeDeleteConfirmButton = '[data-cy="close-delete-button"]';
  const cancelDeleteConfirmButton = '[data-cy="cancel-delete-button"]';
  const confirmDeleteConfirmButton = '[data-cy="confirm-delete-button"]';

  const roleForm = '[data-cy="role-form"]';
  const studentRoleTitle = '[data-cy="student-role-title"]';
  const staffRoleTitle = '[data-cy="staff-role-title"]';
  const roleChoicesGroup = '[data-cy="role-choices-group"]';
  const toStaffButton = '[data-cy="to-staff-label"]';
  const toStudentButton = '[data-cy="to-student-label"]';
  const toInstructorButton = '[data-cy="to-instructor-label"]';
  const confirmRoleChangeButton = '[data-cy="confirm-role-change-button"]';

  const tokenSubtitle = '[data-cy="token-form-subtitle"]';
  const tokenDropdown = '[data-cy="token-dropdown-type"]';
  const tokenUndo = '[data-cy="token-undo-label"]';
  const tokenUndoDate = '[data-cy="token-date-dropdown"]';
  const tokenNone = '[data-cy="token-none"]';
  const tokenTokenTitle = '[data-cy="tokenTitle"]';
  const tokenSubmit = '[data-cy="token-submit-button"]';

  const courseTitle = "Data Structures";
  const courseNumber = "601.226";
  const courseSemester = "Spring";
  const courseYear = "2023";
  const courseCode = "ABCDEF";

  const createCourseSemester = `[data-cy="${courseSemester}"]`;
  const courseCard = `[data-cy="${courseNumber}"]`;

  const accounts = new Map();
  accounts.set("Ali-Student", {
    firstName: "Ali-Student",
    lastName: "Student",
    email: "ali-the-student@jhu.edu",
  });
  accounts.set("Thor", {
    firstName: "Thor",
    lastName: "Odinson",
    email: "thor.odinson@gmail.com",
  });
  accounts.set("Ali-Professor", {
    firstName: "Ali-Professor",
    lastName: "Professor",
    email: "amadooe1@jhu.edu",
  });
  accounts.set("Ali-TA", {
    firstName: "Ali-TA",
    lastName: "TA",
    email: "alimadooei@gmail.com",
  });
  // NEED TO CHANGE THIS IF ACCOUNTS ARE ADDED TO TESTS, OR FIRST/LAST NAMES OR EMAIL ARE CHANGED

  beforeEach(() => {
    cy.task("deleteStudentCourses", "ali-the-student");
    cy.task("deleteStaffCourses", "ali-the-student");
    cy.task("deleteInstructorCourse", "ali-the-student");
    cy.task("deleteStudentCourses", "ali-the-ta");
    cy.task("deleteStaffCourses", "ali-the-ta");
    cy.task("deleteInstructorCourse", "ali-the-ta");
    cy.task("deleteStudentCourses", "thor");
    cy.task("deleteStaffCourses", "thor");
    cy.task("deleteInstructorCourse", "thor");
    cy.task("deleteStudentCourses", "ali-the-professor");
    cy.task("deleteStaffCourses", "ali-the-professor");

    cy.task("deleteCourseTokens", courseCode);

    cy.task("addStudent", courseCode);
    cy.task("addStaff", courseCode);

    cy.task("addCourseTokens", courseCode);

    let tokenCounts = {};
    for (const account in accounts) {
      const accountValue = account.firstName;
      cy.task("getTokenCount", { accountValue, courseCode }).then(
        (tokenCount) => {
          tokenCounts[account.firstName] = tokenCount;
        }
      );
    }

    cy.visit(BASE_URL + "login");

    cy.get(userNameInputText).type("ali-the-student");
    cy.get(passwordInputText).type("ali-the-student");
    cy.get(loginButton).click();

    cy.wait(1000);

    cy.get(courseCard).click();
    });

    it("Roster page is not there for student", () => {
        const body = cy.get("body");
        cy.get(navbarButton).click();
        cy.get(navbar).contains("a", "roster").should('not.exist');
    });
});