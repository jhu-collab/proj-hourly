const { PrismaClient } = require('@prisma/client');
const { STATUS_CODES } = require('http');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

module.exports.isUniqueEmail = async (req, res, next) => {
  const { email } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      email,
    },
  });
  if (query !== null) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: 'Email already in use' });
  }
  next();
};

module.exports.emailExists = async (req, res, next) => {
  const { email } = req.body;
  const query = await prisma.Account.findFirst({
    where: {
      email,
    },
  });
  if (query === null) {
    return res.status(StatusCodes.FORBIDDEN).json({ msg: 'Invalid Email' });
  }
  next();
};

module.exports.isUniquePhone = async (req, res, next) => {
  const { phoneNumber } = req.body;
  if (phoneNumber === null || phoneNumber === undefined) {
    next();
  } else {
    const query = await prisma.Account.findFirst({
      where: {
        phoneNumber,
      },
    });
    if (query !== null) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: 'phoneNumber already associated with an account' });
    }
    next();
  }
};

module.exports.isAccountIdValid = async (req, res, next) => {
  const { id } = req.body;
  const query = await prisma.Account.findUnique({
    where: {
      id,
    },
  });
  if (query === null) {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ msg: 'Account does not exists' });
  }
  next();
};
