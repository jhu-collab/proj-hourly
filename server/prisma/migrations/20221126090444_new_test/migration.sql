/*
  Warnings:

  - You are about to drop the column `courseId` on the `Flag` table. All the data in the column will be lost.
  - You are about to drop the `_Flagged` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_isFlagged` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `staffId` to the `Flag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Flag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `Flag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Flag" DROP CONSTRAINT "Flag_courseId_fkey";

-- DropForeignKey
ALTER TABLE "_Flagged" DROP CONSTRAINT "_Flagged_A_fkey";

-- DropForeignKey
ALTER TABLE "_Flagged" DROP CONSTRAINT "_Flagged_B_fkey";

-- DropForeignKey
ALTER TABLE "_isFlagged" DROP CONSTRAINT "_isFlagged_A_fkey";

-- DropForeignKey
ALTER TABLE "_isFlagged" DROP CONSTRAINT "_isFlagged_B_fkey";

-- AlterTable
ALTER TABLE "Flag" DROP COLUMN "courseId",
ADD COLUMN     "staffId" INTEGER NOT NULL,
ADD COLUMN     "studentId" INTEGER NOT NULL,
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_Flagged";

-- DropTable
DROP TABLE "_isFlagged";

-- CreateTable
CREATE TABLE "FlagType" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "FlagType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlagType" ADD CONSTRAINT "FlagType_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "FlagType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
