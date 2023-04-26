import prisma from "../prisma/client.js";
const debug = require("debug");

export async function setup() {
  debug.disable();
  console.log("Database Cleared!");
  await prisma.registration.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.officeHour.deleteMany();
  await prisma.officeHourTimeOptions.deleteMany();
  await prisma.course.deleteMany();
  await prisma.account.deleteMany();
};

export async function teardown() {
  debug.enable();
}