/*
  Warnings:

  - Made the column `autoRenewing` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `countryCode` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `developerPayload` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kind` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orderId` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priceCurrencyCode` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acknowledgementState` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GooglePlaySubscription" ALTER COLUMN "autoRenewing" SET NOT NULL,
ALTER COLUMN "countryCode" SET NOT NULL,
ALTER COLUMN "developerPayload" SET NOT NULL,
ALTER COLUMN "kind" SET NOT NULL,
ALTER COLUMN "orderId" SET NOT NULL,
ALTER COLUMN "priceCurrencyCode" SET NOT NULL,
ALTER COLUMN "acknowledgementState" SET NOT NULL;
