import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import validate from "../util/checkValidation.js";
import ical from "ical-generator";
import { generateCalendar } from "../util/icalHelpers.js";
import sendEmail from "../util/notificationUtil.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

function makeCourseCode() {
  let result = "";
  const alphabetLen = alphabet.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 6; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabetLen));
  }
  return result;
}

export const create = async (req, res) => {
  debug("create is called!");
  if (validate(req, res)) {
    return res;
  }
  let code = "";
  let codeIsUnique = false;
  debug("Generated a course code...");
  while (!codeIsUnique) {
    code = makeCourseCode();
    // eslint-disable-next-line no-await-in-loop
    const matchingCourse = await prisma.Course.findFirst({
      where: {
        code,
      },
    });
    if (matchingCourse === null) {
      codeIsUnique = true;
    }
  }
  debug("Course code generated...");
  const { title, number, semester, year } = req.body;
  const id = req.id;
  const cal = ical({ name: title });
  debug("Creating course...");
  await prisma.Course.create({
    data: {
      title,
      courseNumber: number,
      semester,
      calendarYear: year,
      code,
      instructors: {
        connect: {
          id,
        },
      },
      iCalJson: cal.toJSON(),
    },
  });
  debug("Course created...");
  debug("Getting course...");
  const course = await prisma.Course.findUnique({
    where: {
      code,
    },
  });
  debug("Getting account...");
  const account = await prisma.account.findUnique({
    where: {
      id,
    },
  });
  debug("Creating default time option...");
  await prisma.OfficeHourTimeOptions.create({
    data: {
      title: "Default",
      duration: 10,
      course: {
        connect: {
          id: course.id,
        },
      },
    },
  });
  debug("Default time option created...");
  const donotreply = "--- Do not reply to this email ---";
  const text =
    donotreply +
    "\n\n" +
    "Dear " +
    account.firstName +
    " " +
    account.lastName +
    "," +
    "\n\n" +
    "Your course " +
    title +
    " was created. Give this code, " +
    code +
    ", to your students to join the course with.\n\n" +
    "Sincerely,\n" +
    "Hourly Team" +
    "\n\n" +
    donotreply;
  debug("Sending notification email...");
  await sendEmail({
    email: account.email,
    subject: title + " Created!",
    text,
  });
  debug("Create is done!");
  return res.status(StatusCodes.CREATED).json({ course });
};

