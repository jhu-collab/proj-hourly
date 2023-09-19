import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { combineTimeAndDate } from "./icalHelpers.js";
import { stringToTimeObj } from "./officeHourValidator.js";
import { handleUTCDateChange } from "./helpers.js";
import validate from "../util/checkValidation.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
export const isUniqueCourse = async (req, res, next) => {
  debug("isUniqueCourse is called!");
  debug("Validating the request...");
  if (validate(req, res)) {
    debug("Request contained an error - returning");
    return res;
  }
  const { title, number, semester, year } = req.body;
  debug(
    "Checking for a course with matching title, course number, calendar year, and semester"
  );
  const query = await prisma.course.findFirst({
    where: {
      title,
      courseNumber: number,
      calendarYear: year,
      semester,
    },
  });
  if (query !== null) {
    debug("Course with values already exists!");
    debug("Error in isUniquecourse");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "course already exists" });
  } else {
    debug("Course is unique!");
    debug("isUniqueCourse is done!");
    next();
  }
};

export const isCourseCode = async (req, res, next) => {
  debug("isCourseCode is called!");
  const { code } = req.body;
  debug("Retrieving code from body...");
  if (code === null || code === undefined) {
    debug("Code was not included...");
    debug("Error in isCourseCode");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "No course code included!" });
  }
  debug("Checking that code exists...");
  const query = await prisma.course.findUnique({
    where: {
      code: code.toUpperCase(),
    },
  });
  if (query === null) {
    debug("Code does not match a course code...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course with this code does not exists" });
  } else {
    debug("Code matches some course...");
    debug("isCourseCode is done!");
    next();
  }
};

export const isCourseIdUrlValid = async (req, res, next) => {
  debug("isCourseIdUrlValid is called!");
  debug("Retrieving course id from params...");
  const id = parseInt(req.params.courseId, 10);
  const query = await prisma.course.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    debug("Course does not exist...");
    debug("Error is isCourseIdUrlValid");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course does not exist" });
  } else {
    debug("Course exists!");
    debug("isCourseIdUrlValid is done!");
    next();
  }
};

export const isCourseId = async (req, res, next) => {
  debug("isCourseId is called!");
  debug("Retrieving course id from body...");
  if (validate(req, res)) {
    return res;
  }
  const { courseId } = req.body;
  const query = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (query === null) {
    debug("Course does not exist...");
    debug("Error in isCourseId!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course with this id does not exists" });
  } else {
    debug("Course exists!");
    debug("isCourseId is done!");
    next();
  }
};

export const isCourseIdParams = async (req, res, next) => {
  debug("isCourseIdParams is called!");
  debug("Retrieving course id from params...");
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  const query = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (query === null) {
    debug("Course does not exist...");
    debug("Error in isCourseIdParams!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course with this id does not exists" });
  } else {
    debug("Course exists!");
    debug("isCourseIdParams is done!");
    next();
  }
};

export const isCourseStaffOrInstructor = async (req, res, next) => {
  debug("isCourseStaffOrInstructor is called!");
  debug("Retrieving course id from body and account id");
  let { courseId } = req.body;
  if (courseId === undefined || courseId === null) {
    courseId = parseInt(req.params.courseId, 10);
  }
  const id = req.id;
  let roleQuery = {
    OR: [
      {
        instructors: {
          some: {
            id,
          },
        },
      },
      {
        courseStaff: {
          some: {
            id,
          },
        },
      },
    ],
  };
  debug("Checking if account is an instructor or staff for course...");
  const staffQuery = await prisma.course.findFirst({
    where: {
      id: courseId,
      AND: roleQuery,
    },
  });
  if (staffQuery === null) {
    debug("Account is not an instructor or staff for course...");
    debug("Error in isCourseStaffOrInstructor!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is not a member of course staff" });
  } else {
    debug("Account is an instructor or staff for course!");
    debug("isCourseStaffOrInstructor is done!");
    next();
  }
};

