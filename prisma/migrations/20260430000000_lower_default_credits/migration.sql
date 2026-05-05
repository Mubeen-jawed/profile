-- Lower default searchCredits from 20 to 10 for new signups.
-- Existing users keep their current credit balance.
ALTER TABLE "User" ALTER COLUMN "searchCredits" SET DEFAULT 10;
