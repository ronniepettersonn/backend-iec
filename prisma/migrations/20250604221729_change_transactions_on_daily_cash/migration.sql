/*
  Warnings:

  - You are about to drop the `_DailyCashToTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DailyCashToTransaction" DROP CONSTRAINT "_DailyCashToTransaction_A_fkey";

-- DropForeignKey
ALTER TABLE "_DailyCashToTransaction" DROP CONSTRAINT "_DailyCashToTransaction_B_fkey";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "dailyCashId" TEXT;

-- DropTable
DROP TABLE "_DailyCashToTransaction";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_dailyCashId_fkey" FOREIGN KEY ("dailyCashId") REFERENCES "DailyCash"("id") ON DELETE SET NULL ON UPDATE CASCADE;
