import prisma from "../../prisma/client.js";
import { StatusCodes } from "http-status-codes";
import { factory } from "./debug.js";
import validate from "../util/checkValidation.js";

const debug = factory(import.meta.url);

export const isCourseUsingTokens = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseId = parseInt(req.params.courseId, 10);
  debug("Finding course...");
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });
  debug("Course found...");
  if (!course.usesTokens) {
    debug("Course not using course tokens...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course not using tokens, enable tokens to proceed" });
  } else {
    debug("Course using course tokens!");
    next();
  }
};

//checking if it's the correct course token
export const isCourseToken = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  debug("Finding course token...");
  const courseToken = await prisma.courseToken.findUnique({
    where: {
      id: courseTokenId,
    },
  });
  debug("Found course token...");
  if (courseToken === null) {
    debug("Course token doesn't exist...");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Course Token does not exist for this courseTokenId" });
  } else {
    debug("Course Token exists!");
    next();
  }
};

//validates whether the student has reached the token limit
export const tokenLimitReached = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const studentId = parseInt(req.params.studentId, 10);
  debug("Finding course token...");
  const courseToken = await prisma.courseToken.findUnique({
    where: {
      id: courseTokenId,
    },
  });
  debug("Course token found...");
  debug("Finding issue token...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: studentId,
      courseTokenId,
    },
  });
  debug("Found issue token...");
  const dates = issueToken.datesUsed;
  if (dates === null) {
    debug("Student has used no tokens yet!");
    next();
  }
  if (
    (issueToken.overrideAmount !== undefined &&
      issueToken.overrideAmount !== null &&
      dates.length >= issueToken.overrideAmount) ||
    ((issueToken.overrideAmount === null ||
      issueToken.overrideAmount === undefined) &&
      dates.length >= courseToken.tokenLimit)
  ) {
    debug("Course token limit reached!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Student has used all their tokens" });
  } else {
    debug("Student has not yet reached course token limit!");
    next();
  }
};

export const tokenLessThanOverride = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const { overrideAmount } = req.body;
  debug("Finding course token...");
  const courseToken = await prisma.courseToken.findUnique({
    where: {
      id: courseTokenId,
    },
  });
  debug("Course token found...");
  if (courseToken.tokenLimit >= overrideAmount) {
    debug("Override limit is lte token limit!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Override limit is lte token limit" });
  } else {
    debug("Override limit is gt token limit!");
    next();
  }
};

export const overrideNotNull = async (req, res, next) => {
  if (validate(req, res)) {
    return res;
  }
  const courseTokenId = parseInt(req.params.courseTokenId, 10);
  const accountId = parseInt(req.params.accountId, 10);
  debug("Finding issue token...");
  const issueToken = await prisma.issueToken.findFirst({
    where: {
      accountId: accountId,
      courseTokenId,
    },
  });
  debug("Found issue token...");
  if (issueToken.overrideAmount == null) {
    debug("Override limit is null!");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Override limit is null" });
  } else {
    debug("Override limit is not null!");
    next();
  }
};
