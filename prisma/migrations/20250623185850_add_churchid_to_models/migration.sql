-- AlterTable
ALTER TABLE "AccountPayable" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "AccountReceivable" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Cult" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "CultSchedule" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "CultType" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "DailyCash" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Ministry" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "PostCategory" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "PostTag" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Recurrence" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "RolePermission" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "churchId" TEXT;

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "churchId" TEXT;

-- CreateTable
CREATE TABLE "_ChurchToEmail" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChurchToEmail_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChurchToEmail_B_index" ON "_ChurchToEmail"("B");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ministry" ADD CONSTRAINT "Ministry_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cult" ADD CONSTRAINT "Cult_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultType" ADD CONSTRAINT "CultType_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultSchedule" ADD CONSTRAINT "CultSchedule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrence" ADD CONSTRAINT "Recurrence_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCash" ADD CONSTRAINT "DailyCash_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPayable" ADD CONSTRAINT "AccountPayable_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCategory" ADD CONSTRAINT "PostCategory_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChurchToEmail" ADD CONSTRAINT "_ChurchToEmail_A_fkey" FOREIGN KEY ("A") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChurchToEmail" ADD CONSTRAINT "_ChurchToEmail_B_fkey" FOREIGN KEY ("B") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
