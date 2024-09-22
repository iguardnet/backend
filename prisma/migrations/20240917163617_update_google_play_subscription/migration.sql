-- AlterTable
ALTER TABLE "GooglePlaySubscription" ALTER COLUMN "autoRenewing" DROP NOT NULL,
ALTER COLUMN "countryCode" DROP NOT NULL,
ALTER COLUMN "developerPayload" DROP NOT NULL,
ALTER COLUMN "kind" DROP NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "priceCurrencyCode" DROP NOT NULL,
ALTER COLUMN "acknowledgementState" DROP NOT NULL;
