/*
  Warnings:

  - Made the column `churchId` on table `AccountPayable` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `AccountReceivable` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Appointment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Cult` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `CultSchedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `CultType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `DailyCash` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `LogEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Member` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Ministry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Notice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Permission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Post` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `PostCategory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `PostComment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `PostTag` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Recurrence` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `RolePermission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `churchId` on table `Visitor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AccountPayable" DROP CONSTRAINT "AccountPayable_churchId_fkey";

-- DropForeignKey
ALTER TABLE "AccountReceivable" DROP CONSTRAINT "AccountReceivable_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Cult" DROP CONSTRAINT "Cult_churchId_fkey";

-- DropForeignKey
ALTER TABLE "CultSchedule" DROP CONSTRAINT "CultSchedule_churchId_fkey";

-- DropForeignKey
ALTER TABLE "CultType" DROP CONSTRAINT "CultType_churchId_fkey";

-- DropForeignKey
ALTER TABLE "DailyCash" DROP CONSTRAINT "DailyCash_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_churchId_fkey";

-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Ministry" DROP CONSTRAINT "Ministry_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Notice" DROP CONSTRAINT "Notice_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_churchId_fkey";

-- DropForeignKey
ALTER TABLE "PostCategory" DROP CONSTRAINT "PostCategory_churchId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_churchId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Recurrence" DROP CONSTRAINT "Recurrence_churchId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_churchId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_churchId_fkey";

-- DropForeignKey
ALTER TABLE "Visitor" DROP CONSTRAINT "Visitor_churchId_fkey";

-- AlterTable
ALTER TABLE "AccountPayable" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "AccountReceivable" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Cult" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CultSchedule" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "CultType" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "DailyCash" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LogEntry" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ministry" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Notice" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PostCategory" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PostComment" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PostTag" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Recurrence" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "RolePermission" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "churchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Visitor" ALTER COLUMN "churchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ministry" ADD CONSTRAINT "Ministry_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cult" ADD CONSTRAINT "Cult_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultType" ADD CONSTRAINT "CultType_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultSchedule" ADD CONSTRAINT "CultSchedule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrence" ADD CONSTRAINT "Recurrence_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCash" ADD CONSTRAINT "DailyCash_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
