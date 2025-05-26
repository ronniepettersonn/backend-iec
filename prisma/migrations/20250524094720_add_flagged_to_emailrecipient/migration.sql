/*
  Warnings:

  - A unique constraint covering the columns `[emailId,userId]` on the table `EmailRecipient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EmailRecipient" ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "EmailRecipient_emailId_userId_key" ON "EmailRecipient"("emailId", "userId");
