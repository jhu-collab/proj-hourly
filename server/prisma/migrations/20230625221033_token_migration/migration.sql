-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "usesTokens" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CourseToken" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "courseId" INTEGER NOT NULL,
    "tokenLimit" INTEGER NOT NULL,

    CONSTRAINT "CourseToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueToken" (
    "id" SERIAL NOT NULL,
    "datesUsed" TIMESTAMP(3)[],
    "accountId" INTEGER NOT NULL,
    "courseTokenId" INTEGER NOT NULL,

    CONSTRAINT "IssueToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseToken" ADD CONSTRAINT "CourseToken_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueToken" ADD CONSTRAINT "IssueToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueToken" ADD CONSTRAINT "IssueToken_courseTokenId_fkey" FOREIGN KEY ("courseTokenId") REFERENCES "CourseToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
