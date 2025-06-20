/*
  Warnings:

  - You are about to drop the column `role` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "role";

-- CreateTable
CREATE TABLE "MemberRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "MemberRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MemberRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberRole_name_key" ON "MemberRole"("name");

-- CreateIndex
CREATE INDEX "_MemberRoles_B_index" ON "_MemberRoles"("B");

-- AddForeignKey
ALTER TABLE "_MemberRoles" ADD CONSTRAINT "_MemberRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberRoles" ADD CONSTRAINT "_MemberRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "MemberRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
