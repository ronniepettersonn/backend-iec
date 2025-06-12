/*
  Warnings:

  - You are about to drop the column `preacher` on the `Cult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cult" DROP COLUMN "preacher",
ADD COLUMN     "directorId" TEXT,
ADD COLUMN     "preacherId" TEXT;

-- CreateTable
CREATE TABLE "_CultToMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CultToMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CultToMember_B_index" ON "_CultToMember"("B");

-- AddForeignKey
ALTER TABLE "Cult" ADD CONSTRAINT "Cult_preacherId_fkey" FOREIGN KEY ("preacherId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cult" ADD CONSTRAINT "Cult_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CultToMember" ADD CONSTRAINT "_CultToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "Cult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CultToMember" ADD CONSTRAINT "_CultToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
