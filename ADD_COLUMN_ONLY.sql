-- ============================================
-- ADD COVER IMAGE COLUMN ONLY
-- ============================================
-- Run this if the column doesn't exist yet
-- ============================================

-- Add the cover_image_url column
ALTER TABLE messes
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messes_cover_image ON messes(cover_image_url);

-- Verify it worked
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messes' 
AND column_name = 'cover_image_url';

-- Expected result:
-- cover_image_url | text