export const areCourseStaffOrInstructor = async (req, res, next) => {
  debug("areCourseStaffOrInstructor is called!");
  debug("Retrieving course id and hosts id array from body...");
  const { courseId, hosts } = req.body;
  let roleQuery = [];
  hosts.forEach((element) => {
    roleQuery.push({
      OR: [
        {
          instructors: {
            some: {
              id: element,
            },
          },
        },
        {
          courseStaff: {
            some: {
              id: element,
            },
          },
        },
      ],
    });
  });
  debug("verifying that all hosts are staff or instructors...");
  const staffQuery = await prisma.course.findFirst({
    where: {
      id: courseId,
      AND: roleQuery,
    },
  });
  if (staffQuery === null) {
    debug("At least one host was not a member of course staff...");
    debug("Error in areCourseStaffOrInstructor!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is not a member of course staff" });
  } else {
    debug("All hosts are members of course staff!");
    debug("areCourseStaffOrInstructor is done!");
    next();
  }
};

export const isInCourseFromHeader = async (req, res, next) => {
  debug("isInCourseFromHeader is called!");
  debug("Retrieving course id from url...");
  const courseId = parseInt(req.params.courseId, 10);
  const id = req.id;
  debug("Checking if account is a student...");
  const studentQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: {
        where: {
          id,
        },
      },
    },
  });
  debug("Checking if account is in course staff...");
  const staffQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      courseStaff: {
        where: {
          id,
        },
      },
    },
  });
  debug("Checking if account is an instructor...");
  const instructorQuery = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      instructors: {
        where: {
          id,
        },
      },
    },
  });
  if (
    studentQuery.students.length === 0 &&
    staffQuery.courseStaff.length === 0 &&
    instructorQuery.instructors.length === 0
  ) {
    debug("Account is not a course member...");
    debug("Error in isInCourseFromHeader!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "User is not in course" });
  } else {
    debug("Account is a course member!");
    debug("isInCourseFromHeader is done!");
    next();
  }
};

export const isInCourseForOfficeHour = async (req, res, next) => {
  debug("isInCourseForOfficeHour is called!");
  debug("Retrieving office hour id from body...");
  const { officeHourId } = req.body;
  const id = req.id;
  debug("Getting office hour from database...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
    include: {
      course: true,
    },
  });
  debug("Verifying that account is a student...");
  const studentQuery = await prisma.course.findUnique({
    where: {
      id: officeHour.course.id,
    },
    include: {
      students: {
        where: {
          id,
        },
      },
    },
  });
  if (studentQuery === null) {
    debug("Account is not a student for course...");
    debug("Error in isInCourseForOfficeHour!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: student is not enrolled in course" });
  } else {
    debug("Account is a student for course!");
    debug("isInCourseForOfficeHour is done!");
    next();
  }
};

export const isInCourseForOfficeHourParam = async (req, res, next) => {
  debug("isInCourseForOfficeHourParam is called!");
  debug("Retrieving office hour id from url...");
  const officeHourId = parseInt(req.params.officeHourId, 10);
  const id = req.id;
  debug("Getting office hour from database...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("Verifying that account is a student...");

  const studentQuery = await prisma.course.findUnique({
    where: {
      id: officeHour.courseId,
    },
    include: {
      students: {
        where: {
          id,
        },
      },
    },
  });
  if (studentQuery === null) {
    debug("Account is not a student for course...");
    debug("Error in isInCourseForOfficeHourParam!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: student is not enrolled in course" });
  } else {
    debug("Account is a student for course!");
    debug("isInCourseForOfficeHourParam is done!");
    next();
  }
};

