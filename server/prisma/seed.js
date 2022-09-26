import { faker } from "@faker-js/faker";
import { Role } from "@prisma/client";
import prisma from "./client.js";
import { hashPassword } from "../src/util/password.js";

// Simulate rolling a loaded die
// (it is more likly to roll a smaller number!)
export function loadedDie() {
  const r = Math.random();

  // integer in the range 1 to 6 with desired probabilities
  if (r < 2.0 / 64.0) {
    return 6;
  } else if (r < 4.0 / 64.0) {
    return 5;
  } else if (r < 8.0 / 64.0) {
    return 4;
  } else if (r < 16.0 / 64.0) {
    return 3;
  } else if (r < 32.0 / 64.0) {
    return 2;
  } else {
    return 1;
  }
}

const generateFakeUser = async (role, username) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email(firstName, lastName, "jhu.edu");
  // let's use the username for password too!
  const hashedPassword = hashPassword(username);
  const preferredName =
    loadedDie() >= 3 // give preferred name to some users!
      ? faker.name.firstName()
      : loadedDie() >= 3 // some users write their firstName as preferedMame!
      ? firstName
      : null;

  return prisma.Account.create({
    data: {
      userName: username.toLocaleLowerCase(),
      hashedPassword: hashedPassword,
      email: email.toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      preferredName: preferredName,
      role: role,
    },
  });
};

const generateFakeData = async () => {
  await prisma.Account.deleteMany();

  // Generate fake users
  for (let index = 0; index < 5; index++) {
    await generateFakeUser(Role.User, `user-${index + 1}`);
  }
  await generateFakeUser(Role.Admin, `admin-1`);
};

try {
  generateFakeData();
} catch (err) {
  console.log(err);
  process.exit(1);
} finally {
  prisma.$disconnect();
}
