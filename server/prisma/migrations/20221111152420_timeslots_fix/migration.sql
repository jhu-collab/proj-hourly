/*
  Warnings:

  - You are about to drop the column `endTime` on the `OfficeHour` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `OfficeHour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OfficeHour" DROP COLUMN "endTime",
DROP COLUMN "startTime";
