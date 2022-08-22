-- DropForeignKey
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_officeHourId_fkey";

-- AlterTable
ALTER TABLE "Registration" ALTER COLUMN "officeHourId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_officeHourId_fkey" FOREIGN KEY ("officeHourId") REFERENCES "OfficeHour"("id") ON DELETE SET NULL ON UPDATE CASCADE;
