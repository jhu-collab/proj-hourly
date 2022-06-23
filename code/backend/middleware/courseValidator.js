// const { StatusCodes } = require('http-status-codes');
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

module.exports.isUniqueCourse = async (req, res, next) => {
  const { title, number, semester, year } = req.body;
  const query = await prisma.course.findFirst({
    where: {
      title,
      courseNumber: number,
      calendarYear: year,
      semester,
    },
  });
  if (query !== null) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: 'course already exists' });
  }
  next();
};

module.exports.isCourseCode = async (req, res, next) => {
  const { code } = req.body;
  const query = await prisma.course.findUnique({
    where: {
      code,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Course with this code does not exists' });
  }
  next();
};

module.exports.isCourseId = async (req, res, next) => {
  const { courseId } = req.body;
  const query = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  if (query === null) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'Course with this id does not exists' });
  }
  next();
};

module.exports.areCourseStaffOrInstructor = async (req, res, next) => {
  const { courseId, hosts } = req.body;
  hosts.forEach(async (element) => {
    const instructorQuery = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructors: {
          some: {
            id: element,
          },
        },
      },
    });
    const staffQuery = await prisma.course.findUnique({
      where: {
        id: courseId,
        courseStaff: {
          some: {
            id: element,
          },
        },
      },
    });
    if (staffQuery === null && instructorQuery == null) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: 'User is not a member of course staff' });
    }
  });
  next();
};
