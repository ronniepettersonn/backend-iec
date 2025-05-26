/*
  Warnings:

  - You are about to drop the `_AppointmentToMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AppointmentToMember" DROP CONSTRAINT "_AppointmentToMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppointmentToMember" DROP CONSTRAINT "_AppointmentToMember_B_fkey";

-- DropTable
DROP TABLE "_AppointmentToMember";

-- CreateTable
CREATE TABLE "AppointmentMember" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "AppointmentMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentMember_appointmentId_memberId_key" ON "AppointmentMember"("appointmentId", "memberId");

-- AddForeignKey
ALTER TABLE "AppointmentMember" ADD CONSTRAINT "AppointmentMember_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentMember" ADD CONSTRAINT "AppointmentMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
