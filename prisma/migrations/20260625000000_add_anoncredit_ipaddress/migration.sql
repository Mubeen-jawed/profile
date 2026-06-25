-- Adds the `ipAddress` column + index to "AnonCredit" so the database matches
-- schema.prisma. The anonymous search path queries/writes AnonCredit.ipAddress;
-- without this column production threw `column "ipAddress" does not exist`, which
-- broke search for logged-out users while logged-in search (which never touches
-- AnonCredit) kept working. IF NOT EXISTS guards make this safe to apply even if
-- the column was partially added out-of-band.

-- AlterTable
ALTER TABLE "AnonCredit" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnonCredit_ipAddress_idx" ON "AnonCredit"("ipAddress");
