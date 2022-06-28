import { isPrismaError, prismaErrorToHttpError } from "./helpers.js";

export const checkToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    // check the token or attach it to the request object!
    req.token = token;
  }
  next();
};

export const globalErrorHandler = (err, req, res, next) => {
  if (err) {
    // console.log(err);
    if (
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
