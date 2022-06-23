const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

exports.create = async (req, res) => {
  const { email, name, phoneNumber } = req.body;
  if (phoneNumber === null || phoneNumber === undefined) {
    await prisma.Account.create({
      data: {
        email,
        userName: name,
      },
    });
  } else {
    await prisma.Account.create({
      data: {
        email,
        userName: name,
        phoneNumber,
      },
    });
  }

  const account = await prisma.Account.findUnique({
    where: {
      email,
    },
  });
  return res.status(StatusCodes.CREATED).json({ account });
};
