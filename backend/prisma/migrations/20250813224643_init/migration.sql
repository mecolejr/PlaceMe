-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "crimeRate" DOUBLE PRECISION,
    "hateCrimeIndex" DOUBLE PRECISION,
    "diversityIndex" DOUBLE PRECISION,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);