export const register = async (req, res) => {
  debug("Register is called!");
  if (validate(req, res)) {
    return res;
  }
  const { code } = req.body;
  const id = req.id;
  debug("Looking up course...");
  const course = await prisma.Course.findUnique({
    where: {
      code: code.toUpperCase(),
    },
    include: {
      instructors: true,
      CourseToken: true,
    },
  });
  debug("Updating account...");
  const updateAccount = await prisma.account.update({
    where: {
      id,
    },
    data: {
      studentCourses: {
        connect: {
          id: course.id,
        },
      },
    },
  });
  debug("Creating issue tokens...");
  const issueTokens = [];
  course.CourseToken.forEach((token) => {
    issueTokens.push({
      accountId: id,
      courseTokenId: token.id,
    });
  });
  await prisma.issueToken.createMany({
    data: issueTokens,
  });
  let instructors = "";
  let counter = 0;

  course.instructors.forEach((instructor) => {
    instructors += instructor.firstName + " " + instructor.lastName;
    if (course.instructors.length === 1) {
      return;
    } else if (counter !== course.instructors.length - 1) {
      instructors += ", ";
    }
    counter += 1;
  });

  const userEmail = updateAccount.email;
  const subject =
    "Successfully registered for " +
    course.title +
    " in " +
    course.semester +
    " " +
    course.calendarYear +
    "!";
  const donotreply = "--- Do not reply to this email ---";
  const emailBody =
    donotreply +
    "\n\n" +
    "Dear " +
    updateAccount.firstName +
    " " +
    updateAccount.lastName +
    ",\n\n" +
    "You have successfully  registered for " +
    course.courseNumber +
    ": " +
    course.title +
    " in " +
    course.semester +
    " " +
    course.calendarYear +
    "!" +
    "\n\n" +
    "See you in class!" +
    "\n\n" +
    "Your instructors, \n" +
    instructors +
    "\n\n" +
    donotreply;

  let emailReq = {
    email: userEmail,
    subject: subject,
    text: emailBody,
  };
  debug("Sending notification email...");
  sendEmail(emailReq);
  debug("Register is done!");
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getTopicCounts = async (req, res) => {
  debug("getTopicCounts is called!");
  if (validate(req, res)) {
    return res;
  }
  const id = parseInt(req.params.courseId, 10);
  debug("Looking up topics with counts...");
  const counts = await prisma.topic.findMany({
    where: {
      courseId: id,
    },
    include: {
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  });
  debug("getTopicCounts is done!");
  return res.status(StatusCodes.ACCEPTED).json({ counts });
};

export const createTopic = async (req, res) => {
  debug("createTopic is called!");
  if (validate(req, res)) {
    return res;
  }
  const { value, courseId } = req.body;
  debug("Creating topic...");
  const topic = await prisma.topic.create({
    data: {
      courseId,
      value,
    },
  });
  debug("Topic created...");
  debug("createTopic is done!");
  return res.status(StatusCodes.ACCEPTED).json({ topic });
};

export const getRegistrationStudentCounts = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getRegistrationStudentCounts is called!");
  const id = parseInt(req.params.courseId, 10);
  debug("Getting registrations...");
  const registrationsList = await prisma.registration.groupBy({
    by: ["accountId"],
    where: {
      officeHour: {
        courseId: id,
      },
      isCancelled: false,
      isCancelledStaff: false,
    },
    _count: {
      id: true,
    },
    orderBy: {
      accountId: "desc",
    },
  });
  debug("Getting accounts...");
  const accounts = await prisma.account.findMany({
    where: {
      studentCourses: {
        some: {
          id,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
  accounts.forEach((acc) => {
    delete acc["hashedPassword"];
    delete acc["token"];
  });
  let count = 0;
  const countsAndAccount = accounts.map((account, index) => {
    if (
      registrationsList[index - count] !== undefined &&
      registrationsList[index - count].accountId === account.id
    ) {
      return {
        ...account,
        numRegistrations: registrationsList[index - count]._count.id,
      };
    }
    count += 1;
    return {
      ...account,
      numRegistrations: 0,
    };
  });
  debug("getRegistrationStudentCounts is done!");
  return res.status(StatusCodes.ACCEPTED).json({ countsAndAccount });
};

export const removeStaff = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("removeStaff is called!");
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.params.staffId, 10);
  debug("Updating course...");
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      courseStaff: {
        disconnect: {
          id,
        },
      },
    },
  });
  debug("Getting office hours...");
  const officeHours = await prisma.officeHour.findMany({
    where: {
      courseId,
      hosts: {
        some: {
          id,
        },
      },
    },
  });
  const officeHourIds = [];
  const registrationOfficeHourIds = [];
  officeHours.forEach((officeHour) => {
    officeHourIds.push({ id: officeHour.id });
    registrationOfficeHourIds.push(officeHour.id);
  });
  debug("Updating account...");
  await prisma.account.update({
    where: {
      id,
    },
    data: {
      isHosting: {
        disconnect: officeHourIds,
      },
    },
  });
  debug("Deleting registrations...");
  await prisma.registration.deleteMany({
    where: {
      officeHourId: {
        in: registrationOfficeHourIds,
      },
    },
  });
  debug("Deleting office hours...");
  await prisma.officeHour.deleteMany({
    where: {
      courseId,
      hosts: {
        none: {},
      },
    },
  });
  debug("updating calendar...");
  await generateCalendar(course.id);
  debug("removeStaff is done!");
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const removeStudent = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("removeStudent is called!");
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.params.studentId, 10);
  debug("Updating course...");
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      students: {
        disconnect: {
          id,
        },
      },
    },
  });
  debug("Deleting registrations...");
  await prisma.registration.deleteMany({
    where: {
      accountId: id,
      officeHour: {
        courseId,
      },
    },
  });
  debug("removeStudent is done!");
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const leaveCourse = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("leaveCourse is called!");
  const courseId = parseInt(req.params.courseId, 10);
  const accountId = req.id;
  debug("updating course...");
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      students: {
        disconnect: {
          id: accountId,
        },
      },
    },
  });
  debug("deleting registrations...");
  await prisma.registration.deleteMany({
    where: {
      accountId: accountId,
      officeHour: {
        courseId,
      },
    },
  });
  debug("leaveCourse is done!");
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getCourse = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getCourse is called!");
  const courseId = parseInt(req.params.courseId, 10);
  const accountId = req.id;
  debug("retrieving course from db...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id: accountId,
        },
      },
      courseStaff: {
        where: {
          id: accountId,
        },
      },
    },
  });
  if (course.instructors.length === 0 && course.courseStaff.length === 0) {
    delete course["code"];
  }
  delete course["instructors"];
  delete course["courseStaff"];
  debug("getCourse is done!");
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getRoleInCourse = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getRoleInCourse is called!");
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  debug("retrieving course from db...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
      courseStaff: {
        where: {
          id,
        },
      },
      students: {
        where: {
          id,
        },
      },
    },
  });
  const role =
    course.instructors.length === 1
      ? "Instructor"
      : course.courseStaff.length === 1
      ? "Staff"
      : "Student";
  if (role === "Student") {
    delete course["code"];
  }
  debug("getRoleInCourse is done!");
  course.instructors.forEach((instructor) => {
    delete instructor["hashedPassword"];
    delete instructor["token"];
  });
  course.courseStaff.forEach((staff) => {
    delete staff["hashedPassword"];
    delete staff["token"];
  });
  course.students.forEach((student) => {
    delete student["hashedPassword"];
    delete student["token"];
  });
  return res.status(StatusCodes.ACCEPTED).json({
    role,
    course,
  });
};

