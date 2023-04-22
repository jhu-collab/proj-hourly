import { defineConfig } from "cypress";
import prisma from "../server/prisma/client.js";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        async removeOH() {
          await prisma.officeHour.deleteMany();
          return null;
        },
        async deleteCourse(code) {
          const course = await prisma.course.findUnique({
            where: {
              code: code,
            },
          });
          if (!course) {
            console.log("is null");
            return null;
          }
          const courseId = course.id;
          console.log(courseId);
          await prisma.registration.deleteMany();
          await prisma.topic.deleteMany({
            where: {
              courseId: courseId,
            },
          });
          await prisma.officeHour.deleteMany({
            where: {
              courseId: courseId,
            },
          });
          await prisma.officeHourTimeOptions.deleteMany({
            where: {
              courseId: courseId,
            },
          });
          await prisma.course.delete({
            where: {
              id: courseId,
            },
          });
          return null;
        },
        // async removeAllCourses(userName) {
        //   const user = await prisma.account.findUnique({
        //     where: {
        //       userName: userName,
        //     },
        //   });

        //   user.instructorCourses = null;
        //   user.staffCourses = null;
        //   user.studentCourses = null;

        //   prisma.account.update({
        //     where: {
        //       userName: userName,
        //     },
        //     data: user,
        //   });
        //   return null;
        // },
      });
    },
  },
});
