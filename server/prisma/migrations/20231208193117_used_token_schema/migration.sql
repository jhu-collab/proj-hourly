-- CreateTable
CREATE TABLE "UsedToken" (
    "id" SERIAL NOT NULL,
    "issueTokenId" INTEGER NOT NULL,
    "appliedById" INTEGER NOT NULL,
    "unDoneById" INTEGER,
    "reason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsedToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsedToken" ADD CONSTRAINT "UsedToken_issueTokenId_fkey" FOREIGN KEY ("issueTokenId") REFERENCES "IssueToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedToken" ADD CONSTRAINT "UsedToken_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedToken" ADD CONSTRAINT "UsedToken_unDoneById_fkey" FOREIGN KEY ("unDoneById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
