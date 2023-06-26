-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "iCalJsonCalEvent" JSONB;

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "courseId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "agendaDescrip" TEXT NOT NULL DEFAULT '',
    "additionalInfo" TEXT,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_courseId_date_key" ON "CalendarEvent"("courseId", "date");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
