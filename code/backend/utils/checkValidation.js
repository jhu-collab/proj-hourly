const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('./ApiError');

module.exports = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Invalid Request',
      errors.array(),
    );
  }
};
