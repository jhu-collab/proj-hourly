/*
  Warnings:

  - You are about to drop the column `timePerStudent` on the `OfficeHour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OfficeHour" DROP COLUMN "timePerStudent";

-- CreateTable
CREATE TABLE "OfficeHourTimeOptions" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 10,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "OfficeHourTimeOptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OfficeHourTimeOptions" ADD CONSTRAINT "OfficeHourTimeOptions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
