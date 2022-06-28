import { Prisma } from "@prisma/client";

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
