import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { Role } from "@prisma/client";
import { hashPassword } from "../../src/util/password.js";

const request = supertest(app);
const endpoint = "/authenticate";

describe(`Test endpoint ${endpoint}`, () => {
  let user = {};

  beforeAll(async () => {
    user = await prisma.account.create({
      data: {
        userName: "Test Username",
        hashedPassword: hashPassword("Test Password"),
        role: Role.User,
        email: "test_email1@test.io"
      }
    });
  });

  afterAll(async () => {
    await prisma.account.delete({
      where: {
        userName: "Test Username"
      }
    });
  });

  describe(`Test POST ${endpoint}`, async () => {
    it("Return 200 when providing correct username and password", async () => {
      const attributes = {
        username: "Test Username",
        password: "Test Password"
      };
      const response = await request
        .post(endpoint)
        .send(attributes);
      console.log(response.text);
      expect(response.status).toBe(200);
      const loggedIn = await prisma.account.findFirst({
        where: {
          id: user.id
        }
      });
      expect(loggedIn.token).toBeDefined();
    });

    it("Return 400 when missing password", async () => {
      const attributes = {
        username: "Test Username", 
      };
      const response = await request
        .post(endpoint)
        .send(attributes);
      expect(response.status).toBe(400);
    });

    it("Return 400 when missing username", async () => {
      const attributes = {
        password: "Test Password"
      };
      const response = await request
        .post(endpoint)
        .send(attributes);
      expect(response.status).toBe(400);
    });

    it("Return 403 when username does not exist", async () => {
      const attributes = {
        username: "What?",
        password: "Password"
      };
      const response = await request
        .post(endpoint)
        .send(attributes);
      expect(response.status).toBe(403);
    });

    it("Return 403 when password is incorrect", async () => {
      const attributes = {
        username: "Test Username",
        password: "Wrong Password"
      };
      const response = await request
        .post(endpoint)
        .send(attributes);
      expect(response.status).toBe(403);
    });
  });
});