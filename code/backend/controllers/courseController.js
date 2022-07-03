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

  const { title, number, semester, year, id } = req.body;
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

exports.getTopicCounts = async (req, res) => {
  const id = parseInt(req.params.courseId, 10);
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

  return res.status(StatusCodes.ACCEPTED).json({ counts });
};

exports.createTopic = async (req, res) => {
  const { value, courseId } = req.body;
  const topic = await prisma.topic.create({
    data: {
      courseId,
      value,
    },
  });
  return res.status(StatusCodes.ACCEPTED).json({ topic });
};

exports.getRegistrationStudentCounts = async (req, res) => {
  const id = parseInt(req.params.courseId, 10);
  const registrationsList = await prisma.registration.groupBy({
    by: ['accountId'],
    where: {
      officeHour: {
        courseId: id,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      accountId: 'desc',
    },
  });
  const accounts = await prisma.account.findMany({
    where: {
      studentCourses: {
        some: {
          id,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });
  console.log(registrationsList);
  console.log(accounts);
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
  return res.status(StatusCodes.ACCEPTED).json({ countsAndAccount });
};
