/*
  Warnings:

  - You are about to drop the `GooglePlaySubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GooglePlaySubscription" DROP CONSTRAINT "GooglePlaySubscription_userId_fkey";

-- DropTable
DROP TABLE "GooglePlaySubscription";

-- CreateTable
CREATE TABLE "GoogleSubscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "purchaseToken" TEXT NOT NULL,
    "packageName" VARCHAR(255) NOT NULL,
    "subscriptionId" VARCHAR(255) NOT NULL,
    "kind" VARCHAR(255) NOT NULL,
    "startTimeMillis" TIMESTAMP(3) NOT NULL,
    "expiryTimeMillis" TIMESTAMP(3) NOT NULL,
    "autoResumeTimeMillis" TIMESTAMP(3),
    "autoRenewing" BOOLEAN NOT NULL,
    "priceCurrencyCode" VARCHAR(255) NOT NULL,
    "priceAmountMicros" BIGINT NOT NULL,
    "countryCode" VARCHAR(255) NOT NULL,
    "developerPayload" TEXT NOT NULL,
    "paymentState" INTEGER,
    "cancelReason" INTEGER,
    "userCancellationTimeMillis" TIMESTAMP(3),
    "orderId" VARCHAR(255) NOT NULL,
    "linkedPurchaseToken" TEXT,
    "purchaseType" INTEGER,
    "profileName" VARCHAR(255),
    "emailAddress" VARCHAR(255),
    "givenName" VARCHAR(255),
    "familyName" VARCHAR(255),
    "profileId" VARCHAR(255),
    "acknowledgementState" INTEGER NOT NULL,
    "externalAccountId" VARCHAR(255),
    "promotionType" INTEGER,
    "promotionCode" VARCHAR(255),
    "obfuscatedExternalAccountId" VARCHAR(255),
    "obfuscatedExternalProfileId" VARCHAR(255),

    CONSTRAINT "GoogleSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleSubscription_orderId_key" ON "GoogleSubscription"("orderId");

-- CreateIndex
CREATE INDEX "GooglePlaySubscriptionUserIdIndex" ON "GoogleSubscription"("userId");

-- CreateIndex
CREATE INDEX "GooglePlaySubscriptionExpiryTimeMillisIndex" ON "GoogleSubscription"("expiryTimeMillis");

-- AddForeignKey
ALTER TABLE "GoogleSubscription" ADD CONSTRAINT "GoogleSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