export const areTopicsForCourse = async (req, res, next) => {
  debug("areTopicsForCourse is called!");
  debug("Retrieving topic ids and office hour id from body...");
  const { officeHourId, TopicIds } = req.body;
  debug("Retrieving office hour from database...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("Checking if topic ids were included...");
  if (TopicIds !== null && TopicIds !== undefined) {
    let topicQuery = [];
    TopicIds.forEach((topicId) => {
      topicQuery.push({
        AND: {
          id: topicId,
          courseId: officeHour.courseId,
        },
      });
    });
    debug("Looking up all topics...");
    const topic = await prisma.topic.findMany({
      where: {
        OR: topicQuery,
      },
    });
    if (topic.length !== TopicIds.length) {
      debug("At least one topic missing from db...");
      debug("Error in areTopicsForCourse!");
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "ERROR: topic is not for course" });
    } else {
      debug("All topics found!");
      debug("areTopicsForCourse is done!");
      next();
    }
  } else {
    debug("No topic ids...continuing!");
    debug("areTopicsForCourse is done!");
    next();
  }
};

export const isNotDuplicateTopic = async (req, res, next) => {
  debug("isNotDuplicateTopic is called!");
  debug("Retrieving courseId and value from body...");
  const { courseId, value } = req.body;
  debug("Checking if topic already exists for the course...");
  const topic = await prisma.topic.findFirst({
    where: {
      courseId,
      value,
    },
  });
  if (topic !== null) {
    debug("Topic already exists...");
    debug("Error in isNotDuplicateTopic!");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: topic already exists" });
  } else {
    debug("New topic is unique!");
    debug("isNotDuplicateTopic is done!");
    next();
  }
};

export const isNotInCourse = async (req, res, next) => {
  debug("isNotInCourse is called!");
  debug("Retrieving course code from body...");
  const { code } = req.body;
  const id = req.id;
  debug("Retrieivng roster for course...");
  const roster = await prisma.course.findUnique({
    where: {
      code: code.toUpperCase(),
    },
    include: {
      students: true,
      courseStaff: true,
      instructors: true,
    },
  });
  const inCourse =
    roster.students.some((student) => student.id === id) ||
    roster.courseStaff.some((staff) => staff.id === id) ||
    roster.instructors.some((instructor) => instructor.id === id);
  if (inCourse) {
    debug("Account is already in the roster...");
    debug("Error in isNotInCourse!");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "User is already in course" });
  } else {
    debug("Account is not in the roster!");
    debug("isNotInCourse is done!");
    next();
  }
};

export const doesTimeLengthExist = async (req, res, next) => {
  debug("doesTimeLengthExist is called!");
  debug("Retrieving time length id from url...");
  const id = parseInt(req.params.id, 10);
  debug("Verifying that time length exists...");
  const time = await prisma.OfficeHourTimeOptions.findUnique({
    where: {
      id,
    },
  });
  if (time === null || time === undefined) {
    debug("Time option does not exist...");
    debug("Error in doesTimeLengthExist!");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: time option does not exist" });
  } else {
    debug("Time option does exist!");
    debug("doesTimeLengthExist is done!");
    next();
  }
};

export const isTimeLengthForCourse = async (req, res, next) => {
  debug("isTimeLengthForCourse is called!");
  debug("Retrieving time length id and course id from url...");
  const id = parseInt(req.params.id, 10);
  const courseId = parseInt(req.params.courseId, 10);
  debug("Verifying that time option is for course...");
  const time = await prisma.OfficeHourTimeOptions.findFirst({
    where: {
      id,
      courseId,
    },
  });
  if (time === null || time === undefined) {
    debug("Time option is not for course...");
    debug("Error in isTimeLengthForCourse");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: user does not have access to time length" });
  } else {
    debug("Time option is for course!");
    debug("isTimeLengthForCourse is done!");
    next();
  }
};

export const isLengthMultipleOf5 = async (req, res, next) => {
  debug("isLengthMultipleOf5 is called!");
  debug("Getting length from body...");
  const { length } = req.body;
  if (length % 5 !== 0) {
    debug("Length is not a multiple of 5...");
    debug("Error in isLengthMultipleOf5!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: length must be a multiple of 5" });
  } else {
    debug("Length is valid!");
    debug("isLengthMultipleOf5 is done!");
    next();
  }
};

