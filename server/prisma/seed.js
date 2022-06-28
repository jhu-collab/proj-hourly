import { faker } from "@faker-js/faker";
import prisma from "./client.js";

const generateFakeUsers = async (numFakeUsers, role) => {
  for (let index = 0; index < numFakeUsers; index++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName, "fakerjs.dev");
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: `${firstName} ${lastName}`,
        role: role,
      },
    });
  }
};

const generateFakeData = async () => {
  await prisma.user.deleteMany();
  await generateFakeUsers(3);
  await generateFakeUsers(1, "ADMIN");
};

try {
  generateFakeData();
} catch (err) {
  console.log(err);
  process.exit(1);
} finally {
  prisma.$disconnect();
}
