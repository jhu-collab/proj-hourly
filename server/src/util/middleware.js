import { isPrismaError, prismaErrorToHttpError } from "./helpers.js";
import { ZodError } from "zod";
import jsonWebToken from "jsonwebtoken";
import ApiError from "../model/ApiError.js";

export const checkToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader) {
    throw new ApiError(401, "No authorization token was provided!");
  }
  const bearer = bearerHeader.split(" ");
  const token = bearer[1];
  // decode the token and attach the user object to the request object!
  try {
    const { iat, exp, ...rest } = jsonWebToken.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        ignoreNotBefore: true,
      }
    );
    req.user = { ...rest };
  } catch (err) {
    if (err && err.name === "TokenExpiredError") {
      throw new ApiError(401, "Authorization token expired!");
    } else if (err && err.name === "JsonWebTokenError") {
      throw new ApiError(401, `Authorization error ${err.message}`);
    } else {
    }
  }
  next();
};

export const globalErrorHandler = (err, req, res, next) => {
  if (err) {
    // console.log(err);
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: err.issues[0].message || "Bad request!" });
    } else if (
      (err.name && err.name === "NotFoundError") ||
      (err.name && err.name === "RecordNotFound")
    ) {
      // Prisma throws NotFoundError when findUnique fails to find the resource!
      // It throws RecordNotFound when delete or update operations fail to find the record.
      return res.status(404).json({ message: err.message });
    } else if (isPrismaError(err)) {
      // Check for other Prisma Errors
      prismaErrorToHttpError(err, res);
    } else {
      return res
        .status(err.status || 500)
        .json({ message: err.message || "Internal server error!" });
    }
  }
  next();
};
