import express from "express";
import ApiError from "../model/ApiError.js";
import { checkToken } from "../util/middleware.js";

const router = express.Router();
const endpoint = "/users";

router.get(`${endpoint}`, checkToken, async (req, res, next) => {
  try {
    const filter = req.query || {};
    throw new ApiError(
      501,
      "Server does not support the functionality required to fulfill the request."
    );
  } catch (err) {
    next(err);
  }
});

router.get(`${endpoint}/:id`, checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    throw new ApiError(
      501,
      "Server does not support the functionality required to fulfill the request."
    );
  } catch (err) {
    next(err);
  }
});

router.post(`${endpoint}`, checkToken, async (req, res, next) => {
  try {
    const attributes = req.body;
    throw new ApiError(
      501,
      "Server does not support the functionality required to fulfill the request."
    );
  } catch (err) {
    next(err);
  }
});

router.put(`${endpoint}/:id`, checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const attributes = req.body;
    throw new ApiError(
      501,
      "Server does not support the functionality required to fulfill the request."
    );
  } catch (err) {
    next(err);
  }
});

router.delete(`${endpoint}/:id`, checkToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    throw new ApiError(
      501,
      "Server does not support the functionality required to fulfill the request."
    );
  } catch (err) {
    next(err);
  }
});

export default router;
