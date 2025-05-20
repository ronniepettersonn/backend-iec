-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "contactNotes" TEXT,
ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "contactedById" TEXT,
ADD COLUMN     "wasContacted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_contactedById_fkey" FOREIGN KEY ("contactedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
