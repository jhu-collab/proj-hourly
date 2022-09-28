/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `Account` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'User');

-- DropIndex
DROP INDEX "Account_phoneNumber_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "phoneNumber",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "preferredName" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'User',
ADD COLUMN     "token" TEXT;
