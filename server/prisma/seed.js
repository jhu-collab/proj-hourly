import { faker } from "@faker-js/faker";
import { Role } from "@prisma/client";
import prisma from "./client.js";
import { hashPassword } from "../src/util/password.js";
import ical from "ical-generator";

const createDataStructures = async () => {
  const studentAccount = await prisma.Account.create({
    data: {
      userName: "student-account".toLocaleLowerCase(),
      hashedPassword: hashPassword("student-account"),
      email: "student@university.edu".toLowerCase(),
      firstName: "Student",
      lastName: "Student",
      preferredName: "Student",
      role: Role.User,
    },
  });
  const taAccount = await prisma.Account.create({
    data: {
      userName: "ta-account".toLocaleLowerCase(),
      hashedPassword: hashPassword("ta-account"),
      email: "ta@university.edu".toLowerCase(),
      firstName: "TA",
      lastName: "TA",
      preferredName: "TA",
      role: Role.User,
    },
  });
  const professorAccount = await prisma.Account.create({
    data: {
      userName: "professor-account".toLocaleLowerCase(),
      hashedPassword: hashPassword("professor-account"),
      email: "professor@university.edu".toLowerCase(),
      firstName: "Professor",
      lastName: "Professor",
      preferredName: "Professor",
      role: Role.Admin,
    },
  });
  const cal = ical({ name: "Data Structures" });
  const dataStructures = await prisma.Course.create({
    data: {
      title: "Data Structures",
      courseNumber: "601.226",
      semester: "Spring",
      calendarYear: 2025,
      code: "ABCDEF",
      instructors: {
        connect: {
          id: professorAccount.id,
        },
      },
      courseStaff: {
        connect: {
          id: taAccount.id,
        },
      },
      students: {
        connect: {
          id: studentAccount.id,
        },
      },
      iCalJson: cal.toJSON(),
    },
  });
  const topics = [
    "HW1",
    "HW2",
    "HW3",
    "HW4",
    "HW5",
    "HW6",
    "HW7",
    "HW8",
    "General",
    "Exam",
  ];
  for (let topic of topics) {
    await prisma.topic.create({
      data: {
        courseId: dataStructures.id,
        value: topic,
      },
    });
  }
  await prisma.OfficeHourTimeOptions.create({
    data: {
      title: "Regular",
      duration: 10,
      course: {
        connect: {
          id: dataStructures.id,
        },
      },
    },
  });
  await prisma.OfficeHourTimeOptions.create({
    data: {
      title: "Debugging",
      duration: 30,
      course: {
        connect: {
          id: dataStructures.id,
        },
      },
    },
  });
};

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

const defaultUsers = [
  {
    firstName: "Tony",
    lastName: "Stark",
    preferredName: "Iron Man",
    userName: "iron man",
    hashedPassword: hashPassword("iron man"),
    email: "tony.stark@gmail.com",
    role: Role.Admin,
    id: 6,
  },
  {
    firstName: "Thor",
    lastName: "Odinson",
    preferredName: "Thor",
    userName: "thor",
    hashedPassword: hashPassword("thor"),
    email: "thor.odinson@gmail.com",
    role: Role.User,
    id: 7,
  },
  {
    firstName: "Steve",
    lastName: "Rogers",
    preferredName: "Captain America",
    userName: "captain america",
    hashedPassword: hashPassword("captain america"),
    email: "steve.rogers@gmail.com",
    role: Role.User,
    id: 8,
  },
];

const generateManyFakeUsers = async () => {
  let count = 0;
  let users = [];
  while (count < 1000) {
    const firstName = "fake-user" + count;
    const lastName = "fake-user" + count;
    const email = faker.internet.email(firstName, lastName, "jhu.edu");
    const hashedPassword = hashPassword(firstName.toLowerCase());
    users.push({
      userName: firstName.toLocaleLowerCase(),
      hashedPassword: hashedPassword,
      email: email.toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      preferredName: firstName,
      role: Role.User,
    });
    console.log(count);
    count += 1;
  }
  const accs = await prisma.account.createMany({
    data: users,
  });
  console.log("created");
  return accs;
};

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

export const generateFakeData = async () => {
  await prisma.Account.deleteMany();
  // await generateManyFakeUsers();
  // const accs = await prisma.account.findMany();

  // Generate fake users
  for (let index = 0; index < 5; index++) {
    await generateFakeUser(Role.User, `user-${index + 1}`);
  }

  for (let user of defaultUsers) {
    await prisma.Account.create({
      data: {
        userName: user.userName.toLowerCase(),
        hashedPassword: user.hashedPassword,
        email: user.email.toLowerCase(),
        firstName: user.firstName,
        lastName: user.lastName,
        preferredName: user.preferredName,
        role: user.role,
      },
    });
  }

  const cal = ical({ name: "Avengers" });

  const ironMan = await prisma.Account.findUnique({
    where: {
      userName: "iron man",
    },
  });

  const thor = await prisma.Account.findUnique({
    where: {
      userName: "thor",
    },
  });

  const cap = await prisma.Account.findUnique({
    where: {
      userName: "captain america",
    },
  });

  const course = await prisma.Course.create({
    data: {
      title: "Avengers",
      courseNumber: "123.456",
      semester: "Fall",
      calendarYear: 2022,
      code: "AVENGE",
      instructors: {
        connect: {
          id: ironMan.id,
        },
      },
      iCalJson: cal.toJSON(),
    },
  });

  await prisma.account.update({
    where: {
      id: cap.id,
    },
    data: {
      studentCourses: {
        connect: {
          id: course.id,
        },
      },
    },
  });

  await prisma.account.update({
    where: {
      id: thor.id,
    },
    data: {
      staffCourses: {
        connect: {
          id: course.id,
        },
      },
    },
  });

  // accs.forEach(async (acc) => {
  //   await prisma.account.update({
  //     where: {
  //       id: acc.id,
  //     },
  //     data: {
  //       studentCourses: {
  //         connect: {
  //           id: course.id,
  //         },
  //       },
  //     },
  //   });
  // });

  await generateFakeUser(Role.Admin, `admin-1`);
  await createDataStructures();
};

try {
  generateFakeData();
} catch (err) {
  console.log(err);
  process.exit(1);
} finally {
  prisma.$disconnect();
}
