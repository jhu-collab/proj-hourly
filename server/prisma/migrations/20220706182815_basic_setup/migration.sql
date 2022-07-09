/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "courseNumber" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "calendarYear" INTEGER NOT NULL,
    "code" CHAR(6) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeHour" (
    "id" SERIAL NOT NULL,
    "startTime" TIMETZ NOT NULL,
    "endTime" TIMETZ NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "timePerStudent" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL,
    "isCancelledOn" DATE[],

    CONSTRAINT "OfficeHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numberToDayOfWeek" (
    "dayNumber" INTEGER NOT NULL,
    "dayOfWeek" TEXT NOT NULL,

    CONSTRAINT "numberToDayOfWeek_pkey" PRIMARY KEY ("dayNumber")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" SERIAL NOT NULL,
    "startTime" TIMETZ NOT NULL,
    "endTime" TIMETZ NOT NULL,
    "date" DATE NOT NULL,
    "isCancelled" BOOLEAN NOT NULL,
    "officeHourId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "question" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_isStudent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_isStaff" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_isInstructor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_isHost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_isOnDayOfWeek" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_withTopics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_phoneNumber_key" ON "Account"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "numberToDayOfWeek_dayNumber_key" ON "numberToDayOfWeek"("dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "numberToDayOfWeek_dayOfWeek_key" ON "numberToDayOfWeek"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "_isStudent_AB_unique" ON "_isStudent"("A", "B");

-- CreateIndex
CREATE INDEX "_isStudent_B_index" ON "_isStudent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_isStaff_AB_unique" ON "_isStaff"("A", "B");

-- CreateIndex
CREATE INDEX "_isStaff_B_index" ON "_isStaff"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_isInstructor_AB_unique" ON "_isInstructor"("A", "B");

-- CreateIndex
CREATE INDEX "_isInstructor_B_index" ON "_isInstructor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_isHost_AB_unique" ON "_isHost"("A", "B");

-- CreateIndex
CREATE INDEX "_isHost_B_index" ON "_isHost"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_isOnDayOfWeek_AB_unique" ON "_isOnDayOfWeek"("A", "B");

-- CreateIndex
CREATE INDEX "_isOnDayOfWeek_B_index" ON "_isOnDayOfWeek"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_withTopics_AB_unique" ON "_withTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_withTopics_B_index" ON "_withTopics"("B");

-- AddForeignKey
ALTER TABLE "OfficeHour" ADD CONSTRAINT "OfficeHour_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_officeHourId_fkey" FOREIGN KEY ("officeHourId") REFERENCES "OfficeHour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isStudent" ADD CONSTRAINT "_isStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isStudent" ADD CONSTRAINT "_isStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isStaff" ADD CONSTRAINT "_isStaff_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isStaff" ADD CONSTRAINT "_isStaff_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isInstructor" ADD CONSTRAINT "_isInstructor_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isInstructor" ADD CONSTRAINT "_isInstructor_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isHost" ADD CONSTRAINT "_isHost_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isHost" ADD CONSTRAINT "_isHost_B_fkey" FOREIGN KEY ("B") REFERENCES "OfficeHour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isOnDayOfWeek" ADD CONSTRAINT "_isOnDayOfWeek_A_fkey" FOREIGN KEY ("A") REFERENCES "OfficeHour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isOnDayOfWeek" ADD CONSTRAINT "_isOnDayOfWeek_B_fkey" FOREIGN KEY ("B") REFERENCES "numberToDayOfWeek"("dayNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_withTopics" ADD CONSTRAINT "_withTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_withTopics" ADD CONSTRAINT "_withTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "numberToDayOfWeek" VALUES (1, 'Monday');
INSERT INTO "numberToDayOfWeek" VALUES (2, 'Tuesday');
INSERT INTO "numberToDayOfWeek" VALUES (3, 'Wednesday');
INSERT INTO "numberToDayOfWeek" VALUES (4, 'Thursday');
INSERT INTO "numberToDayOfWeek" VALUES (5, 'Friday');
INSERT INTO "numberToDayOfWeek" VALUES (6, 'Saturday');
INSERT INTO "numberToDayOfWeek" VALUES (7, 'Sunday');