export const isInCourseBelowRoleForPromotionTo = async (req, res, next) => {
  debug("isInCourseBelowRoleForPromotionTo is called!");
  debug("Retrieving course id from url and student id and role from body...");
  const courseId = parseInt(req.params.courseId, 10);
  const studentId = req.body.studentId;
  const role = req.body.role;
  debug("Getting roster for course...");
  const roster = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: true,
      courseStaff: true,
      instructors: true,
    },
  });
  const inCourse =
    roster.students.some((student) => student.id === studentId) ||
    roster.courseStaff.some((staff) => staff.id === studentId) ||
    roster.instructors.some((instructor) => instructor.id === studentId);
  if (!inCourse) {
    debug("Account is not in course...");
    debug("Error in isInCourseBelowRoleForPromotionTo!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: account to be promoted not in course" });
  } else if (roster.students.some((student) => student.id === studentId)) {
    req.currentRole = "Student";
    debug("Account has valid role for promotion!");
    debug("isInCourseBelowRoleForPromotionTo is done!");
    next();
  } else if (
    roster.courseStaff.some((staff) => staff.id === studentId) &&
    role === "Instructor"
  ) {
    debug("Account has valid role for promotion!");
    req.currentRole = "Staff";
    debug("isInCourseBelowRoleForPromotionTo is done!");
    next();
  } else {
    debug("Account has invalid role for promotion...");
    debug("Error in isInCourseBelowRoleForPromotionTo!");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: account can not be promoted further" });
  }
};

export const isInCourseBelowRoleForDemotionTo = async (req, res, next) => {
  debug("isInCourseBelowRoleForDemotionTo is called!");
  debug("Retrieving course id from url and student id and role from body...");
  const courseId = parseInt(req.params.courseId, 10);
  const studentId = req.body.studentId;
  const role = req.body.role;
  debug("Getting roster for course...");
  const roster = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: true,
      courseStaff: true,
      instructors: true,
    },
  });
  const inCourse =
    roster.students.some((student) => student.id === studentId) ||
    roster.courseStaff.some((staff) => staff.id === studentId) ||
    roster.instructors.some((instructor) => instructor.id === studentId);
  if (!inCourse) {
    debug("Account is not a member of the course...");
    debug("Error in isInCourseBelowRoleForDemotionTo!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: account to be demoted not in course" });
  } else if (
    roster.courseStaff.some((staff) => staff.id === studentId) &&
    role === "Student"
  ) {
    debug("Account is valid role for demotion!");
    debug("isInCourseBelowRoleForDemotionTo is done!");
    req.currentRole = "Staff";
    next();
  } else {
    debug("Account is invalid role for demotion...");
    debug("Error in isInCourseBelowRoleForDemotionTo!");
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "ERROR: account can not be demoted further" });
  }
};

export const checkPromoteRoles = (req, res, next) => {
  debug("checkPromoteRoles is called!");
  debug("Retrieivng role from body...");
  const { role } = req.body;
  if (role === "Staff" || role === "Instructor") {
    debug("Is valid role for promotion!");
    debug("checkPromoteRoles is done!");
    next();
  } else {
    debug("Is invalid role for promotion...");
    debug("Error in checkPromoteRoles!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: invalid promotion role" });
  }
};

export const checkDemoteRoles = (req, res, next) => {
  debug("checkDemoteRoles is called!");
  debug("Retrieivng role from body...");
  const { role } = req.body;
  if (role === "Student") {
    debug("Is valid role for demotion!");
    debug("checkDemoteRoles is done!");
    next();
  } else {
    debug("Is invalid role for demotion...");
    debug("Error in checkDemoteRoles!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: invalid promotion role" });
  }
};

