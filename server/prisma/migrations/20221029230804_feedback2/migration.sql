/*
  Warnings:

  - You are about to drop the column `courseId` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `registrationId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_courseId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "courseId",
ADD COLUMN     "registrationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
