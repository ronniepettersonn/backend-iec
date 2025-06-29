-- CreateEnum
CREATE TYPE "ChurchStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'AWAITING_APPROVAL');

-- AlterTable
ALTER TABLE "Church" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "ChurchStatus" NOT NULL DEFAULT 'ACTIVE';
