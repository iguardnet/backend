-- CreateEnum
CREATE TYPE "SignInProvider" AS ENUM ('anonymous', 'google.com', 'password');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" VARCHAR(255),
ADD COLUMN     "signInProvider" "SignInProvider";
