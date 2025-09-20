-- CreateEnum
CREATE TYPE "AssignmentSourceType" AS ENUM ('MINISTRY', 'CULT');

-- CreateTable
CREATE TABLE "ScheduleRole" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ministryId" TEXT,
    "churchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverlapRule" (
    "id" TEXT NOT NULL,
    "fromRoleId" TEXT NOT NULL,
    "toRoleId" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,
    "churchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OverlapRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleAssignment" (
    "id" TEXT NOT NULL,
    "sourceType" "AssignmentSourceType" NOT NULL,
    "scheduleId" TEXT,
    "cultScheduleId" TEXT,
    "memberId" TEXT NOT NULL,
    "scheduleRoleId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "allowOverlap" BOOLEAN NOT NULL DEFAULT false,
    "churchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleMember" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "scheduleRoleId" TEXT,
    "churchId" TEXT NOT NULL,

    CONSTRAINT "ScheduleMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleRole_churchId_code_key" ON "ScheduleRole"("churchId", "code");

-- CreateIndex
CREATE INDEX "OverlapRule_fromRoleId_idx" ON "OverlapRule"("fromRoleId");

-- CreateIndex
CREATE INDEX "OverlapRule_toRoleId_idx" ON "OverlapRule"("toRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "OverlapRule_churchId_fromRoleId_toRoleId_key" ON "OverlapRule"("churchId", "fromRoleId", "toRoleId");

-- CreateIndex
CREATE INDEX "ScheduleAssignment_memberId_startAt_endAt_churchId_idx" ON "ScheduleAssignment"("memberId", "startAt", "endAt", "churchId");

-- CreateIndex
CREATE INDEX "ScheduleAssignment_scheduleId_idx" ON "ScheduleAssignment"("scheduleId");

-- CreateIndex
CREATE INDEX "ScheduleAssignment_cultScheduleId_idx" ON "ScheduleAssignment"("cultScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleMember_scheduleId_memberId_key" ON "ScheduleMember"("scheduleId", "memberId");

-- AddForeignKey
ALTER TABLE "ScheduleRole" ADD CONSTRAINT "ScheduleRole_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleRole" ADD CONSTRAINT "ScheduleRole_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlapRule" ADD CONSTRAINT "OverlapRule_fromRoleId_fkey" FOREIGN KEY ("fromRoleId") REFERENCES "ScheduleRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlapRule" ADD CONSTRAINT "OverlapRule_toRoleId_fkey" FOREIGN KEY ("toRoleId") REFERENCES "ScheduleRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlapRule" ADD CONSTRAINT "OverlapRule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_cultScheduleId_fkey" FOREIGN KEY ("cultScheduleId") REFERENCES "CultSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_scheduleRoleId_fkey" FOREIGN KEY ("scheduleRoleId") REFERENCES "ScheduleRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleAssignment" ADD CONSTRAINT "ScheduleAssignment_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMember" ADD CONSTRAINT "ScheduleMember_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMember" ADD CONSTRAINT "ScheduleMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMember" ADD CONSTRAINT "ScheduleMember_scheduleRoleId_fkey" FOREIGN KEY ("scheduleRoleId") REFERENCES "ScheduleRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleMember" ADD CONSTRAINT "ScheduleMember_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
