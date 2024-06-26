import { defineConfig } from "cypress";
import prisma from "../server/prisma/client.js";
import registerCodeCoverageTasks from "@cypress/code-coverage/task.js";
import { generateCalendar } from "../server/src/util/icalHelpers.js";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      // implement node event listeners here
      on("task", {
        async removeOH(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              officeHours: true,
            },
          });
          if (!course) {
            return null;
          }
          const officeHourIds = [];
          for (const oh of course.officeHours) {
            officeHourIds.push(oh.id);
          }
          await prisma.registration.deleteMany({});
          await prisma.officeHour.deleteMany({
            where: {
              courseId: course.id,
            },
          });
          await prisma.course.update({
            where: {
              code: courseCode,
            },
            data: {
              officeHours: {
                set: [],
              },
              iCalJson: {
                set: [],
              },
            },
          });
          const c = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          return null;
        },
        async addOfficeHoursDS() {
          const dsCourse = await prisma.course.findUnique({
            where: {
              code: "ABCDEF",
            },
          });
          const aliTheTA = await prisma.Account.findUnique({
            where: {
              userName: "ali-the-ta",
            },
          });
          const minTomill = 60000; //1 minute is 60000 milliseconds
          let start = new Date();
          start.setDate(start.getDate() + 1);
          start = new Date(start.getTime() + 60 * minTomill);
          //end is in 60 minutes
          const end = new Date(start.getTime() + 30 * minTomill);
          const ohData = {
            courseId: dsCourse.id,
            startDate: start,
            endDate: end,
            location: "Malone 122",
            isRecurring: false,
            isDeleted: false,
          };
          const oneOH = await prisma.officeHour.create({
            data: ohData,
          });
          await prisma.officeHour.update({
            where: {
              id: oneOH.id,
            },
            data: {
              course: {
                connect: {
                  id: dsCourse.id,
                },
              },
              hosts: {
                connect: { id: aliTheTA.id },
              },
              isOnDayOfWeek: {
                connect: {
                  dayNumber: start.getDay() == 0 ? 7 : start.getDay(),
                },
              },
            },
          });
          generateCalendar(dsCourse.id);

          start = null;

          /*
          let startTwo = new Date();
          startTwo.setDate(startTwo.getDate() + 9);
          startTwo = new Date(startTwo.getTime() + 60 * minTomill);
          //end is in 60 minutes
          const endTwo = new Date(startTwo.getTime() + 60 * minTomill);
          const ohDataTwo = {
            courseId: dsCourse.id,
            startDate: startTwo,
            endDate: endTwo,
            location: "Malone 122",
            isRecurring: false,
            isDeleted: false,
          };
          const twoOH = await prisma.officeHour.create({
            data: ohDataTwo,
          });
          await prisma.officeHour.update({
            where: {
              id: twoOH.id,
            },
            data: {
              course: {
                connect: {
                  id: dsCourse.id,
                },
              },
              hosts: {
                connect: { id: aliTheTA.id },
              },
              isOnDayOfWeek: {
                connect: {
                  dayNumber: startTwo.getDay() % 7,
                },
              },
            },
          });
          generateCalendar(dsCourse.id);*/

          return null;
        },
        async deleteStudentCourses(userName) {
          await prisma.account.update({
            where: {
              userName: userName,
            },
            data: {
              studentCourses: {
                set: [],
              },
            },
          });
          return null;
        },
        async deleteStaffCourses(userName) {
          await prisma.account.update({
            where: {
              userName: userName,
            },
            data: {
              staffCourses: {
                set: [],
              },
            },
          });
          return null;
        },
        async deleteInstructorCourse(userName) {
          await prisma.account.update({
            where: {
              userName: userName,
            },
            data: {
              instructorCourses: {
                set: [],
              },
            },
          });
          return null;
        },
        async deleteInstructorCourses(userName) {
          const user = await prisma.account.findUnique({
            where: {
              userName: userName,
            },
            include: {
              instructorCourses: true,
            },
          });
          if (!user) {
            return null;
          }
          for (const c of user.instructorCourses) {
            await prisma.calendarEvent.deleteMany({
              where: { courseId: c.id },
            });
            const tokens = await prisma.courseToken.findMany({
              where: {
                courseId: c.id,
              },
            });
            const tokenIds = tokens.map((token) => token.id);
            const issueTokens = await prisma.issueToken.findMany({
              where: {
                courseTokenId: {
                  in: tokenIds,
                },
              },
            });
            const issueTokenIds = issueTokens.map((issue) => issue.id);
            await prisma.usedToken.deleteMany({
              where: {
                issueTokenId: {
                  in: issueTokenIds,
                },
              },
            });
            await prisma.issueToken.deleteMany({
              where: {
                courseTokenId: {
                  in: tokenIds,
                },
              },
            });
            await prisma.courseToken.deleteMany({
              where: {
                id: {
                  in: tokenIds,
                },
              },
            });
            await prisma.officeHourTimeOptions.deleteMany({
              where: { courseId: c.id },
            });
            await prisma.officeHour.deleteMany({
              where: { courseId: c.id },
            });
            await prisma.topic.deleteMany({
              where: { courseId: c.id },
            });
            await prisma.course.delete({ where: { id: c.id } });
          }
          await prisma.account.update({
            where: {
              userName: userName,
            },
            data: {
              instructorCourses: {
                set: [],
              },
            },
          });
          return null;
        },
        async optOutCourseToken(courseTitle) {
          const course = await prisma.course.findFirst({
            where: {
              title: courseTitle,
            },
          });
          if (!course) {
            return null;
          } else {
            await prisma.course.updateMany({
              where: {
                title: courseTitle,
              },
              data: {
                usesTokens: false,
              },
            });
            return null;
          }
        },
        async optInIfNeeded(courseCode) {
          const course = await prisma.course.findFirst({
            where: {
              code: courseCode,
            },
          });
          if (!course) {
            return null;
          } else {
            await prisma.course.updateMany({
              where: {
                code: courseCode,
              },
              data: {
                usesTokens: true,
              },
            });
            return null;
          }
        },

        async getCourseByCode(code) {
          const course = await prisma.course.findUnique({
            where: {
              code: code,
            },
          });
          return course;
        },
        async getCourseByNumber(number) {
          const course = await prisma.course.findFirst({
            where: {
              courseNumber: number,
            },
          });
          return course;
        },
        async addStudent(courseCode) {
          const aliTheStudent = await prisma.account.update({
            where: {
              userName: "ali-the-student".toLocaleLowerCase(),
            },
            data: {
              studentCourses: {
                connect: {
                  code: courseCode,
                },
              },
            },
          });
          const thor = await prisma.account.update({
            where: {
              userName: "thor".toLocaleLowerCase(),
            },
            data: {
              studentCourses: {
                connect: {
                  code: courseCode,
                },
              },
            },
          });
          return null;
        },
        async addStaff(courseCode) {
          const aliTheTA = await prisma.account.update({
            where: {
              userName: "ali-the-ta".toLocaleLowerCase(),
            },
            data: {
              staffCourses: {
                connect: {
                  code: courseCode,
                },
              },
            },
          });
          return null;
        },
        async removeStudent(courseCode) {
          const aliTheStudent = await prisma.account.update({
            where: {
              userName: "ali-the-student".toLocaleLowerCase(),
            },
            data: {
              studentCourses: {
                disconnect: {
                  code: courseCode,
                },
              },
            },
          });
          return null;
        },
        async removeStaff(courseCode) {
          const aliTheTA = await prisma.account.update({
            where: {
              userName: "ali-the-ta".toLocaleLowerCase(),
            },
            data: {
              staffCourses: {
                disconnect: {
                  code: courseCode,
                },
              },
            },
          });
          return null;
        },
        async currentStudents(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              students: true,
            },
          });
          return course.students != null;
        },
        async currentStaff(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              courseStaff: true,
            },
          });
          return course.courseStaff != null;
        },
        async currentInstructors(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              instructors: true,
            },
          });
          return course.instructors != null;
        },
        async addCourseTokens(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              students: true,
            },
          });
          const token = await prisma.courseToken.create({
            data: {
              title: "tokenTitle",
              tokenLimit: 2,
              course: {
                connect: {
                  id: course.id,
                },
              },
            },
          });
          const array = [];
          course.students.forEach((student) => {
            array.push({
              accountId: student.id,
              courseTokenId: token.id,
            });
          });
          await prisma.issueToken.createMany({
            data: array,
          });
          return null;
        },
        async deleteCourseTokens(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          const issueTokens = await prisma.issueToken.findMany({
            where: {
              CourseToken: {
                courseId: course.id,
              },
            },
          });
          const issueTokenIds = issueTokens.map((issue) => issue.id);
          await prisma.usedToken.deleteMany({
            where: {
              issueTokenId: {
                in: issueTokenIds,
              },
            },
          });
          await prisma.issueToken.deleteMany({
            where: {
              CourseToken: {
                courseId: course.id,
              },
            },
          });
          await prisma.courseToken.deleteMany({
            where: {
              courseId: course.id,
            },
          });
          return null;
        },
        async getTokenCount({ accountValue, courseCode }) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          const student = await prisma.account.findFirst({
            where: {
              firstName: accountValue,
            },
          });
          const courseToken = await prisma.courseToken.findFirst({
            where: {
              courseId: course.id,
            },
          });
          const issueToken = await prisma.issueToken.findFirst({
            where: {
              accountId: student.id,
              courseTokenId: courseToken.id,
            },
            include: {
              usedTokens: true,
            },
          });
          const usedTokensNotUndone = issueToken.usedTokens.filter(
            (used) => used.unDoneById == null
          );
          const numTokenLimit = courseToken.tokenLimit;
          const datesUsedLength = usedTokensNotUndone.length;
          const remainingTokens = numTokenLimit - datesUsedLength;
          return remainingTokens;
        },
        async enableCourseTokens(username) {
          const account = await prisma.account.findUnique({
            where: {
              userName: username,
            },
            include: {
              instructorCourses: true,
            },
          });
          const course = await prisma.course.update({
            where: {
              id: account.instructorCourses[0].id,
            },
            data: {
              usesTokens: true,
            },
          });
          return course;
        },
        async createCourseToken({ courseCode, tokenQuantity, tokenTitle }) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              students: true,
            },
          });
          const token = await prisma.courseToken.create({
            data: {
              title: tokenTitle,
              tokenLimit: tokenQuantity,
              course: {
                connect: {
                  id: course.id,
                },
              },
            },
          });
          const array = [];
          course.students.forEach((student) => {
            array.push({
              accountId: student.id,
              courseTokenId: token.id,
            });
          });
          await prisma.issueToken.createMany({
            data: array,
          });
          return token;
        },
        async deleteAllTokens(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              students: true,
            },
          });
          const issueTokens = await prisma.issueToken.findMany({
            where: {
              CourseToken: {
                courseId: course.id,
              },
            },
          });
          const issueTokenIds = issueTokens.map((issue) => issue.id);
          await prisma.usedToken.deleteMany({
            where: {
              issueTokenId: {
                in: issueTokenIds,
              },
            },
          });
          await prisma.issueToken.deleteMany({
            where: {
              CourseToken: {
                courseId: course.id,
              },
            },
          });
          const token = await prisma.courseToken.deleteMany({
            where: {
              courseId: course.id,
            },
          });

          return null;
        },
        async useStudentsToken({ userName, tokenName, courseCode }) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
            include: {
              instructors: true,
            },
          });
          const acc = await prisma.account.findUnique({
            where: {
              userName,
            },
          });
          const token = await prisma.courseToken.findFirst({
            where: {
              title: tokenName,
              courseId: course.id,
            },
          });
          let issueToken = await prisma.issueToken.updateMany({
            where: {
              courseTokenId: token.id,
              accountId: acc.id,
            },
            data: {
              datesUsed: {
                push: new Date(),
              },
            },
          });
          issueToken = await prisma.issueToken.findMany({
            where: {
              courseTokenId: token.id,
              accountId: acc.id,
            },
          });
          const usedToken = await prisma.usedToken.create({
            data: {
              issueTokenId: issueToken[0].id,
              appliedById: course.instructors[0].id,
              reason: "Instructor Applying Token Test",
            },
          });
          return null;
        },
        // added update course registration constraint
        async updateRegConstraint(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          if (!course) {
            return null;
          } else {
            await prisma.course.updateMany({
              where: {
                code: courseCode,
              },
              data: {
                startRegConstraint: 1000,
              },
            });
            return null;
          }
          return null;
        },

        // setIsArchivedFalse
        async setIsArchivedFalse(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          if (!course) {
            return null;
          } else {
            await prisma.course.updateMany({
              where: {
                code: courseCode,
              },
              data: {
                isArchived: false,
              },
            });
            return null;
          }
          return null;
        },
        // setIsPausedFalse
        async setIsPausedFalse(courseCode) {
          const course = await prisma.course.findUnique({
            where: {
              code: courseCode,
            },
          });
          if (!course) {
            return null;
          } else {
            await prisma.course.updateMany({
              where: {
                code: courseCode,
              },
              data: {
                isPaused: false,
              },
            });
            return null;
          }
          return null;
        },
      });
      return config;
    },
    experimentalRunAllSpecs: true,
  },
});