export const doesTopicIdExist = async (req, res, next) => {
  debug("doesTopicIdExist is called!");
  debug("Retrieving topicid and courseid from body...");
  const { topicId, courseId } = req.body;
  debug("Retrieving topic from database...");
  const topic = await prisma.topic.findUnique({
    where: {
      id: topicId,
    },
    include: {
      course: true,
    },
  });
  if (topic === null || topic === undefined) {
    debug("Topic does not exist...");
    debug("Error in doesTopicIdExist!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: topic does not exist" });
  } else if (topic.course.id !== courseId) {
    debug("Topic is not for specific course...");
    debug("Error in doesTopicIdExist!");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "ERROR: topic is not for specific course" });
  } else {
    debug("Topic is valid for course!");
    debug("doesTopicIdExist is done!");
    next();
  }
};

export const isAccountInstructorForTopic = async (req, res, next) => {
  debug("isAccountInstructorForTopic is called!");
  debug("Retrieving topic id from url...");
  const topicId = parseInt(req.params.topicId, 10);
  const id = req.id;
  if (topicId === null || topicId === undefined) {
    debug("No topic id given...");
    debug("Error in isAccountInstructorForTopic!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: did not include a topic id" });
  } else {
    debug("Looking up topic in database...");
    const topic = await prisma.topic.findUnique({
      where: {
        id: topicId,
      },
      include: {
        course: true,
      },
    });
    if (topic === null || topic === undefined) {
      debug("Topic not found...");
      debug("Error in isAccountInstructorForTopic!");
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: did not include a valid topic id" });
    } else {
      debug("Topic found...");
      debug("Checking if user is an instructor...");
      const query = await prisma.course.findUnique({
        where: {
          id: topic.course.id,
        },
        include: {
          instructors: {
            where: {
              id,
            },
          },
        },
      });
      if (query.instructors.length === 0) {
        debug("User is not an instructor for course...");
        debug("Error in isAccountInstructorForTopic!");
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ msg: "Account is not an instructor in the course" });
      } else {
        debug("User is an instructor for course!");
        debug("isAccountInstructorForTopic is done!");
        next();
      }
    }
  }
};

export const isNotOnlyTimeLengthForCourse = async (req, res, next) => {
  debug("isNotOnlyTimeLengthForCourse is called!");
  debug("Retrieving course id from url...");
  const id = parseInt(req.params.courseId, 10);
  debug("Looking up time options for course...");
  const times = await prisma.OfficeHourTimeOptions.findMany({
    where: {
      courseId: id,
    },
  });
  if (times.length > 1) {
    debug("Is not last time option for course!");
    debug("isNotOnlyTimeLengthForCourse is done!");
    next();
  } else {
    debug("Is last time option for course...");
    debug("Error in isNotOnlyTimeLengthForCourse!");
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "ERROR: cannot delete the only time offering for the course",
    });
  }
};

export const isWithinRegisterConstraint = async (req, res, next) => {
  debug("isWithinRegisterConstraint is called!");
  debug("Retrieving office hour id and date from body...");
  const { officeHourId, date, startTime } = req.body;
  debug("Retrieivng office hour from database...");
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  debug("Retrieivng course from database...");
  const course = await prisma.course.findUnique({
    where: {
      id: officeHour.courseId,
    },
  });
  const currDate = new Date();
  const dateObj = new Date(date);
  const timeObj = stringToTimeObj(startTime);
  dateObj.setUTCHours(timeObj.getUTCHours());
  dateObj.setUTCMinutes(timeObj.getUTCMinutes());
  console.log(dateObj);
  if (dateObj < req.targetDate) {
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
  }
  const before = new Date(dateObj);
  const end = new Date(dateObj);
  before.setUTCHours(before.getUTCHours() - course.startRegConstraint);
  end.setUTCHours(end.getUTCHours() - course.endRegConstraint);
  console.log(currDate, before, end);
  if (currDate >= before && currDate <= end) {
    debug("Registration is within registration constraints!");
    debug("isWithinRegisterConstraint is done!");
    next();
  } else {
    debug("Registration not is within registration constraints...");
    debug("Error in isWithinRegisterConstraint!");
    return res.status(StatusCodes.FORBIDDEN).json({
      msg: "ERROR: you must register within your courses office hour contraints",
    });
  }
};

