-- DropIndex
DROP INDEX "user_roles_gin_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "roles" DROP DEFAULT;