export const getRoster = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getRoster is called!");
  const courseId = parseInt(req.params.courseId, 10);
  debug("retrieving course from db...");
  const curCourse = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: true,
      students: true,
      courseStaff: true,
    },
  });
  debug("getRoster is done!");
  curCourse.instructors.forEach((instructor) => {
    delete instructor["hashedPassword"];
    delete instructor["token"];
  });
  curCourse.courseStaff.forEach((staff) => {
    delete staff["hashedPassword"];
    delete staff["token"];
  });
  curCourse.students.forEach((student) => {
    delete student["hashedPassword"];
    delete student["token"];
  });
  return res.status(StatusCodes.ACCEPTED).json({
    instructors: curCourse.instructors,
    staff: curCourse.courseStaff,
    students: curCourse.students,
  });
};

export const getAllRegistrations = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getAllRegistrations is called!");
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  debug("retreiving course from db...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
      courseStaff: {
        where: {
          id,
        },
      },
      students: {
        where: {
          id,
        },
      },
    },
  });
  const role =
    course.instructors.length === 1
      ? "Instructor"
      : course.courseStaff.length === 1
      ? "Staff"
      : "Student";
  let registrations = [];
  if (role === "Student") {
    debug("retrieving student registrations...");
    registrations = await prisma.registration.findMany({
      where: {
        accountId: id,
        officeHour: {
          courseId,
        },
        isCancelled: false,
        isCancelledStaff: false,
      },
      include: {
        topics: true,
        account: {
          select: {
            id: true,
            userName: true,
            email: true,
            firstName: true,
            lastName: true,
            preferredName: true,
          },
        },
        officeHour: {
          select: {
            hosts: {
              select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true,
              },
            },
            location: true,
          },
        },
        officeHourTimeOptions: true,
      },
    });
  } else if (role === "Instructor") {
    debug("retrieving instructors registrations...");
    registrations = await prisma.registration.findMany({
      where: {
        officeHour: {
          courseId,
        },
        isCancelled: false,
        isCancelledStaff: false,
      },
      include: {
        topics: true,
        account: {
          select: {
            id: true,
            userName: true,
            email: true,
            firstName: true,
            lastName: true,
            preferredName: true,
          },
        },
        officeHour: {
          select: {
            hosts: {
              select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true,
              },
            },
            location: true,
          },
        },
        officeHourTimeOptions: true,
      },
    });
  } else {
    debug("retrieving staff registrations...");
    registrations = await prisma.registration.findMany({
      where: {
        officeHour: {
          courseId,
          hosts: {
            some: {
              id,
            },
          },
        },
        isCancelled: false,
        isCancelledStaff: false,
      },
      include: {
        topics: true,
        account: {
          select: {
            id: true,
            userName: true,
            email: true,
            firstName: true,
            lastName: true,
            preferredName: true,
          },
        },
        officeHour: {
          select: {
            hosts: {
              select: {
                id: true,
                userName: true,
                email: true,
                firstName: true,
                lastName: true,
                preferredName: true,
              },
            },
            location: true,
          },
        },
        officeHourTimeOptions: true,
      },
    });
  }
  // const OfficeHourTimeOptions = await prisma.officeHourTimeOptions.findMany({
  //   where: {
  //     courseId,
  //   },
  // });
  // registrations.forEach((registration) => {
  //   let endTime = registration.endTime;
  //   if (registration.endTime < registration.startTime) {
  //     endTime.setUTCDate(endTime.getUTCDate() + 1);
  //   }
  //   const duration =
  //     (endTime.getTime() - registration.startTime.getTime()) / (1000 * 60);
  //   OfficeHourTimeOptions.forEach((option) => {
  //     if (duration == option.duration) {
  //       registration.type = option.title;
  //     }
  //   });
  // });
  return res.status(StatusCodes.ACCEPTED).json({ registrations });
};

