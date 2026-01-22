-- Add publishedAt field to support scheduled publishing
-- This allows content to be scheduled for future publication

-- Add to Post table
ALTER TABLE "Post" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Add to Tool table  
ALTER TABLE "Tool" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Add to Course table
ALTER TABLE "Course" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- Update existing published items to have publishedAt set to createdAt
UPDATE "Post" SET "publishedAt" = "createdAt" WHERE "published" = true;
UPDATE "Tool" SET "publishedAt" = "createdAt" WHERE "published" = true;
UPDATE "Course" SET "publishedAt" = "createdAt" WHERE "published" = true;
