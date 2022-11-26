/*
  Warnings:

  - You are about to drop the `_givenFeedback` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `studentId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_givenFeedback" DROP CONSTRAINT "_givenFeedback_A_fkey";

-- DropForeignKey
ALTER TABLE "_givenFeedback" DROP CONSTRAINT "_givenFeedback_B_fkey";

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "studentId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_givenFeedback";

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
