/*
  Warnings:

  - You are about to drop the column `googlePlaySubscriptionId` on the `GooglePlaySubscription` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `GooglePlaySubscription` table. All the data in the column will be lost.
  - You are about to alter the column `packageName` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `autoResumeTimeMillis` column on the `GooglePlaySubscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `countryCode` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `emailAddress` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `familyName` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `givenName` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `kind` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `orderId` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `priceCurrencyCode` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `profileId` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `profileName` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `promotionCode` on the `GooglePlaySubscription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `userCancellationTimeMillis` column on the `GooglePlaySubscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[orderId]` on the table `GooglePlaySubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `acknowledgementState` to the `GooglePlaySubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriptionId` to the `GooglePlaySubscription` table without a default value. This is not possible if the table is not empty.
  - Made the column `countryCode` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `developerPayload` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `expiryTimeMillis` on the `GooglePlaySubscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `kind` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `orderId` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priceAmountMicros` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priceCurrencyCode` on table `GooglePlaySubscription` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `startTimeMillis` on the `GooglePlaySubscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "GooglePlaySubscriptionGooglePlaySubscriptionIdIndex";

-- DropIndex
DROP INDEX "GooglePlaySubscriptionPackageNameIdProductIdIndex";

-- DropIndex
DROP INDEX "GooglePlaySubscription_googlePlaySubscriptionId_key";

-- DropIndex
DROP INDEX "GooglePlaySubscription_purchaseToken_key";

-- AlterTable
ALTER TABLE "GooglePlaySubscription" DROP COLUMN "googlePlaySubscriptionId",
DROP COLUMN "productId",
ADD COLUMN     "acknowledgementState" INTEGER NOT NULL,
ADD COLUMN     "externalAccountId" VARCHAR(255),
ADD COLUMN     "obfuscatedExternalAccountId" VARCHAR(255),
ADD COLUMN     "obfuscatedExternalProfileId" VARCHAR(255),
ADD COLUMN     "subscriptionId" VARCHAR(255) NOT NULL,
ALTER COLUMN "packageName" SET DATA TYPE VARCHAR(255),
DROP COLUMN "autoResumeTimeMillis",
ADD COLUMN     "autoResumeTimeMillis" TIMESTAMP(3),
ALTER COLUMN "countryCode" SET NOT NULL,
ALTER COLUMN "countryCode" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "developerPayload" SET NOT NULL,
ALTER COLUMN "emailAddress" SET DATA TYPE VARCHAR(255),
DROP COLUMN "expiryTimeMillis",
ADD COLUMN     "expiryTimeMillis" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "familyName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "givenName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "kind" SET NOT NULL,
ALTER COLUMN "kind" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "orderId" SET NOT NULL,
ALTER COLUMN "orderId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "priceAmountMicros" SET NOT NULL,
ALTER COLUMN "priceCurrencyCode" SET NOT NULL,
ALTER COLUMN "priceCurrencyCode" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "profileId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "profileName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "promotionCode" SET DATA TYPE VARCHAR(255),
DROP COLUMN "startTimeMillis",
ADD COLUMN     "startTimeMillis" TIMESTAMP(3) NOT NULL,
DROP COLUMN "userCancellationTimeMillis",
ADD COLUMN     "userCancellationTimeMillis" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "GooglePlaySubscription_orderId_key" ON "GooglePlaySubscription"("orderId");

-- CreateIndex
CREATE INDEX "GooglePlaySubscriptionUserIdIndex" ON "GooglePlaySubscription"("userId");

-- CreateIndex
CREATE INDEX "GooglePlaySubscriptionExpiryTimeMillisIndex" ON "GooglePlaySubscription"("expiryTimeMillis");
