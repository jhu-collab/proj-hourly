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
  debug("checkToken called!");
  const id = req.get("id");
  // Check if not token
  if (!id) {
    debug("id was not found...");
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    debug("decoding token...");
    decodeToken(id, (error, decoded) => {
      if (error) {
        debug("Token is not valid...");
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ msg: "Token is not valid" });
      }
      req.id = decoded.user.id;
      debug("checkToken done!");
      next();
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    debug("Server error...");
    res.status(StatusCodes.BAD_GATEWAY).json({ msg: "Server Error" });
  }
};
