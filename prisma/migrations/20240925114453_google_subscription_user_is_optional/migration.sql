-- DropForeignKey
ALTER TABLE "GoogleSubscription" DROP CONSTRAINT "GoogleSubscription_userId_fkey";

-- AlterTable
ALTER TABLE "GoogleSubscription" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GoogleSubscription" ADD CONSTRAINT "GoogleSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
