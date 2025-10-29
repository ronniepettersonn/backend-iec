-- CreateEnum
CREATE TYPE "OfferingItemKind" AS ENUM ('NOTE', 'COIN');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SUNDAY', 'THURSDAY', 'SATURDAY', 'OTHER');

-- CreateTable
CREATE TABLE "OfferingCount" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "sealNumber" TEXT,
    "envelopes" INTEGER NOT NULL DEFAULT 0,
    "notesTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "coinsTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "titheShare15" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferingCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferingItem" (
    "id" TEXT NOT NULL,
    "offeringCountId" TEXT NOT NULL,
    "kind" "OfferingItemKind" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "OfferingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferingSignature" (
    "id" TEXT NOT NULL,
    "offeringCountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "hash" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferingSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferingCount_churchId_serviceDate_idx" ON "OfferingCount"("churchId", "serviceDate");

-- CreateIndex
CREATE INDEX "OfferingItem_offeringCountId_kind_value_idx" ON "OfferingItem"("offeringCountId", "kind", "value");

-- CreateIndex
CREATE UNIQUE INDEX "OfferingItem_offeringCountId_kind_value_key" ON "OfferingItem"("offeringCountId", "kind", "value");

-- CreateIndex
CREATE UNIQUE INDEX "OfferingSignature_offeringCountId_userId_key" ON "OfferingSignature"("offeringCountId", "userId");

-- AddForeignKey
ALTER TABLE "OfferingItem" ADD CONSTRAINT "OfferingItem_offeringCountId_fkey" FOREIGN KEY ("offeringCountId") REFERENCES "OfferingCount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferingSignature" ADD CONSTRAINT "OfferingSignature_offeringCountId_fkey" FOREIGN KEY ("offeringCountId") REFERENCES "OfferingCount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
