import { checkboxClasses } from "@mui/material";

describe("Roster Page", () => {
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
    const rosterToolbarRoles = '[data-cy="roster-toolbar-roles"]';
    const rosterToolbarStudent = '[data-cy="roster-toolbar-students"]';
    const rosterToolbarStaff = '[data-cy="roster-toolbar-staff"]';
    const rosterToolbarInstructor = '[data-cy="roster-toolbar-instructors"]';
    const rosterStudentRows = '[data-cy="roster-student-rows"]';
    const rosterStaffRows = '[data-cy="roster-staff-rows"]';
    const rosterInstructorRows = '[data-cy="roster-instructor-rows"]';
    const noRosterAlert = '[data-cy="no-roster-alert"]';

    const deleteUserButton = '[data-cy="delete-user-button"]';
    const deleteConfirmButton = '[data-cy="delete-user-confirmation-button"]';
    const closeDeleteConfirmButton = '[data-cy="close-delete-button"]';
    const cancelDeleteConfirmButton = '[data-cy="cancel-delete-button"]';
    const confirmDeleteConfirmButton = '[data-cy="confirm-delete-button"]';

    const roleForm = '[data-cy="role-form"]';
    const changeRoleButton = '[data-cy="change-role-button"]';
    const changeRoleIcon = '[data-cy="change-role-icon"]';
    const studentRoleTitle = '[data-cy="student-role-title"]';
    const staffRoleTitle = '[data-cy="staff-role-title"]';
    const roleChoicesGroup = '[data-cy="role-choices-group"]';
    const toStaffButton = '[data-cy="to-staff-label"]';
    const toStudentButton = '[data-cy="to-staff-label"]';
    const toInstructorButton = '[data-cy="to-staff-label"]';
    const confirmRoleChangeButton = '[data-cy="confirm-role-change-button"]';
    // cancel (x) button?
  
    const courseTitle = "Data Structures";
    const courseNumber = "601.226";
    const courseSemester = "Spring";
    const courseYear = "2023";
    const courseCode = "ABCDEF";
  
    const createCourseSemester = `[data-cy="${courseSemester}"]`;
    const courseCard = `[data-cy="${courseNumber}"]`;

    const accounts = new Map();
    accounts.set("Ali-Student", { firstName: "Ali-Student", lastName: "Student", email: "ali-the-student@jhu.edu"});
    accounts.set("Thor", { firstName: "Thor", lastName: "Odinson", email: "thor.odinson@gmail.com"}); 
    accounts.set("Ali-Professor", { firstName: "Ali-Professor", lastName: "Professor", email: "ali-the-professor@jhu.edu"});  

    beforeEach(() => {
      cy.task("deleteStudentCourses", "ali-the-student");
      cy.task("deleteStaffCourses", "ali-the-student");
      cy.task("deleteInstructorCourse", "ali-the-student");
      cy.task("deleteStudentCourses", "thor");
      cy.task("deleteStudentCourses", "ali-the-professor");
      cy.task("deleteStaffCourses", "ali-the-professor");

      cy.task("addStudent", courseCode);
      cy.task("addStaff", courseCode);
  
      cy.visit(BASE_URL + "login");
  
      cy.get(userNameInputText).type("ali-the-professor");
      cy.get(passwordInputText).type("ali-the-professor");
      cy.get(loginButton).click();

      cy.wait(1000);
  
      cy.get(courseCard).click();
  
      cy.wait(1000);
      const body = cy.get("body")
      cy.wait(1000);
      cy.get(navbarButton).click();
      cy.wait(1000);
      cy.get(navbar).contains("a", "roster").click();
      cy.wait(1000);
      body.click();
      cy.wait(1000);

    });
  
    it("Layout Contains All Required Elements", () => {
      cy.get(navbarButton).should("be.visible").should("be.enabled");
      if (window.innerWidth < 1024) {
        cy.get(ellipsisIconButton).should("be.visible");
      } else {
        cy.get(profileNameButton).should("be.visible");
      }
      cy.get(rosterToolbarRoles).should("be.visible");
      cy.get(rosterToolbarStudent).contains("Students").should("be.visible");
      cy.get(rosterToolbarStaff).contains("Staff").should("be.visible");
      cy.get(rosterToolbarInstructor).contains("Instructors").should("be.visible");  
    });

    it("Student tab looks as expected", () => {
      cy.get(rosterToolbarStudent).contains("Students").click({force: true});
      if(cy.task("currentStudents", "ABCDEF")) {
        cy.get("body").click()
        cy.get('.MuiDataGrid-row').should('have.length', 2);
        cy.get('.MuiDataGrid-row').first().within(($element) => {
          cy.get('.MuiDataGrid-cellCheckbox').should('be.visible');
          cy.get('.MuiDataGrid-cellCheckbox').should('be.visible');
          cy.get('.MuiDataGrid-cellCheckbox').should('be.visible');
          cy.get('.MuiDataGrid-cell--textLeft').should('be.visible').should(($cells) => {
            const firstCellValue = $cells.eq(0).text();
            const secondCellValue = $cells.eq(1).text();
            const thirdCellValue = $cells.eq(2).text();
            expect(firstCellValue).to.equal(accounts.get(firstCellValue).firstName);
            expect(secondCellValue).to.equal(accounts.get(firstCellValue).lastName);
            expect(thirdCellValue).to.equal(accounts.get(firstCellValue).email);
          });  
          cy.get('.MuiDataGrid-actionsCell').first().should('be.visible').within(($cells) => {
            cy.get('.MuiButtonBase-root').should('have.length', 3);
          });      
        });
      } else {
        cy.get(noRosterAlert).contains("Students").should("be.visible");
      }
    });

    it("Promotion/demotion student pop-up has required elements", () => {
      cy.get(rosterToolbarStudent).contains("Students").click({force: true});
      cy.get('.MuiDataGrid-row').first().within(($element) => {
        cy.get('.MuiDataGrid-actionsCell').should('be.visible').within(($cells) => {
          cy.get('.MuiButtonBase-root').eq(1).click();
        });
      });
      cy.get(roleForm).should("be.visible");
      cy.get(confirmRoleChangeButton).should("be.visible");
      cy.get(roleChoicesGroup).should("be.visible").within(($cells) => {
        cy.get(toStaffButton).should("be.visible");
        cy.get(toInstructorButton).should("be.visible");
      });
      cy.get(studentRoleTitle).should("be.visible");
      cy.get('.MuiDataGrid-row').should('have.length', 1);
    });

    it("Successfully promoting student to staff", () => {
      cy.get(rosterToolbarStudent).contains("Students").click({force: true});
      cy.get('.MuiDataGrid-row').first().within(($element) => {
        cy.get('.MuiDataGrid-actionsCell').should('be.visible').within(($cells) => {
          cy.get('.MuiButtonBase-root').eq(1).click();
        });
      });
       cy.get(roleChoicesGroup).within(($cells) => {
        cy.get(toStaffButton).click();
      });
      cy.get(confirmRoleChangeButton).click();
    });

    // it("Successfully cancelling promotion student to staff", () => {
      //  get student
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toStaffButton).click();
      //  cy.get("body").click();
      //  check that student is still student
    // });

    // it("Successfully closing promotion student to staff", () => {
      //  get student
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toStaffButton).click();
      //  CLOSE BUTTON
      //  check that student is still student
    // });

    // it("Successfully promoting student to instructor", () => {
      //  get student
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toInstructorButton).click();
      //  cy.get(confirmRoleChangeButton).click();
      //  check that student is now instructor
    // });

    // it("Successfully cancelling promotion student to instructor", () => {
      //  get student
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toInstructorButton).click();
      //  cy.get("body").click();
      //  check that student is still student
    // });

    // it("Delete student pop-up has required elements", () => {
      //  student page, click top student
      //  cy.get(deleteUserButton).should("be.visible").click();
      //  cy.get(deleteConfirmButton).should("be.visible");
      //  cy.get(closeDeleteConfirmButton).should("be.visible");
      //  cy.get(cancelDeleteConfirmButton).should("be.visible");
      //  cy.get(confirmDeleteConfirmButton).should("be.visible");
    // });

    // it("Successfully deleting student", () => {
      //  get student
      //  cy.get(deleteUserButton).click();
      //  cy.get(confirmDeleteConfirmButton).click();
      //  make sure student is deleted
    // });

    // it("Successfully cancelling deletion of student", () => {
      //  get student
      //  cy.get(deleteUserButton).click();
      //  cy.get(cancelDeleteConfirmButton).click();
      //  make sure student still exists
    // });

    // it("Successfully closing deletion of student", () => {
      //  get student
      //  cy.get(deleteUserButton).click();
      //  cy.get(closeDeleteConfirmButton).click();
      //  make sure student still exists
    // });

    // it("Course token pop-up has required elements", () => {
    // });
  
    // it("Successfully using student course token", () => {
    // });

    // it("Successfully cancelling usage of student course token", () => {
    // });

    // it("Successfully closing student course token form", () => {
    // });
  
    // it("Successfully undoing student course token usage", () => {
    // });

    // it("Successfully cancelling undoing of student course token", () => {
    // });

    // it("Successfully closing student course token form after clicking undo", () => {
    // });

    // it("Staff tab looks as expected", () => {
      // if(cy.task("currentStaff", "ABCDEF")) {
      //   cy.get(rosterToolbarStaff).contains("Staff").click();
      //   check first row that columns, filters, density export
      //   check second row that says checkbox, first name, last name, email
      //   check every other row for checkbox, first name, last name, email of user
      // } else {
      //   cy.get(noRosterAlert).contains("Staff").should("be.visible");
      // }
    // });

    // it("Promotion/demotion staff pop-up has required elements", () => {
      //  cy.get(changeRoleButton).click();
      //  cy.get(roleForm).should("be.visible");
      //  cy.get(roleStack).should("be.visible");
      //  cy.get(confirmRoleChangeButton).should("be.visible");
      //  cy.get(roleChoicesGroup).should("be.visible");
      //  cy.get(staffRoleTitle).should("be.visible");
      //  cy.get(toStudentButton).should("be.visible");
      //  cy.get(toInstructorButton).should("be.visible");
    // });

    // it("Successfully demoting staff to student", () => {
      //  get staff
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toStudentButton).click();
      //  cy.get(confirmRoleChangeButton).click();
      //  check that staff is now student
    // });

    // it("Successfully cancelling demotion staff to student", () => {
      //  get staff
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toStudentButton).click();
      //  cy.get("body").click();
      //  check that staff is still staff
    // });

    // it("Successfully closing demotion staff to student", () => {
      //  get staff
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toStudentButton).click();
      //  CLOSE BUTTON
      //  check that staff is still staff
    // });

    // it("Successfully promoting staff to instructor", () => {
      //  get staff
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toInstructorButton).click();
      //  cy.get(confirmRoleChangeButton).click();
      //  check that staff is now instructor
    // });

    // it("Successfully cancelling promotion staff to instructor", () => {
      //  get staff
      //  cy.get(changeRoleIcon).click();  
      //  cy.get(toInstructorButton).click();
      //  cy.get("body").click();
      //  check that staff is still staff
    // });

    // it("Delete staff pop-up has required elements", () => {
      //  staff page, click top staff
      //  cy.get(deleteUserButton).should("be.visible").click();
      //  cy.get(deleteConfirmButton).should("be.visible");
      //  cy.get(closeDeleteConfirmButton).should("be.visible");
      //  cy.get(cancelDeleteConfirmButton).should("be.visible");
      //  cy.get(confirmDeleteConfirmButton).should("be.visible");
    // });

    // it("Successfully deleting staff", () => {
      //  get staff
      //  cy.get(deleteUserButton).click();
      //  cy.get(confirmDeleteConfirmButton).click();
      //  make sure staff is deleted
    // });

    // it("Successfully cancelling deletion of staff", () => {
      //  get staff
      //  cy.get(deleteUserButton).click();
      //  cy.get(cancelDeleteConfirmButton).click();
      //  make sure staff still exists
    // });

    // it("Successfully closing deletion of staff", () => {
      //  get staff
      //  cy.get(deleteUserButton).click();
      //  cy.get(closeDeleteConfirmButton).click();
      //  make sure staff still exists
    // });

    // it("Instructor tab looks as expected", () => { 
      //  if(cy.task("currentInstructors", "ABCDEF")) {
      //    cy.get(rosterToolbarInstructor).contains("Instructors").click(); 
      //    check first row that columns, filters, density export
      //    check second row that says checkbox, first name, last name, email
      //    check every other row for checkbox, first name, last name, email of user
      //  } else {
      //   cy.get(noRosterAlert).contains("Instructor").should("be.visible");
      // }    
    // });

    // it("Promotion/demotion instructor pop-up has required elements", () => {
      //  instructor page, click top instructor
      //  NOT THERE
    // });
    
    // it("Delete instructor pop-up has required elements", () => {
      //  instructor page, click top instructor
      //  NOT THERE
    // });

  });