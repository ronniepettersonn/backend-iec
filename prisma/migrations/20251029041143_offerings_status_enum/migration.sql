/*
  Warnings:

  - The `status` column on the `OfferingCount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OfferingStatus" AS ENUM ('draft', 'finalized');

-- AlterTable
ALTER TABLE "OfferingCount" DROP COLUMN "status",
ADD COLUMN     "status" "OfferingStatus" NOT NULL DEFAULT 'draft';
