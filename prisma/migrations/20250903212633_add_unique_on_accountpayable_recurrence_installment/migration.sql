/*
  Warnings:

  - A unique constraint covering the columns `[recurrenceId,installmentNumber]` on the table `AccountPayable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccountPayable_recurrenceId_installmentNumber_key" ON "AccountPayable"("recurrenceId", "installmentNumber");
