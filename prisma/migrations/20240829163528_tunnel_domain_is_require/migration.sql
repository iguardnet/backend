/*
  Warnings:

  - Made the column `tunnelDomain` on table `Server` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Server" ALTER COLUMN "tunnelDomain" SET NOT NULL;
