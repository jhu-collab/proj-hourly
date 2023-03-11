-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "emailReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminderInterval" INTEGER DEFAULT 30;
