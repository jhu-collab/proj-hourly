/*
  Warnings:

  - You are about to drop the column `agendaDescrip` on the `CalendarEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "agendaDescrip",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
