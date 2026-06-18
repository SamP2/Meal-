-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This will fix the "Mess not found" error
-- by adding the cover_image_url column
-- ============================================

-- Step 1: Add the cover_image_url column
ALTER TABLE messes
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messes_cover_image ON messes(cover_image_url);

-- Step 3: Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messes' 
AND column_name = 'cover_image_url';

-- You should see:
-- column_name        | data_type
-- -------------------+----------
-- cover_image_url    | text

-- ============================================
-- NEXT STEPS AFTER RUNNING THIS:
-- ============================================
-- 1. Create Storage Bucket:
--    - Go to Storage → New Bucket
--    - Name: mess-covers
--    - Public: YES
--
-- 2. Add Storage Policies (see below)
-- ============================================
