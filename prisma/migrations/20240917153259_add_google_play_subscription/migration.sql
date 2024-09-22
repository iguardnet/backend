-- CreateTable
CREATE TABLE "GooglePlaySubscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "googlePlaySubscriptionId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseToken" TEXT NOT NULL,
    "autoRenewing" BOOLEAN NOT NULL,
    "autoResumeTimeMillis" BIGINT,
    "cancelReason" INTEGER,
    "countryCode" TEXT,
    "developerPayload" TEXT,
    "emailAddress" TEXT,
    "expiryTimeMillis" BIGINT NOT NULL,
    "familyName" TEXT,
    "givenName" TEXT,
    "kind" TEXT,
    "linkedPurchaseToken" TEXT,
    "orderId" TEXT,
    "paymentState" INTEGER,
    "priceAmountMicros" BIGINT,
    "priceCurrencyCode" TEXT,
    "profileId" TEXT,
    "profileName" TEXT,
    "promotionCode" TEXT,
    "promotionType" INTEGER,
    "purchaseType" INTEGER,
    "startTimeMillis" BIGINT NOT NULL,
    "userCancellationTimeMillis" BIGINT,

    CONSTRAINT "GooglePlaySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GooglePlaySubscription_googlePlaySubscriptionId_key" ON "GooglePlaySubscription"("googlePlaySubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "GooglePlaySubscription_purchaseToken_key" ON "GooglePlaySubscription"("purchaseToken");

-- CreateIndex
CREATE INDEX "GooglePlaySubscriptionGooglePlaySubscriptionIdIndex" ON "GooglePlaySubscription"("googlePlaySubscriptionId");

-- CreateIndex
CREATE INDEX "GooglePlaySubscriptionPackageNameIdProductIdIndex" ON "GooglePlaySubscription"("packageName", "productId");

-- CreateIndex
CREATE INDEX "GooglePlaySubscriptionExpiryTimeMillisIndex" ON "GooglePlaySubscription"("expiryTimeMillis");

-- AddForeignKey
ALTER TABLE "GooglePlaySubscription" ADD CONSTRAINT "GooglePlaySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
