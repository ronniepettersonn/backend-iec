/*
  Warnings:

  - You are about to drop the column `visitors` on the `Cult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cult" DROP COLUMN "visitors";

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "cultId" TEXT;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_cultId_fkey" FOREIGN KEY ("cultId") REFERENCES "Cult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
