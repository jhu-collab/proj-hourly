import supertest from "supertest";
import { it, expect, beforeAll, describe, afterAll, afterEach } from "vitest";
import app from "../../src/index.js";
import prisma from "../../prisma/client.js";
import { weekday } from "../../src/util/officeHourValidator.js";
import { Role } from "@prisma/client";
import { createToken } from "../../src/util/helpers.js";

/**
 * Per request from Ali, this file attempts to test situations relating to daylight savings (hopefully it's outlawed soon so
 * we don't have to deal with any of this).
 * 
 * Daylight Savings: https://www.timeanddate.com/time/dst/transition.html
 * Coordinated Universal Time (UTC): https://www.timeanddate.com/time/aboututc.html
 * 
 * Summary:
 *  - There are two different ways of measuring time:
 *    - Daylight Savings Time (DST)
 *    - Standard Time 
 *  - DST -> Standard Time
 *    - 2nd Sunday of March 01:59:59 -> 03:00:00
 *  - Standard Time -> DST
 *    - 1st Sunday of November 01:59:59 -> 01:00:00
 */

const request = supertest(app);

const endpoint = "/api/officeHour";

describe(`Test office hour creation and registration for daylight savings`, () => {
  
})