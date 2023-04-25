import supertest from "supertest";
import { test, expect, describe } from "vitest";
import app from "../../src/index.js";
import { Prisma } from "@prisma/client";
import { isPrismaError } from "../../src/util/helpers.js";

const request = supertest(app);
const filename = "helpers.test.js";

// test.skip( /*  to skip this test */ )
// test.only( /*  to only run this test */ )
describe(`Test file "${filename}"`, () => {
  describe('Test method "isPrismaError"', () => {
    test("Return true for error instance of PrismaClientKnownRequestError", () => {
      /* TODO: COMPLETE */
    });

    test("Return true for error instance of PrismaClientUnknownRequestError", () => {
      /* TODO: COMPLETE */
    });

    test("Return true for error instance of PrismaClientRustPanicError", () => {
      expect(isPrismaError(new Prisma.PrismaClientRustPanicError())).toBe(true);
    });

    test("Return true for error instance of PrismaClientInitializationError", () => {
      expect(isPrismaError(new Prisma.PrismaClientInitializationError())).toBe(
        true
      );
    });

    test("Return true for error instance of PrismaClientValidationError", () => {
      expect(isPrismaError(new Prisma.PrismaClientValidationError())).toBe(
        true
      );
    });

    test("Return false for all other error instances", () => {
      expect(isPrismaError(new Error())).toBe(false);
      expect(isPrismaError(new RangeError())).toBe(false);
      expect(isPrismaError(new ReferenceError())).toBe(false);
      expect(isPrismaError(new SyntaxError())).toBe(false);
      expect(isPrismaError(new TypeError())).toBe(false);
      expect(isPrismaError(new URIError())).toBe(false);
    });
  });

  describe('Test method "prismaErrorToHttpError"', () => {
    /* Should be covered by API Testing (?) */
  });

  describe('Test method "createToken"', () => {
    /* Should be covered by API Testing (?) */
  });

  describe('Test method "createTimeString"', () => {
    /* Not used anywhere in the codebase */
  });

  describe('Test method "computeDiff"', () => {
    /* Not used anywhere in the codebase */
  });

  describe('Test method "handleUTCDateChange"', () => {
    /* Used in validator only so should be tested during API Testing */
  });
});
