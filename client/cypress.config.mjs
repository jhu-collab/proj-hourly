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
                  dayNumber: start.getDay() % 7,
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
            await prisma.courseToken.deleteMany({ where: { courseId: c.id } });
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
          });
          const numTokenLimit = courseToken.tokenLimit;
          const datesUsedLength = issueToken.datesUsed.length;
          const remainingTokens = numTokenLimit - datesUsedLength;
          return remainingTokens;
        },
      });
      return config;
    },
    experimentalRunAllSpecs: true,
  },
});
