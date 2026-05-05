-- CreateTable
CREATE TABLE "NsfwCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "checkedUsername" TEXT NOT NULL,
    "isNsfw" BOOLEAN NOT NULL DEFAULT false,
    "found" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NsfwCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NsfwCheck_userId_idx" ON "NsfwCheck"("userId");

-- CreateIndex
CREATE INDEX "NsfwCheck_checkedUsername_idx" ON "NsfwCheck"("checkedUsername");

-- CreateIndex
CREATE INDEX "NsfwCheck_createdAt_idx" ON "NsfwCheck"("createdAt");
