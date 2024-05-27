-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "tokenCreatedAt" TIMESTAMP(3);
