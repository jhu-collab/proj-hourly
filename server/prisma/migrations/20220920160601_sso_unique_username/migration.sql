/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Account_userName_key" ON "Account"("userName");
