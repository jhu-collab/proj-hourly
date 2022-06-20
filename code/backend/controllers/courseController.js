const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

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
  const code = makeCourseCode();
  const { title, number, semester, year } = req.body;
  await prisma.Course.create({
    data: {
      title,
      courseNumber: number,
      semester,
      calendarYear: year,
      code,
    },
  });
  const course = await prisma.Course.findUnique({
    where: {
      code,
    },
  });
  return res.status(StatusCodes.CREATED).json({ course });
};