export const startAndEndArePositive = (req, res, next) => {
  debug("startAndEndArePositive is called!");
  debug("Retrieving star and end from body...");
  const { start, end } = req.body;
  if (start <= 0 || end < 0) {
    debug("one is not positive...");
    debug("Error in startAndEndArePositive!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: start and end must be positive" });
  } else {
    debug("Both are positive!");
    debug("startAndEndArePositive is done!");
    next();
  }
};

export const startIsGreaterThanEnd = (req, res, next) => {
  debug("startIsGreaterThanEnd is called!");
  debug("Retrieving start and end from body...");
  const { start, end } = req.body;
  if (start <= end) {
    debug("Start is less than or equal to end...");
    debug("Error in startIsGreaterThanEnd!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: start must be greater than end" });
  } else {
    debug("Start is greater than end!");
    debug("startIsGreaterThanEnd is done!");
    next();
  }
};

export const isValidFilterForRole = async (req, res, next) => {
  const { filterType, filterValue } = req.params;
  debug("isValidFilterValue is called!");
  debug("Finding user role.");
  const id = req.id;
  const courseId = parseInt(req.params.courseId);
  debug("Checking if account is an instructor or staff for course...");
  const staffQuery = await prisma.course.findUnique({
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
  if (staffQuery.students.length === 1) {
    req.role = "Student";
  } else if (staffQuery.instructors.length === 1) {
    req.role = "Instructor";
  } else {
    req.role = "Staff";
  }
  debug("User level found.");
  if (filterType === "hosts" && req.role === "Staff") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: user does not have access to filter" });
  } else if (filterType === "accountId" && req.role === "Student") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: user does not have access to filter" });
  } else {
    debug("isValidFilterForRole is complete!");
    next();
  }
};

export const isValidFilterValue = async (req, res, next) => {
  debug("isValidFilterValue is called!");
  debug("Retrieving filterType and filterValue from params...");
  const { filterType, filterValue } = req.params;
  const courseId = req.body;
  const id = req.id;
  if (filterType === "date" && new Date(filterValue).valueOf() === NaN) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: filter value must be of type Date" });
  } else if (filterType === "officeHourId") {
    if (isNaN(parseInt(filterValue))) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: filter value must be of type office hour" });
    }
    const officeHour = await prisma.officeHour.findUnique({
      where: {
        id: parseInt(filterValue, 10),
      },
    });
    if (officeHour === null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: filter value must be of type office hour" });
    } else {
      debug("The filterValue is a valid instance of the filterType!");
      debug("isValidFilterValue is done!");
      next();
    }
  } else if (filterType === "accountId") {
    if (isNaN(parseInt(filterValue))) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: filter value must be of type account" });
    }
    const account = await prisma.account.findUnique({
      where: {
        id: parseInt(filterValue, 10),
      },
    });
    if (account === null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: filter value must be of type account" });
    } else {
      debug("The filterValue is a valid instance of the filterType!");
      debug("isValidFilterValue is done!");
      next();
    }
  } else if (filterType === "topics") {
    if (isNaN(parseInt(filterValue))) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: filter value must be of type topic" });
    }
    const topic = await prisma.topic.findUnique({
      where: {
        id: parseInt(filterValue, 10),
      },
    });
    if (topic === null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: filter value must be of type topic" });
    } else {
      debug("The filterValue is a valid instance of the filterType!");
      debug("isValidFilterValue is done!");
      next();
    }
  } else if (
    filterType === "isNoShow" &&
    !(filterValue === "true" || filterValue === "false")
  ) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: filter value must be of type boolean" });
  } else if (filterType === "hosts") {
    const course = await prisma.officeHour.findMany({
      where: {
        courseId: courseId,
        hosts: {
          some: {
            id,
          },
        },
      },
    });
    if (course === null) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "ERROR: filter value must be of type host" });
    } else {
      debug("The filterValue is a valid instance of the filterType!");
      debug("isValidFilterValue is done!");
      next();
    }
  } else {
    debug("The filterValue is a valid instance of the filterType!");
    debug("isValidFilterValue is done!");
    next();
  }
};

