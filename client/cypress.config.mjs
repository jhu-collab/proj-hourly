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
      });
    },
  },
});
