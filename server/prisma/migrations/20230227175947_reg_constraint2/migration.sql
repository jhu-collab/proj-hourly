/*
  Warnings:

  - You are about to drop the column `endRegContraint` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "endRegContraint",
ADD COLUMN     "endRegConstraint" INTEGER NOT NULL DEFAULT 48;
