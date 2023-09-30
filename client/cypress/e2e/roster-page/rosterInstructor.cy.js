describe("Roster Page", () => {
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

    cy.get(userNameInputText).type("ali-the-professor");
    cy.get(passwordInputText).type("ali-the-professor");
    cy.get(loginButton).click();

    cy.wait(1000);

    cy.get(courseCard).click();

    cy.wait(1000);
    const body = cy.get("body");
    cy.wait(1000);
    cy.get(navbarButton).click();
    cy.wait(1000);
    cy.get(navbar).contains("a", "roster").click();
    cy.wait(1000);
    body.click();
    cy.wait(1000);
  });

  // describe("Roster Layout", () => {
  //   it("Layout Contains All Required Elements", () => {
  //     cy.get(navbarButton).should("be.visible").should("be.enabled");
  //     if (window.innerWidth < 1024) {
  //       cy.get(ellipsisIconButton).should("be.visible");
  //     } else {
  //       cy.get(profileNameButton).should("be.visible");
  //     }
  //     cy.get(rosterToolbarRoles).should("be.visible");
  //     cy.get(rosterToolbarStudent).contains("Students").should("be.visible");
  //     cy.get(rosterToolbarStaff).contains("Staff").should("be.visible");
  //     cy.get(rosterToolbarInstructor)
  //       .contains("Instructors")
  //       .should("be.visible");
  //   });
  // });

  describe("Student Tab", () => {
    // it("Student tab looks as expected", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get("body").click();
    //     cy.get(".MuiDataGrid-row").should("have.length", 2);
    //     cy.get(".MuiDataGrid-row")
    //       .first()
    //       .within(($element) => {
    //         cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
    //         cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
    //         cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
    //         cy.get(".MuiDataGrid-cell--textLeft")
    //           .should("be.visible")
    //           .should(($cells) => {
    //             const firstCellValue = $cells.eq(0).text();
    //             const secondCellValue = $cells.eq(1).text();
    //             const thirdCellValue = $cells.eq(2).text();
    //             expect(firstCellValue).to.equal(
    //               accounts.get(firstCellValue).firstName
    //             );
    //             expect(secondCellValue).to.equal(
    //               accounts.get(firstCellValue).lastName
    //             );
    //             expect(thirdCellValue).to.equal(
    //               accounts.get(firstCellValue).email
    //             );
    //           });
    //         cy.get(".MuiDataGrid-actionsCell")
    //           .first()
    //           .should("be.visible")
    //           .within(($cells) => {
    //             cy.get(".MuiButtonBase-root").should("have.length", 3);
    //           });
    //       });
    //   } else {
    //     cy.get(noRosterAlert).contains("Students").should("be.visible");
    //   }
    // });

    // it("Promotion/demotion student pop-up has required elements", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         .should("be.visible")
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(1).click();
    //         });
    //     });
    //   cy.get(roleForm).should("be.visible");
    //   cy.get(confirmRoleChangeButton).should("be.visible");
    //   cy.get(roleChoicesGroup)
    //     .should("be.visible")
    //     .within(($cells) => {
    //       cy.get(toStaffButton).should("be.visible");
    //       cy.get(toInstructorButton).should("be.visible");
    //     });
    //   cy.get(studentRoleTitle).should("be.visible");
    //   cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
    //   .first()
    //   .within(($element) => {
    //     cy.get(".MuiBox-root").within(($element) => {
    //       cy.get(".MuiButtonBase-root").should("exist");
    //     });
    //   });
    // });

    // it("Successfully promoting student to staff", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(1).click();
    //         });
    //     });
    //   cy.get(roleChoicesGroup).within(($cells) => {
    //     cy.get(toStaffButton).click();
    //   });
    //   cy.get(confirmRoleChangeButton).click();
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 1);
    //   }
    //   cy.get(rosterToolbarStaff).contains("Staff").click();
    //   if (cy.task("currentStaff", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   }
    // });

    // it("Successfully closing promotion student to staff", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(1).click();
    //         });
    //     });
    //   cy.get(roleChoicesGroup).within(($cells) => {
    //     cy.get(toStaffButton).click();
    //   });
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper").within(
    //     ($element) => {
    //       cy.get(".MuiBox-root").within(($element) => {
    //         cy.get(".MuiButtonBase-root").click();
    //       });
    //     }
    //   );
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   }
    //   cy.get(rosterToolbarStaff).contains("Staff").click();
    //   if (cy.task("currentStaff", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 1);
    //   }
    // });

    // it("Successfully promoting student to instructor", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(1).click();
    //         });
    //     });
    //   cy.get(roleChoicesGroup).within(($cells) => {
    //     cy.get(toInstructorButton).click();
    //   });
    //   cy.get(confirmRoleChangeButton).click();
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 1);
    //   }
    //   cy.get(rosterToolbarInstructor).contains("Instructor").click();
    //   if (cy.task("currentInstructors", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   }
    // });

    // it("Successfully closing promotion student to instructor", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(1).click();
    //         });
    //     });
    //   cy.get(roleChoicesGroup).within(($cells) => {
    //     cy.get(toInstructorButton).click();
    //   });
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper").within(
    //     ($element) => {
    //       cy.get(".MuiBox-root").within(($element) => {
    //         cy.get(".MuiButtonBase-root").click();
    //       });
    //     }
    //   );
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   }
    //   cy.get(rosterToolbarInstructor).contains("Instructor").click();
    //   if (cy.task("currentInstructors", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 1);
    //   }
    // });

    // it("Delete student pop-up has required elements", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         .should("be.visible")
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(2).click();
    //         });
    //     });
    //   cy.contains("Confirm the action").should("exist");
    //   cy.contains("Do you want to delete this user").should("exist");
    //   cy.get(cancelDeleteConfirmButton).should("be.visible");
    //   cy.get(confirmDeleteConfirmButton).should("be.visible");
    //   cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiBox-root").within(($element) => {
    //         cy.get(closeDeleteConfirmButton).should("exist");
    //       });
    //     });
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
    //   .first()
    //   .within(($element) => {
    //     cy.get(".MuiBox-root").within(($element) => {
    //       cy.get(".MuiButtonBase-root").should("exist");
    //     });
    //   });
    // });

    // it("Successfully deleting student", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(2).click();
    //         });
    //     });
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDialogActions-root").within(($element) => {
    //         cy.get(".MuiButtonBase-root").eq(1).click({ force: true });
    //       });
    //     });
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 1);
    //   }
    // });

    // it("Successfully cancelling deletion of student", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(2).click();
    //         });
    //     });
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDialogActions-root").within(($element) => {
    //         cy.get(".MuiButtonBase-root").eq(0).click({ force: true });
    //       });
    //     });
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   }
    // });

    // it("Successfully closing deletion of student", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(2).click();
    //         });
    //     });
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiBox-root").within(($element) => {
    //         cy.get(".MuiButtonBase-root").click({ force: true });
    //       });
    //     });
    //   if (cy.task("currentStudents", "ABCDEF")) {
    //     cy.get(".MuiDataGrid-row").should("have.length", 2);
    //   }
    // });

    // it("Course token pop-up has required elements", () => {
    //   cy.get(rosterToolbarStudent).contains("Students").click();
    //   cy.get(".MuiDataGrid-row")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiDataGrid-actionsCell")
    //         .should("be.visible")
    //         .within(($cells) => {
    //           cy.get(".MuiButtonBase-root").eq(0).click();
    //         });
    //     });
    //   cy.contains("Use Course Token").should("exist");
    //   cy.get(tokenSubtitle).should("be.visible");
    //   cy.get(tokenDropdown).should("be.visible").click();
    //   cy.get(tokenNone).should("be.visible");
    //   cy.get(tokenTokenTitle).should("be.visible").click();
    //   cy.get(tokenUndo).should("be.visible").click();
    //   cy.get(tokenUndoDate).should("be.visible").click();
    //   cy.get("body").click();
    //   cy.get(tokenSubmit).should("be.visible");
    //   cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
    //     .first()
    //     .within(($element) => {
    //       cy.get(".MuiBox-root").within(($element) => {
    //         cy.get(".MuiButtonBase-root").should("exist");
    //       });
    //     });
    // });

    it("Successfully using student course token", () => {
      cy.get(rosterToolbarStudent).contains("Students").click();
      cy.get(".MuiDataGrid-row")
        .first()
        .within(($element) => {
          cy.get(".MuiDataGrid-actionsCell").within(($cells) => {
            cy.get(".MuiButtonBase-root").eq(0).click();
          });
        });
      cy.get(tokenDropdown).click();
      cy.get(tokenTokenTitle).click();
      cy.get(tokenSubmit).click();
      cy.get(".MuiDataGrid-row")
        .first()
        .find(".MuiDataGrid-cell--textLeft")
        .first()
        .invoke("text")
        .as("firstCellValue")
        .then((firstCellValue) => {
          cy.log(firstCellValue);
          cy.log(courseCode);
          cy.task("getTokenCount", {
            firstName: firstCellValue,
            courseCode: courseCode,
          }).then((tokenCount) => {
            expect(tokenCount).to.equal(1);
          });
        });
    });

    it("Successfully closing student course token form", () => {
      cy.get(rosterToolbarStudent).contains("Students").click();
      cy.get(".MuiDataGrid-row")
        .first()
        .within(($element) => {
          cy.get(".MuiDataGrid-actionsCell").within(($cells) => {
            cy.get(".MuiButtonBase-root").eq(0).click();
          });
        });
      cy.get(tokenDropdown).click();
      cy.get(tokenTokenTitle).click();
      cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
        .first()
        .within(($element) => {
          cy.get(".MuiBox-root").within(($element) => {
            cy.get(".MuiButtonBase-root").click();
          });
        });
      cy.get(".MuiDataGrid-row")
        .first()
        .find(".MuiDataGrid-cell--textLeft")
        .first()
        .invoke("text")
        .as("firstCellValue")
        .then((firstCellValue) => {
          cy.log(firstCellValue);
          cy.log(courseCode);
          cy.task("getTokenCount", {
            firstName: firstCellValue,
            courseCode: courseCode,
          }).then((tokenCount) => {
            expect(tokenCount).to.equal(1);
          });
        });
    });

    it("Successfully undoing student course token usage", () => {
      cy.get(rosterToolbarStudent).contains("Students").click();
      cy.get(".MuiDataGrid-row")
      .first()
      .within(($element) => {
        cy.get(".MuiDataGrid-actionsCell").within(($cells) => {
          cy.get(".MuiButtonBase-root").eq(0).click();
        });
      });
      cy.get(tokenDropdown).click();
      cy.get(tokenTokenTitle).click();
      cy.get(tokenSubmit).click();
      const currentDate = Cypress.moment().format('YYYY-MM-DD');
      cy.get(".MuiDataGrid-row")
        .first()
        .within(($element) => {
          cy.get(".MuiDataGrid-actionsCell").within(($cells) => {
            cy.get(".MuiButtonBase-root").eq(0).click();
          });
        });
      cy.get(tokenDropdown).click();
      cy.get(tokenTokenTitle).click();
      cy.get(tokenUndo).click();
      cy.get(tokenUndoDate).click();
      cy.log(currentDate)
      cy.get('[data-cy="${currentDate}"]').click();
      cy.get(tokenSubmit).click();
      cy.get(".MuiDataGrid-row")
        .first()
        .find(".MuiDataGrid-cell--textLeft")
        .first()
        .invoke("text")
        .as("firstCellValue")
        .then((firstCellValue) => {
          cy.log(firstCellValue);
          cy.log(courseCode);
          cy.task("getTokenCount", {
            firstName: firstCellValue,
            courseCode: courseCode,
          }).then((tokenCount) => {
            expect(tokenCount).to.equal(1);
          });
        });

    });

    it("Successfully closing student course token form after clicking undo", () => {
      cy.get(rosterToolbarStudent).contains("Students").click();
      cy.get(".MuiDataGrid-row")
      .first()
      .within(($element) => {
        cy.get(".MuiDataGrid-actionsCell").within(($cells) => {
          cy.get(".MuiButtonBase-root").eq(0).click();
        });
      });
      cy.get(tokenDropdown).click();
      cy.get(tokenTokenTitle).click();
      cy.get(tokenSubmit).click();
      cy.get(".MuiDataGrid-row")
        .first()
        .within(($element) => {
          cy.get(".MuiDataGrid-actionsCell").within(($cells) => {
            cy.get(".MuiButtonBase-root").eq(0).click();
          });
        });
      cy.get(tokenDropdown).click();
      cy.get(tokenTokenTitle).click();
      cy.get(tokenUndo).click();
      cy.get(tokenUndoDate).click();
      cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
        .first()
        .within(($element) => {
          cy.get(".MuiBox-root").within(($element) => {
            cy.get(".MuiButtonBase-root").click();
          });
        });      
      cy.get(".MuiDataGrid-row")
        .first()
        .find(".MuiDataGrid-cell--textLeft")
        .first()
        .invoke("text")
        .as("firstCellValue")
        .then((firstCellValue) => {
          cy.log(firstCellValue);
          cy.log(courseCode);
          cy.task("getTokenCount", {
            firstName: firstCellValue,
            courseCode: courseCode,
          }).then((tokenCount) => {
            expect(tokenCount).to.equal(1);
          });
        });

    });
  });

  // describe("Staff Tab", () => {
  //   it("Staff tab looks as expected", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get("body").click();
  //       cy.get(".MuiDataGrid-row").should("have.length", 1);
  //       cy.get(".MuiDataGrid-row")
  //         .first()
  //         .within(($element) => {
  //           cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
  //           cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
  //           cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
  //           cy.get(".MuiDataGrid-cell--textLeft")
  //             .should("be.visible")
  //             .should(($cells) => {
  //               const firstCellValue = $cells.eq(0).text();
  //               const secondCellValue = $cells.eq(1).text();
  //               const thirdCellValue = $cells.eq(2).text();
  //               expect(firstCellValue).to.equal(
  //                 accounts.get(firstCellValue).firstName
  //               );
  //               expect(secondCellValue).to.equal(
  //                 accounts.get(firstCellValue).lastName
  //               );
  //               expect(thirdCellValue).to.equal(
  //                 accounts.get(firstCellValue).email
  //               );
  //             });
  //           cy.get(".MuiDataGrid-actionsCell")
  //             .first()
  //             .should("be.visible")
  //             .within(($cells) => {
  //               cy.get(".MuiButtonBase-root").should("have.length", 3);
  //             });
  //         });
  //     } else {
  //       cy.get(noRosterAlert).contains("Staff").should("be.visible");
  //     }
  //   });

  //   it("Promotion/demotion staff pop-up has required elements", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           .should("be.visible")
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(1).click();
  //           });
  //       });
  //     cy.get(roleForm).should("be.visible");
  //     cy.get(confirmRoleChangeButton).should("be.visible");
  //     cy.get(roleChoicesGroup)
  //       .should("be.visible")
  //       .within(($cells) => {
  //         cy.get(toStudentButton).should("be.visible");
  //         cy.get(toInstructorButton).should("be.visible");
  //       });
  //     cy.get(staffRoleTitle).should("be.visible");
  //     cy.get(".MuiDataGrid-row").should("have.length", 1);
  //     cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
  //     .first()
  //     .within(($element) => {
  //       cy.get(".MuiBox-root").within(($element) => {
  //         cy.get(".MuiButtonBase-root").should("exist");
  //       });
  //     });
  //   });

  //   it("Successfully demoting staff to student", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(1).click();
  //           });
  //       });
  //     cy.get(roleChoicesGroup).within(($cells) => {
  //       cy.get(toStudentButton).click();
  //     });
  //     cy.get(confirmRoleChangeButton).click();
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 0);
  //     }
  //     cy.get(rosterToolbarStudent).contains("Student").click();
  //     if (cy.task("currentStudents", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 3);
  //     }
  //   });

  //   it("Successfully closing demotion staff to student", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(1).click();
  //           });
  //       });
  //     cy.get(roleChoicesGroup).within(($cells) => {
  //       cy.get(toStudentButton).click();
  //     });
  //     cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper").within(
  //       ($element) => {
  //         cy.get(".MuiBox-root").within(($element) => {
  //           cy.get(".MuiButtonBase-root").click();
  //         });
  //       }
  //     );
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 1);
  //     }
  //     cy.get(rosterToolbarStudent).contains("Student").click();
  //     if (cy.task("currentStudents", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 2);
  //     }
  //   });

  //   it("Successfully promoting staff to instructor", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(1).click();
  //           });
  //       });
  //     cy.get(roleChoicesGroup).within(($cells) => {
  //       cy.get(toInstructorButton).click();
  //     });
  //     cy.get(confirmRoleChangeButton).click();
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 0);
  //     }
  //     cy.get(rosterToolbarInstructor).contains("Instructor").click();
  //     if (cy.task("currentInstructors", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 2);
  //     }
  //   });

  //   it("Successfully closing promotion staff to instructor", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(1).click();
  //           });
  //       });
  //     cy.get(roleChoicesGroup).within(($cells) => {
  //       cy.get(toInstructorButton).click();
  //     });
  //     cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper").within(
  //       ($element) => {
  //         cy.get(".MuiBox-root").within(($element) => {
  //           cy.get(".MuiButtonBase-root").click();
  //         });
  //       }
  //     );
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 1);
  //     }
  //     cy.get(rosterToolbarInstructor).contains("Instructor").click();
  //     if (cy.task("currentInstructors", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 1);
  //     }
  //   });

  //   it("Successfully deleting staff", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(2).click();
  //           });
  //       });
  //     cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDialogActions-root").within(($element) => {
  //           cy.get(".MuiButtonBase-root").eq(1).click();
  //         });
  //       });
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 0);
  //     }
  //   });

  //   it("Successfully cancelling deletion of staff", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(2).click();
  //           });
  //       });
  //     cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDialogActions-root").within(($element) => {
  //           cy.get(".MuiButtonBase-root").eq(0).click();
  //         });
  //       });
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 1);
  //     }
  //   });

  //   it("Successfully closing deletion of staff", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root").eq(2).click();
  //           });
  //       });
  //     cy.get(".css-17oqyao-MuiPaper-root-MuiDialog-paper")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiBox-root").within(($element) => {
  //           cy.get(".MuiButtonBase-root").click();
  //         });
  //       });
  //     if (cy.task("currentStaff", "ABCDEF")) {
  //       cy.get(".MuiDataGrid-row").should("have.length", 1);
  //     }
  //   });

  //   it("Failure to click token icon for staff", () => {
  //     cy.get(rosterToolbarStaff).contains("Staff").click();
  //     cy.get(".MuiDataGrid-row")
  //       .first()
  //       .within(($element) => {
  //         cy.get(".MuiDataGrid-actionsCell")
  //           
  //           .within(($cells) => {
  //             cy.get(".MuiButtonBase-root")
  //               .eq(0)
  //               
  //               .should("have.attr", "disabled");
  //           });
  //       });
  //   });
  // });

  // describe("Instructor Tab", () => {
  //   it("Instructor tab looks as expected", () => {
  //     cy.get(rosterToolbarInstructor).contains("Instructor").click();
  //     if (cy.task("currentInstructors", "ABCDEF")) {
  //       cy.get("body").click();
  //       cy.get(".MuiDataGrid-row").should("have.length", 1);
  //       cy.get(".MuiDataGrid-row")
  //         .first()
  //         .within(($element) => {
  //           cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
  //           cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
  //           cy.get(".MuiDataGrid-cellCheckbox").should("be.visible");
  //           cy.get(".MuiDataGrid-cell--textLeft")
  //             .should("be.visible")
  //             .should(($cells) => {
  //               const firstCellValue = $cells.eq(0).text();
  //               const secondCellValue = $cells.eq(1).text();
  //               const thirdCellValue = $cells.eq(2).text();
  //               expect(firstCellValue).to.equal(
  //                 accounts.get(firstCellValue).firstName
  //               );
  //               expect(secondCellValue).to.equal(
  //                 accounts.get(firstCellValue).lastName
  //               );
  //               expect(thirdCellValue).to.equal(
  //                 accounts.get(firstCellValue).email
  //               );
  //             });
  //           cy.get(".MuiDataGrid-actionsCell").should("not.exist");
  //         });
  //     } else {
  //       cy.get(noRosterAlert).contains("Instructor").should("be.visible");
  //     }
  //   });
  // });
});
