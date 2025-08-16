/*
  Warnings:

  - Added the required column `updatedAt` to the `CrimeStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Demographics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HateCrime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CrimeStats" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Demographics" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HateCrime" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
