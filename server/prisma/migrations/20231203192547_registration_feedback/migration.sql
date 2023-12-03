/*
  Warnings:

  - You are about to drop the column `feedback` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Registration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "feedback",
DROP COLUMN "rating",
ADD COLUMN     "feedbackComment" INTEGER,
ADD COLUMN     "feedbackRating" TEXT;