// export const addInstructor = async (req, res) => {
//   if (validate(req, res)) {
//     return res;
//   }
//   debug("addInstructor is called!");
//   const courseId = parseInt(req.params.courseId, 10);
//   const id = parseInt(req.get("id"), 10);
//   debug("Looking up course...");
//   const prevCourse = await prisma.course.findFirst({
//     where: {
//       id: courseId,
//     },
//     select: {
//       instructors: true,
//     },
//   });
//   const instructorIds = prevCourse.instructors.map((instructor) => ({
//     id: instructor.id,
//   }));
//   const allInstructors = [...instructorIds, { id: id }];
//   debug("Updating course...");
//   const course = await prisma.course.update({
//     where: {
//       id: courseId,
//     },
//     data: {
//       instructors: {
//         set: allInstructors,
//       },
//     },
//   });
//   debug("addInstructor is done!");
//   return res.status(StatusCodes.ACCEPTED).json({ course });
// };

export const deleteCourse = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("deleteCourse is called!");
  const id = parseInt(req.params.courseId, 10);
  debug("retrieving office hour from db...");
  const officeHour = await prisma.officeHour.findMany({
    where: {
      courseId: id,
    },
  });
  debug("retrieving course tokens from db...");
  const tokens = await prisma.courseToken.findMany({
    where: {
      courseId: id,
    },
  });
  let courseTokenIds = [];
  tokens.forEach((token) => {
    courseTokenIds.push(token.id);
  });
  let officeHourIds = [];
  officeHour.forEach((oh) => {
    officeHourIds.push(oh.id);
  });
  debug("deleting registrations...");
  await prisma.registration.deleteMany({
    where: {
      officeHourId: {
        in: officeHourIds,
      },
    },
  });
  debug("delete issue tokens...");
  await prisma.issueToken.deleteMany({
    where: {
      courseTokenId: {
        in: courseTokenIds,
      },
    },
  });
  debug("deleting course tokens...");
  await prisma.courseToken.deleteMany({
    where: {
      courseId: id,
    },
  });
  debug("deleting topics...");
  await prisma.topic.deleteMany({
    where: {
      courseId: id,
    },
  });
  debug("deleting office hours...");
  await prisma.officeHour.deleteMany({
    where: {
      courseId: id,
    },
  });
  debug("deleting time options...");
  await prisma.officeHourTimeOptions.deleteMany({
    where: {
      courseId: id,
    },
  });
  debug("deleting course calendar events...");
  await prisma.CalendarEvent.deleteMany({
    where: {
      courseId: id,
    },
  });
  debug("deleting course...");
  const course = await prisma.course.delete({
    where: {
      id,
    },
  });
  debug("deleteCourse is done!");
  return res.status(StatusCodes.ACCEPTED).json({ deletedCourse: course });
};

