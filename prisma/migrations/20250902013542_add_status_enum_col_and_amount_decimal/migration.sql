/*
  Warnings:

  - You are about to alter the column `amount` on the `Recurrence` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.

*/

-- AlterTable
ALTER TABLE "Recurrence" ADD COLUMN     "frequency_new" "RecurrenceFrequency",
ADD COLUMN     "paidInstallments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status_new" "RecurrenceStatus",
ADD COLUMN     "totalInstallments" INTEGER,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(14,2);

-- CreateIndex
CREATE INDEX "Recurrence_churchId_idx" ON "Recurrence"("churchId");
