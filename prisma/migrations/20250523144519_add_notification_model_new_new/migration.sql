-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "location" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "locationLabel" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'info',
ADD COLUMN     "type" INTEGER NOT NULL DEFAULT 1;