export const createTimeLength = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("createTimeLength is called!");
  const id = parseInt(req.params.courseId, 10);
  const { length, title } = req.body;
  debug("creating time length...");
  const time = await prisma.OfficeHourTimeOptions.create({
    data: {
      title,
      duration: length,
      course: {
        connect: {
          id,
        },
      },
    },
  });
  debug("createTimeLength is done!");
  return res.status(StatusCodes.ACCEPTED).json({ time });
};

export const getTimeLengths = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getTimeLengths is called!");
  const id = parseInt(req.params.courseId, 10);
  debug("getting time options...");
  const times = await prisma.OfficeHourTimeOptions.findMany({
    where: {
      courseId: id,
    },
  });
  debug("getTimeLengths is done!");
  return res.status(StatusCodes.ACCEPTED).json({ times });
};

export const editTimeLength = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("editTimeLength is called!");
  const { length, title } = req.body;
  const id = parseInt(req.params.id, 10);
  debug("updating office hour time option...");
  const time = await prisma.OfficeHourTimeOptions.update({
    where: {
      id,
    },
    data: {
      title,
      duration: length,
    },
  });
  debug("editTimeLength is done!");
  return res.status(StatusCodes.ACCEPTED).json({ time });
};

export const deleteTimeLength = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("deleteTimeLength is called!");
  const id = parseInt(req.params.id, 10);
  debug("deleting office hour time option...");
  const time = await prisma.OfficeHourTimeOptions.delete({
    where: {
      id,
    },
  });
  debug("deleteTimeLength is done!");
  return res.status(StatusCodes.ACCEPTED).json({ deletedTime: time });
};

export const promote = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("promote is called!");
  const id = req.body.studentId;
  const role = req.body.role;
  const courseId = parseInt(req.params.courseId, 10);
  let account;
  if (role === "Instructor" && req.currentRole === "Student") {
    debug("Updating student to instructor...");
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        studentCourses: {
          disconnect: {
            id: courseId,
          },
        },
        instructorCourses: {
          connect: {
            id: courseId,
          },
        },
      },
    });
  } else if (role === "Instructor" && req.currentRole === "Staff") {
    debug("Updating staff to instructor...");
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        staffCourses: {
          disconnect: {
            id: courseId,
          },
        },
        instructorCourses: {
          connect: {
            id: courseId,
          },
        },
      },
    });
  } else {
    debug("updating student to staff...");
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        studentCourses: {
          disconnect: {
            id: courseId,
          },
        },
        staffCourses: {
          connect: {
            id: courseId,
          },
        },
      },
    });
  }
  debug("promote is done!");
  delete account["token"];
  delete account["hashedPassword"];
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ ...account, newRole: role, oldRole: req.currentRole });
};

