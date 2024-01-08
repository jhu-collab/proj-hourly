const formatCypressDate = (date) => {
    const year = date.toLocaleString("default", { year: "numeric" });
    const month = date.toLocaleString("default", { month: "2-digit" });
    const day = date.toLocaleString("default", { day: "2-digit" });

    // Generate yyyy-mm-dd date string
    return year + "-" + month + "-" + day;
};

describe("Course Details Page: Staff", () => {
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


    const courseTokenOptionTitle = '[data-cy="coursetype-course-token-title"]';
    const courseRegConstraintFormTitle = '[data-cy="course-registration-constraint_form_title"]';

    const courseTitle = "Machine Learning";
    const courseNumber = "601.475";
    const courseSemester = "Fall";
    const courseYear = "2023";

    const createCourseSemester = `[data-cy="${courseSemester}"]`;
    const courseCard = `[data-cy="${courseNumber}"]`;

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

    it("enter course registration constraints successful", () => {
        cy.get(courseRegConstraintFormTitle).contains(
            `Course Registration Constraints`
        );

        // Enter start and end hour constraints
        // example used: start = 24, end = 4
        cy.get('[data-cy="create-start-reg-constraint"]')
            .clear()
            .type(24);
        cy.wait(1000);

        cy.get('[data-cy="create-end-reg-constraint"]')
            .clear()
            .type(4);
        cy.get('[data-cy="edit-reg-submit"]').click();

        cy.wait(1000);

        // check the entered value
        cy.get('[data-cy="create-start-reg-constraint"]') == 24;
        cy.get('[data-cy="create-end-reg-constraint"]') == 4;

    });

});
