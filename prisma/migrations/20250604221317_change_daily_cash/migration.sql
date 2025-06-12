-- DropForeignKey
ALTER TABLE "DailyCash" DROP CONSTRAINT "DailyCash_createdById_fkey";

-- AlterTable
ALTER TABLE "DailyCash" ALTER COLUMN "createdById" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_DailyCashToTransaction" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DailyCashToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DailyCashToTransaction_B_index" ON "_DailyCashToTransaction"("B");

-- AddForeignKey
ALTER TABLE "_DailyCashToTransaction" ADD CONSTRAINT "_DailyCashToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "DailyCash"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyCashToTransaction" ADD CONSTRAINT "_DailyCashToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
