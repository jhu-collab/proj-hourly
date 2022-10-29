-- CreateTable
CREATE TABLE "Flag" (
    "id" SERIAL NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_isFlagged" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Flagged" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_isFlagged_AB_unique" ON "_isFlagged"("A", "B");

-- CreateIndex
CREATE INDEX "_isFlagged_B_index" ON "_isFlagged"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Flagged_AB_unique" ON "_Flagged"("A", "B");

-- CreateIndex
CREATE INDEX "_Flagged_B_index" ON "_Flagged"("B");

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isFlagged" ADD CONSTRAINT "_isFlagged_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_isFlagged" ADD CONSTRAINT "_isFlagged_B_fkey" FOREIGN KEY ("B") REFERENCES "Flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Flagged" ADD CONSTRAINT "_Flagged_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Flagged" ADD CONSTRAINT "_Flagged_B_fkey" FOREIGN KEY ("B") REFERENCES "Flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
