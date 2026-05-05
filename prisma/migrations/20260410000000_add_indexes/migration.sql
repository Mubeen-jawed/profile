-- Add indexes for performance optimization

-- User indexes
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_isPaid_idx" ON "User"("isPaid");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- SearchLog indexes (critical for admin dashboard queries)
CREATE INDEX IF NOT EXISTS "SearchLog_userId_idx" ON "SearchLog"("userId");
CREATE INDEX IF NOT EXISTS "SearchLog_searchedUsername_idx" ON "SearchLog"("searchedUsername");
CREATE INDEX IF NOT EXISTS "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");
CREATE INDEX IF NOT EXISTS "SearchLog_sessionId_idx" ON "SearchLog"("sessionId");

-- SearchCache index for cleanup queries
CREATE INDEX IF NOT EXISTS "SearchCache_updatedAt_idx" ON "SearchCache"("updatedAt");
