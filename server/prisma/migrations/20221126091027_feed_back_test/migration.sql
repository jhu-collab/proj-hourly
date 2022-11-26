/*
  Warnings:

  - You are about to drop the `_receivedFeedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_receivedFeedback" DROP CONSTRAINT "_receivedFeedback_A_fkey";

-- DropForeignKey
ALTER TABLE "_receivedFeedback" DROP CONSTRAINT "_receivedFeedback_B_fkey";

-- DropTable
DROP TABLE "_receivedFeedback";
