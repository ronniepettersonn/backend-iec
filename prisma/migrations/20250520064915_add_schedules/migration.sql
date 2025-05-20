-- CreateTable
CREATE TABLE "_ScheduleMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ScheduleMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ScheduleMembers_B_index" ON "_ScheduleMembers"("B");

-- AddForeignKey
ALTER TABLE "_ScheduleMembers" ADD CONSTRAINT "_ScheduleMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleMembers" ADD CONSTRAINT "_ScheduleMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
