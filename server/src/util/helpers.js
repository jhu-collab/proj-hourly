import { Prisma } from "@prisma/client";
import jsonWebToken from "jsonwebtoken";

export const isPrismaError = (e) => {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientUnknownRequestError ||
    e instanceof Prisma.PrismaClientRustPanicError ||
    e instanceof Prisma.PrismaClientInitializationError ||
    e instanceof Prisma.PrismaClientValidationError
  );
};

export const prismaErrorToHttpError = (e, res) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return res.status(400).json({
        message: `A record with the same ${e.meta.target.join(
          ", "
        )} already exists.`,
      });
    } else if (e.code === "P2025") {
      return res
        .status(404)
        .json({ message: e.meta.cause || "Record not found!" });
    } else {
      // TODO: Go through https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
      // and decide which are input errors (400) and which are not (500)
      return res.status(500).json({ message: "Internal server error!" });
    }
  } else if (e instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: "Bad request! A validation error occurred!",
    });
  } else {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export const createToken = ({ user, expiresIn }) => {
  return jsonWebToken.sign(user, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn || "2d",
  });
};

export const createTimeString = (date) => {
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let seconds = date.getUTCSeconds();
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};

export const computeDiff = (start, end) => {
  return (
    ((end.getUTCHours() * 60 + end.getUTCMinutes()) * 60 +
      end.getUTCSeconds()) *
      1000 -
    ((start.getUTCHours() * 60 + start.getUTCMinutes()) * 60 +
      start.getUTCSeconds()) *
      1000
  );
};

export const handleUTCDateChange = (dateObj, officeHour) => {
  const dateObj2 = new Date(date);
  dateObj.setHours(new Date(officeHour.startDate).getHours() % 24);
  if (dateObj.getUTCDate() != dateObj2.getUTCDate()) {
    dateObj.setUTCDate(dateObj2.getUTCDate());
  }
  dateObj.setUTCHours(
    dateObj.getUTCHours() +
      new Date(officeHour.startDate).getTimezoneOffset() / 60 -
      dateObj.getTimezoneOffset() / 60
  );
  return dateObj;
};
