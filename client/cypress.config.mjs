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
          generateCalendar(dsCourse.id);

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
            console.log(c);
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
      });
      return config;
    },
  },
});
