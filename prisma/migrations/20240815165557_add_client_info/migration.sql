-- CreateTable
CREATE TABLE "ClientInfo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "android" JSONB,
    "ios" JSONB,

    CONSTRAINT "ClientInfo_pkey" PRIMARY KEY ("id")
);
