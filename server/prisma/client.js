import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === "development") global.prisma = prisma;
// A server application should generally only create one instance of PrismaClient.
// Why? Read these!
// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/instantiate-prisma-client
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#re-using-a-single-prismaclient-instance

export default prisma;
