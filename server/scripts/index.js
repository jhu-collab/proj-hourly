import { Role } from "@prisma/client";
import prisma from "../prisma/client.js";
import { hashPassword } from "../src/util/password.js";

// change the DABASE_URL in .env to point to your production database
const runner = async () => {
  await prisma.Account.create({
    data: {
      userName: "ali-the-student",
      hashedPassword: hashPassword("ali-the-student"),
      email: "ali-the-student@jhu.edu",
      firstName: "Ali",
      lastName: "Student",
      preferredName: "Ali the student",
      role: Role.User,
    },
  });
};

runner();
