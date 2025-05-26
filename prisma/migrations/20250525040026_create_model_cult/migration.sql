-- CreateTable
CREATE TABLE "Cult" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "theme" TEXT,
    "preacher" TEXT,
    "location" TEXT,
    "totalPeople" INTEGER NOT NULL,
    "visitors" INTEGER NOT NULL,
    "children" INTEGER,
    "saved" INTEGER NOT NULL,
    "healed" INTEGER NOT NULL,
    "holySpiritBaptisms" INTEGER NOT NULL,
    "tithesAmount" DOUBLE PRECISION NOT NULL,
    "tithesCount" INTEGER NOT NULL,
    "offeringsAmount" DOUBLE PRECISION NOT NULL,
    "offeringsCount" INTEGER NOT NULL,
    "designatedOfferings" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cult_pkey" PRIMARY KEY ("id")
);
