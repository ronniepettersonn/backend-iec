-- CreateTable
CREATE TABLE "CultSchedule" (
    "id" TEXT NOT NULL,
    "cultId" TEXT NOT NULL,
    "preacherId" TEXT,
    "directorId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CultSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CultSchedule" ADD CONSTRAINT "CultSchedule_cultId_fkey" FOREIGN KEY ("cultId") REFERENCES "Cult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultSchedule" ADD CONSTRAINT "CultSchedule_preacherId_fkey" FOREIGN KEY ("preacherId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultSchedule" ADD CONSTRAINT "CultSchedule_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
