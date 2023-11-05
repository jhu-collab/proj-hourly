/*
  Warnings:

  - Added the required column `officeHourTimeOptionId` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "officeHourTimeOptionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_officeHourTimeOptionId_fkey" FOREIGN KEY ("officeHourTimeOptionId") REFERENCES "OfficeHourTimeOptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
