/*
  Warnings:

  - You are about to drop the column `feedback` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Registration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Registration" DROP COLUMN "feedback",
DROP COLUMN "rating",
ADD COLUMN     "hasFeedback" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "officeHourId" INTEGER NOT NULL,
    "feedbackRating" INTEGER NOT NULL,
    "feedbackComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_officeHourId_fkey" FOREIGN KEY ("officeHourId") REFERENCES "OfficeHour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
