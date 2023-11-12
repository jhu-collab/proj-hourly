describe("Pause Course", () => {
    const BASE_URL = "http://localhost:3000/proj-hourly";

    const userNameInputText = '[data-cy="username-input-text"]';
    const passwordInputText = '[data-cy="password-input-text"]';
    const loginButton = '[data-cy="login-button"]';



    const navbarButton = '[data-cy="navbar-button"]';
    const navbar = '[data-cy="navbar"]';


    const coursePauseOrArchiveTitle = '[data-cy="coursetype-course-pause-or-archive-title"]';


    const logoutButton = '[data-cy="logout-button"]';
    const ellipsisIconButton = '[data-cy="ellipsis-icon-button"]';
    const profileNameButton = '[data-cy="profile-name-button"]';

    const courseNumber = "601.226";
    const courseCode = "ABCDEF";

    const courseCard = `[data-cy="${courseNumber}"]`;



    beforeEach(() => {
        // initialize to set isArchived to false
        cy.task("setIsArchivedFalse", courseCode);
        // initialize to set isPaused to false
        cy.task("setIsPausedFalse", courseCode);


        // login as instructor, and pause a course
        cy.task("removeOH", courseCode);

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
        // add student to the course
        cy.task("addStudent", courseCode);
        cy.task("addStaff", courseCode);


        cy.visit(BASE_URL + "/login");

        // login as professor
        cy.get(userNameInputText).type("ali-the-professor");
        cy.get(passwordInputText).type("ali-the-professor");
        cy.get(loginButton).click();
        cy.wait(1000);
        cy.get(courseCard).click();
        cy.wait(1000);
        cy.get(navbarButton).click();
        cy.wait(1000);
        cy.get(navbar).contains("a", "course details").click();
        cy.get("body").click();
        // Pause course
        cy.get(coursePauseOrArchiveTitle).contains(`Pause or Archive Course`);
        cy.get('[data-cy="pause-course-submit"]').click();

        // updated start reg constraint to a very big number : 1000

        cy.task("updateRegConstraint", courseCode);

        // logout
        if (window.innerWidth < 1024) {
            cy.get(ellipsisIconButton).click();
        }
        cy.get(profileNameButton).click();
        cy.wait(1000);
        cy.get(logoutButton).click();

        // login as ta to create office hour
        cy.get(userNameInputText).type("ali-the-ta");
        cy.get(passwordInputText).type("ali-the-ta");
        cy.get(loginButton).click();
        cy.wait(1000);
        cy.get(courseCard).click();
        cy.wait(1000);
        // create office hour
        cy.get('button[title="Next week"]').should("be.visible").click();
        cy.get('[data-cy="full-calendar"]').click();
        cy.get('td.fc-timegrid-slot-lane[data-time="06:30:00"]').click();
        const locationName = "Mark's Location";
        cy.get('[data-cy="create-location-input"]')
            .should("be.visible")
            .type(locationName);
        cy.get('[data-cy="create-event-submit"]').should("be.visible").click();
        cy.get("[data-cy^=event-]").should("have.length", 1);
        cy.get("[data-cy^=event-]").click();
        //Test that the Date is mostly correct on Tuesday
        cy.get('[data-cy="date-text"]')
            .should("be.visible")
            .contains("Date: Wed");
        //Test that the time matches with what was inputted
        cy.get('[data-cy="time-text"]')
            .should("be.visible")
            .should("have.text", "Time: 6:30 AM - 7:00 AM");
        //Test that the location matches with what was inputted
        cy.get('[data-cy="location-text"]')
            .should("be.visible")
            .should("have.text", "Location: " + locationName);

        // logout
        cy.reload();
        if (window.innerWidth < 1024) {
            cy.get(ellipsisIconButton).click();
        }
        cy.get(profileNameButton).click();
        cy.wait(1000);
        cy.get(logoutButton).click();
    });

    it("Student cannot register for office hour for paused course", () => {

        // login as student to create office hour
        cy.get(userNameInputText).type("ali-the-student");
        cy.get(passwordInputText).type("ali-the-student");
        cy.get(loginButton).click();
        cy.contains("p", "Data Structures").click();

        cy.get('button[title="Next week"]').should("be.visible").click();


        // student register for office hour
        cy.get("[data-cy^=event-]").first().click({ force: true });
        cy.get('[data-cy="student-register-status"]')
            .should("be.visible")
            .contains("You are not registered for this session");
        cy.get('[data-cy="student-register-button"]')
            .should("be.visible")
            .click();
        cy.get('[data-cy="student-register-text"]').contains(
            "You are about to register for"
        );
        cy.get('[data-cy="oh-topic-dropdown"]').click();
        //Should have only Regular or Debugging options
        //Bug
        cy.get("ul li").should("have.length", 3);
        cy.get('[data-cy="Regular"]').click();
        cy.get('[data-cy="student-time-slots"]').click();
        cy.get("ul>li").eq(3).click();



        // verify that the course is paused
        cy.get('[data-cy="course-is-paused-warning"]').contains("The course is paused")

    });
});

describe("Archive Course", () => {
    const BASE_URL = "http://localhost:3000/proj-hourly";

    const userNameInputText = '[data-cy="username-input-text"]';
    const passwordInputText = '[data-cy="password-input-text"]';
    const loginButton = '[data-cy="login-button"]';

    const navbarButton = '[data-cy="navbar-button"]';
    const navbar = '[data-cy="navbar"]';

    const coursePauseOrArchiveTitle = '[data-cy="coursetype-course-pause-or-archive-title"]';

    const logoutButton = '[data-cy="logout-button"]';
    const ellipsisIconButton = '[data-cy="ellipsis-icon-button"]';
    const profileNameButton = '[data-cy="profile-name-button"]';

    const courseNumber = "601.226";
    const courseCode = "ABCDEF";

    const courseCard = `[data-cy="${courseNumber}"]`;
    const studentCourseList = '[data-cy="student-course-list"]';



    beforeEach(() => {
        // login as instructor, and archive a course
        cy.task("removeOH", courseCode);
        // initialize to set isArchived to false
        cy.task("setIsArchivedFalse", courseCode);
        // initialize to set isPaused to false
        cy.task("setIsPausedFalse", courseCode);

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
        // add student to the course
        cy.task("addStudent", courseCode);
        cy.task("addStaff", courseCode);


        cy.visit(BASE_URL + "/login");

        // login as professor
        cy.get(userNameInputText).type("ali-the-professor");
        cy.get(passwordInputText).type("ali-the-professor");
        cy.get(loginButton).click();
        cy.wait(1000);
        cy.get(courseCard).click();
        cy.wait(1000);
        cy.get(navbarButton).click();
        cy.wait(1000);
        cy.get(navbar).contains("a", "course details").click();
        cy.get("body").click();
        // Archive course
        cy.get(coursePauseOrArchiveTitle).contains(`Pause or Archive Course`);
        cy.get('[data-cy="archive-course-submit"]').click();

        // logout
        cy.wait(1000);
        if (window.innerWidth < 1024) {
            cy.get(ellipsisIconButton).click();
        }
        cy.get(profileNameButton).click();
        cy.wait(1000);
        cy.get(logoutButton).click();

    });

    it("Student can no longer see an archived course", () => {

        // login as student to create office hour
        cy.get(userNameInputText).type("ali-the-student");
        cy.get(passwordInputText).type("ali-the-student");
        cy.get(loginButton).click();
        cy.wait(1000);
        cy.get(studentCourseList)
            .children()
            .should("be.visible")
            .should("have.length", 1)
            .contains(
                "You are not enrolled in any courses in which you are a student."
            );

    });

});
