-- CreateIndex
CREATE INDEX "GoogleSubscriptionCompositeIndex" ON "GoogleSubscription"("paymentState", "cancelReason", "expiryTimeMillis");
