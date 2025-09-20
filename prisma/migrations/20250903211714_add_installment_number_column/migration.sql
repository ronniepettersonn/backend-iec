/*
  Warnings:

  - Made the column `frequency` on table `Recurrence` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AccountPayable" ADD COLUMN     "installmentNumber" INTEGER;

-- AlterTable
ALTER TABLE "Recurrence" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "frequency" SET NOT NULL;