export const demote = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("demote is called!");
  const id = req.body.studentId;
  const role = req.body.role;
  const courseId = parseInt(req.params.courseId, 10);
  let account;
  if (role === "Student" && req.currentRole === "Staff") {
    debug("Demoting staff to student...");
    account = await prisma.account.update({
      where: {
        id,
      },
      data: {
        studentCourses: {
          connect: {
            id: courseId,
          },
        },
        staffCourses: {
          disconnect: {
            id: courseId,
          },
        },
      },
    });
    debug("Getting office hours...");
    const officeHours = await prisma.officeHour.findMany({
      where: {
        courseId,
        hosts: {
          some: {
            id,
          },
        },
      },
    });
    const officeHourIds = [];
    const registrationOfficeHourIds = [];
    officeHours.forEach((officeHour) => {
      officeHourIds.push({ id: officeHour.id });
      registrationOfficeHourIds.push(officeHour.id);
    });
    debug("Updating account...");
    await prisma.account.update({
      where: {
        id,
      },
      data: {
        isHosting: {
          disconnect: officeHourIds,
        },
      },
    });
    debug("Deleting registrations...");
    await prisma.registration.deleteMany({
      where: {
        officeHourId: {
          in: registrationOfficeHourIds,
        },
      },
    });
    debug("Deleting office hours...");
    await prisma.officeHour.deleteMany({
      where: {
        courseId,
        hosts: {
          none: {},
        },
      },
    });
    debug("updating calendar...");
    await generateCalendar(courseId);
  }
  debug("demote is done!");
  delete account["token"];
  delete account["hashedPassword"];
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ ...account, newRole: role, oldRole: req.currentRole });
};

export const editTopic = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("editTopic is called!");
  const { topicId, value } = req.body;
  debug("updating topic...");
  const topic = await prisma.topic.update({
    where: {
      id: topicId,
    },
    data: {
      value,
    },
  });
  debug("editTopic is done!");
  return res.status(StatusCodes.ACCEPTED).json(topic);
};

export const deleteTopic = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("deleteTopic is called!");
  const topicId = parseInt(req.params.topicId, 10);
  debug("Deleting topic...");
  const topic = await prisma.topic.delete({
    where: {
      id: topicId,
    },
  });
  debug("deleteTopic is done!");
  return res.status(StatusCodes.ACCEPTED).json(topic);
};

export const getTopics = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getTopics is called!");
  const courseId = parseInt(req.params.courseId, 10);
  debug("getting all topics...");
  const topics = await prisma.topic.findMany({
    where: {
      courseId,
    },
  });
  debug("getTopics is done!");
  return res.status(StatusCodes.ACCEPTED).json(topics);
};

export const getRoleInCourseParams = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("getRoleInCourseParams is called!");
  const courseId = parseInt(req.params.courseId, 10);
  const id = parseInt(req.params.id, 10);
  debug("looking up role in course...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
      courseStaff: {
        where: {
          id,
        },
      },
      students: {
        where: {
          id,
        },
      },
    },
  });
  const role =
    course.instructors.length === 1
      ? "Instructor"
      : course.courseStaff.length === 1
      ? "Staff"
      : "Student";
  if (role === "Student") {
    delete course["code"];
  }
  debug("getRoleInCourseParams is done!");
  course.instructors.forEach((instructor) => {
    delete instructor["hashedPassword"];
    delete instructor["token"];
  });
  course.courseStaff.forEach((staff) => {
    delete staff["hashedPassword"];
    delete staff["token"];
  });
  course.students.forEach((student) => {
    delete student["hashedPassword"];
    delete student["token"];
  });
  return res.status(StatusCodes.ACCEPTED).json({
    role,
    course,
  });
};

export const updateRegistrationConstraints = async (req, res) => {
  if (validate(req, res)) {
    return res;
  }
  debug("updateRegistrationConstraints is called!");
  const { start, end } = req.body;
  const id = parseInt(req.params.courseId, 10);
  debug("updating registration constraints...");
  const course = await prisma.course.update({
    where: {
      id,
    },
    data: {
      startRegConstraint: start,
      endRegConstraint: end,
    },
  });
  debug("updateRegistrationConstraints is done!");
  return res.status(StatusCodes.ACCEPTED).json({ course });
};

export const getRegistrationWithFilter = async (req, res) => {
  debug("getRegistrationWithFilter is starting!");
  const courseId = parseInt(req.params.courseId, 10);
  if (req.role === "Instructor") {
    return getRegistrationInstructor(req, res, courseId);
  } else if (req.role === "Staff") {
    return getRegistrationStaff(req, res, courseId);
  } else {
    return getRegistrationStudent(req, res, courseId);
  }
};

