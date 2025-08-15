-- CreateTable
CREATE TABLE "HateCrime" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "biasType" TEXT NOT NULL,
    "incidents" INTEGER NOT NULL,

    CONSTRAINT "HateCrime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrimeStats" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "violentRate" DOUBLE PRECISION,
    "propertyRate" DOUBLE PRECISION,

    CONSTRAINT "CrimeStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demographics" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "diversity" DOUBLE PRECISION,
    "groupShares" JSONB,

    CONSTRAINT "Demographics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HateCrime_locationId_biasType_key" ON "HateCrime"("locationId", "biasType");

-- CreateIndex
CREATE UNIQUE INDEX "CrimeStats_locationId_key" ON "CrimeStats"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Demographics_locationId_key" ON "Demographics"("locationId");

-- AddForeignKey
ALTER TABLE "HateCrime" ADD CONSTRAINT "HateCrime_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeStats" ADD CONSTRAINT "CrimeStats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demographics" ADD CONSTRAINT "Demographics_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "name_state" RENAME TO "Location_name_state_key";
