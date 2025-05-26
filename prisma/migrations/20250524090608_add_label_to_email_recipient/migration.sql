-- AlterTable
ALTER TABLE "EmailRecipient" ADD COLUMN     "label" TEXT,
ALTER COLUMN "group" DROP DEFAULT;
