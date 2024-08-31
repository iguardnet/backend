-- CreateEnum
CREATE TYPE "ServerCountry" AS ENUM ('IR', 'NL', 'DE', 'TR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastTotalUsage" BIGINT;

-- CreateTable
CREATE TABLE "Server" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "type" "ServerCountry" NOT NULL,
    "ip" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "inboundId" INTEGER NOT NULL DEFAULT 1,
    "token" VARCHAR(255) NOT NULL,
    "tunnelDomain" VARCHAR(255),
    "stats" JSONB,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientStat" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "serverId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lastTotalUsage" BIGINT,
    "lastConnectedAt" TIMESTAMP(3),
    "expiryTime" BIGINT NOT NULL,
    "total" BIGINT NOT NULL,
    "down" BIGINT NOT NULL,
    "up" BIGINT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "enable" BOOLEAN NOT NULL,
    "flow" VARCHAR(255) NOT NULL,
    "subId" VARCHAR(255) NOT NULL,
    "tgId" VARCHAR(255) NOT NULL,
    "limitIp" INTEGER NOT NULL,

    CONSTRAINT "ClientStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_ip_key" ON "Server"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "Server_domain_key" ON "Server"("domain");

-- CreateIndex
CREATE INDEX "ClientStatServerIdIndex" ON "ClientStat"("serverId");

-- CreateIndex
CREATE INDEX "ClientStatUserIdIndex" ON "ClientStat"("userId");

-- CreateIndex
CREATE INDEX "ClientStatExpiryTimeIndex" ON "ClientStat"("expiryTime");

-- CreateIndex
CREATE INDEX "ClientStatTotalIndex" ON "ClientStat"("total");

-- CreateIndex
CREATE INDEX "ClientStatDownIndex" ON "ClientStat"("down");

-- CreateIndex
CREATE INDEX "ClientStatUpIndex" ON "ClientStat"("up");

-- CreateIndex
CREATE INDEX "ClientDeletedAtIndex" ON "ClientStat"("deletedAt");

-- AddForeignKey
ALTER TABLE "ClientStat" ADD CONSTRAINT "ClientStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientStat" ADD CONSTRAINT "ClientStat_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
