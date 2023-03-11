-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "endRegContraint" INTEGER NOT NULL DEFAULT 48,
ADD COLUMN     "startRegConstraint" INTEGER NOT NULL DEFAULT 2;
