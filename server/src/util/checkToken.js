import { StatusCodes } from "http-status-codes";
import { decodeToken } from "./token.js";

/**
 * checks if the token is a match for the user
 * @param {object} req - request
 * @param {object} res - response
 * @param {object} next - call back function
 */
export const checkToken = (req, res, next) => {
  // Get token from header
  const id = req.get("id");
  // Check if not token
  if (!id) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    decodeToken(id, (error, decoded) => {
      if (error) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ msg: "Token is not valid" });
      }
      req.id = decoded.user.id;
      next();
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    res.status(StatusCodes.BAD_GATEWAY).json({ msg: "Server Error" });
  }
};
