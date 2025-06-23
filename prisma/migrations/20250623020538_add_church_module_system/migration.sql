-- AlterTable
ALTER TABLE "User" ADD COLUMN     "churchId" TEXT;

-- CreateTable
CREATE TABLE "Church" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurchModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveModule" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Church_slug_key" ON "Church"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ChurchModule_key_key" ON "ChurchModule"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveModule_churchId_moduleId_key" ON "ActiveModule"("churchId", "moduleId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveModule" ADD CONSTRAINT "ActiveModule_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveModule" ADD CONSTRAINT "ActiveModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ChurchModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
