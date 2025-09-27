-- CreateEnum
CREATE TYPE "InboundType" AS ENUM ('VLESS_TCP', 'VLESS_WS_TLS');

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "inboundType" "InboundType" NOT NULL DEFAULT 'VLESS_TCP';
