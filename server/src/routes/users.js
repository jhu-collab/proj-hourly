import express from "express";
import { checkToken } from "../util/middleware.js";
import prisma from "../../prisma/client.js";
import { emailSchema, requestIdSchema } from "../util/validators.js";
import checkPermission from "../util/auth.js";

const router = express.Router();
const endpoint = "/users";

// Guide: https://www.prisma.io/docs/concepts/components/prisma-client/crud

router.get(`${endpoint}`, checkToken, async (req, res, next) => {
  try {
    checkPermission(req, {
      method: "GET",
      resource: endpoint,
      role: req.user.role,
      user: req.user.id,
    });

    const { searchString, skip, take } = req.query;
    // skip and take are for pagination,
    // see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
    const filter = searchString
      ? {
          OR: [
            { name: { contains: searchString } },
            { email: { contains: searchString } },
          ],
        }
      : {};

    const data = await prisma.user.findMany({
      where: filter,
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
    });

    res.json({
      message: `Successfully retrieved ${data.length} users!`,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

router.get(`${endpoint}/:id`, checkToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    requestIdSchema.parse(id);

    checkPermission(req, {
      method: "GET",
      resource: endpoint,
      role: req.user.role,
      user: req.user.id,
      owner: id,
    });

    const data = await prisma.user.findUnique({
      where: { id },
      rejectOnNotFound: true,
    });
    res.json({
      message: `Successfully retrieved the following user!`,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

router.post(`${endpoint}`, checkToken, async (req, res, next) => {
  try {
    checkPermission(req, {
      method: "POST",
      resource: endpoint,
      role: req.user.role,
      user: req.user.id,
    });

    const { email, ...rest } = req.body;
    emailSchema.parse(email);
    const data = await prisma.user.create({
      data: { email, ...rest },
    });
    res.status(201).json({
      message: `Successfully created the following user!`,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

router.put(`${endpoint}/:id`, checkToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    requestIdSchema.parse(id);

    checkPermission(req, {
      method: "PUT",
      resource: endpoint,
      role: req.user.role,
      user: req.user.id,
      owner: id,
    });

    const { email, ...rest } = req.body;
    email && emailSchema.parse(email);
    const data = await prisma.user.update({
      where: { id },
      data: { email, ...rest },
    });
    res.json({
      message: `Successfully updated the following user!`,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

router.delete(`${endpoint}/:id`, checkToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    requestIdSchema.parse(id);

    checkPermission(req, {
      method: "DELETE",
      resource: endpoint,
      role: req.user.role,
      user: req.user.id,
      owner: id,
    });

    const data = await prisma.user.delete({
      where: { id },
    });
    res.json({
      message: `Successfully deleted the following user!`,
      data: data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
