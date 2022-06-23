const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');
const validate = require('../utils/checkValidation');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const prisma = new PrismaClient();

function makeCourseCode() {
  let result = '';
  const alphabetLen = alphabet.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 6; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabetLen));
  }
  return result;
}

exports.create = async (req, res) => {
  validate(req);
  let code = '';
  let codeIsUnique = false;
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

  const { title, number, semester, year } = req.body;
  //   const { id } = req.user;
  await prisma.Course.create({
    data: {
      title,
      courseNumber: number,
      semester,
      calendarYear: year,
      code,
      //   instructors: [id],
    },
  });
  const course = await prisma.Course.findUnique({
    where: {
      code,
    },
  });
  return res.status(StatusCodes.CREATED).json({ course });
};

exports.register = async (req, res) => {
  validate(req);
  const { code, id } = req.body;
  const course = await prisma.Course.findUnique({
    where: {
      code,
    },
  });
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
  return res.status(StatusCodes.ACCEPTED).json({ updateAccount });
};