const registrationsInclude = {
  topics: true,
  account: {
    select: {
      id: true,
      userName: true,
      email: true,
      firstName: true,
      lastName: true,
      preferredName: true,
    },
  },
  officeHour: {
    select: {
      hosts: {
        select: {
          id: true,
          userName: true,
          email: true,
          firstName: true,
          lastName: true,
          preferredName: true,
        },
      },
    },
  },
  officeHourTimeOptions: true,
};

const getRegistrationStudent = async (req, res, courseId) => {
  debug("filtering registration for student...");
  const id = req.id;
  const { filterType, filterValue } = req.params;
  const where = {
    isCancelled: false,
    isCancelledStaff: false,
    accountId: id,
    officeHour: {
      courseId,
    },
  };
  if (filterType === "topics") {
    where[filterType] = {
      some: {
        id: parseInt(filterValue),
      },
    };
  } else if (filterType === "hosts") {
    where["officeHour"] = {
      courseId: courseId,
      hosts: {
        some: {
          id: parseInt(filterValue),
        },
      },
    };
  } else if (filterType === "isNoShow") {
    where[filterType] = filterValue === "true";
  } else if (filterType === "officeHourId") {
    where[filterType] = parseInt(filterValue);
  } else {
    where[filterType] = new Date(filterValue);
  }
  const registrations = await prisma.registration.findMany({
    where,
    include: registrationsInclude,
  });
  debug("done filtering registration for student...");
  return res.status(StatusCodes.ACCEPTED).json({ registrations });
};

const getRegistrationStaff = async (req, res, courseId) => {
  debug("filtering registration for staff...");
  const id = req.id;
  const { filterType, filterValue } = req.params;
  const where = {
    isCancelled: false,
    isCancelledStaff: false,
    officeHour: {
      courseId: courseId,
      hosts: {
        some: {
          id: id,
        },
      },
    },
  };
  if (filterType === "topics") {
    where[filterType] = {
      some: {
        id: parseInt(filterValue),
      },
    };
  } else if (filterType === "isNoShow") {
    where[filterType] = filterValue === "true";
  } else if (filterType === "officeHourId" || filterType === "accountId") {
    where[filterType] = parseInt(filterValue);
  } else {
    where[filterType] = new Date(filterValue);
  }
  const registrations = await prisma.registration.findMany({
    where,
    include: registrationsInclude,
  });
  debug("done filtering registration for staff...");
  return res.status(StatusCodes.ACCEPTED).json({ registrations });
};

const getRegistrationInstructor = async (req, res, courseId) => {
  debug("filtering registration for instructor...");
  const { filterType, filterValue } = req.params;
  const where = {
    isCancelled: false,
    isCancelledStaff: false,
    officeHour: {
      courseId: courseId,
    },
  };
  if (filterType === "hosts") {
    where["officeHour"] = {
      courseId: courseId,
      hosts: {
        some: {
          id: parseInt(filterValue),
        },
      },
    };
  } else if (filterType === "topics") {
    where[filterType] = {
      some: {
        id: parseInt(filterValue),
      },
    };
  } else if (filterType === "isNoShow") {
    where[filterType] = filterValue === "true";
  } else if (filterType === "officeHourId" || filterType === "accountId") {
    where[filterType] = parseInt(filterValue);
  } else {
    where[filterType] = new Date(filterValue);
  }
  const registrations = await prisma.registration.findMany({
    where,
    include: registrationsInclude,
  });
  debug("done filtering registration for instructor...");
  return res.status(StatusCodes.ACCEPTED).json({ registrations });
};

export const pauseCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  debug("Finding course...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("Course found...");
  debug("Updating course...");
  const courseUpdate = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      isPaused: !course.isPaused,
    },
  });
  debug("Course updated...");
  return res.status(StatusCodes.ACCEPTED).json({ courseUpdate });
};

export const archiveCourse = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  debug("Finding course...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("Course found...");
  debug("Updating course...");
  const courseUpdate = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      isArchived: !course.isArchived,
    },
  });
  debug("Course updated...");
  return res.status(StatusCodes.ACCEPTED).json({ courseUpdate });
};
