/*
  Warnings:

  - You are about to drop the column `type` on the `Cult` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `Cult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cult" DROP COLUMN "type",
ADD COLUMN     "typeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CultType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CultType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CultType_name_key" ON "CultType"("name");

-- AddForeignKey
ALTER TABLE "Cult" ADD CONSTRAINT "Cult_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CultType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
