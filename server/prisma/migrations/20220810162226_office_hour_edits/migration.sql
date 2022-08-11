/*
  Warnings:

  - You are about to drop the column `courseId` on the `Registration` table. All the data in the column will be lost.
  - Made the column `officeHourId` on table `Registration` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_officeHourId_fkey";

-- AlterTable
ALTER TABLE "OfficeHour" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "courseId",
ADD COLUMN     "isCancelledStaff" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isCancelled" SET DEFAULT false,
ALTER COLUMN "officeHourId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_officeHourId_fkey" FOREIGN KEY ("officeHourId") REFERENCES "OfficeHour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
