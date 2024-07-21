-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
