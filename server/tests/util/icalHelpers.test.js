import supertest from "supertest";
import { test, expect, beforeEach, describe, afterEach } from "vitest";
import app from "../../src/index.js";
import { Prisma } from "@prisma/client";

const request = supertest(app);
const filename = "icalHelpers.test.js";

// test.skip( /*  to skip this test */ )
// test.only( /*  to only run this test */ )
describe(`Test file "${filename}"`, () => {
  describe('Test method "getExpectedDate"', () => {
    /* Not used anywhere in the codebase */
  });

  describe('Test method "getIsoDate"', () => {
    /* Used by a method which is not used anywhere in the codebase */
  });

  describe('Test method "generateTitle"', () => {});

  describe('Test method "getDateStringArray"', () => {
    /* Not used anywhere in the codebase */
  });

  describe('Test method "combineTimeAndDate"', () => {
    /* Not used anywhere in the codebase */
  });

  describe('Test method "calcDurationString"', () => {
    /* Not used anywhere in the codebase */
  });

  describe('Test method "calcTimeString"', () => {
    /* Used by a method which is not used anywhere in the codebase */
  });

  describe('Test method "convertToDateWithStartTime"', () => {
    /* Not used anywhere in the codebase */
  });

  describe('Test method "equalDates"', () => {});

  describe('Test method "generateRecurringEventJson"', () => {});

  describe('Test method "generateSingleEventJson"', () => {});

  describe('Test method "generateCalendar"', () => {});
});