export const isAccountStudentParams = async (req, res, next) => {
  debug("isAccountStudentParams is called!");
  const accoundId = parseInt(req.params.accountId, 10);
  const courseId = parseInt(req.params.courseId, 10);
  debug("Checking if account is a student...");
  const isStudent = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      students: {
        where: {
          id: accoundId,
        },
      },
    },
  });
  debug("got data for if account is a student");
  if (isStudent.students.length == 0) {
    debug("account is not a student...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: account is not a student" });
  } else {
    debug("isAccountStudentParams is done!");
    next();
  }
};

export const isCoursePaused = async (req, res, next) => {
  let { courseId } = req.body;
  if (courseId === undefined || courseId === null) {
    courseId = parseInt(req.params.courseId, 10);
  }
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (course.isPaused === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course is archived." });
  } else {
    debug("Course is not archived.");
    next();
  }
};

export const isCoursePausedOfficeHourId = async (req, res, next) => {
  let { officeHourId } = req.body;
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  const course = await prisma.course.findUnique({
    where: {
      id: officeHour.courseId,
    },
  });
  if (course.isPaused === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course is paused" });
  } else {
    debug("Course is not paused.");
    next();
  }
};

export const isCourseArchived = async (req, res, next) => {
  let { courseId } = req.body;
  if (courseId === undefined || courseId === null) {
    courseId = parseInt(req.params.courseId, 10);
  }
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (course.isArchived === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course is archived." });
  } else {
    debug("Course is not archived.");
    next();
  }
};

export const isCourseArchivedOfficeHourId = async (req, res, next) => {
  let { officeHourId } = req.body;
  if (officeHourId === undefined || officeHourId === null) {
    officeHourId = parseInt(req.params.officeHourId, 10);
  }
  const officeHour = await prisma.officeHour.findUnique({
    where: {
      id: officeHourId,
    },
  });
  const course = await prisma.course.findUnique({
    where: {
      id: officeHour.courseId,
    },
  });
  if (course.isArchived === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course is archived" });
  } else {
    debug("Course is not archived.");
    next();
  }
};

export const isCourseArchivedRegistrationId = async (req, res, next) => {
  let { registrationId } = req.body;
  if (registrationId === undefined || registrationId === null) {
    registrationId = parseInt(req.params.registrationId, 10);
  }
  const registration = await prisma.registration.findUnique({
    where: {
      id: registrationId,
    },
    include: {
      officeHour: true,
    },
  });
  const course = await prisma.course.findUnique({
    where: {
      id: registration.officeHour.courseId,
    },
  });
  if (course.isArchived === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course is archived" });
  } else {
    debug("Course is not archived.");
    next();
  }
};

export const isCourseArchivedTopicId = async (req, res, next) => {
  let { topicId } = req.body;
  if (topicId === undefined || topicId === null) {
    topicId = parseInt(req.params.topicId, 10);
  }
  const topic = await prisma.topic.findUnique({
    where: {
      id: topicId,
    },
  });
  const course = await prisma.course.findUnique({
    where: {
      id: topic.courseId,
    },
  });
  if (course.isArchived === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course is archived" });
  } else {
    debug("Course is not archived.");
    next();
  }
};

export const isCourseArchivedCourseCode = async (req, res, next) => {
  let { code } = req.body;
  const course = await prisma.course.findUnique({
    where: {
      code: code,
    },
  });
  if (course.isArchived === true) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "ERROR: Course is archived" });
  } else {
    debug("Course is not archived.");
    next();
  }
};
