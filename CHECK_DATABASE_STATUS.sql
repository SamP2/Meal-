-- ============================================
-- CHECK WHAT'S ALREADY DONE
-- ============================================
-- Run this to see what's already set up
-- ============================================

-- Check 1: Does the cover_image_url column exist?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messes' 
AND column_name = 'cover_image_url';

-- Expected result if column exists:
-- cover_image_url | text

-- If you see NO ROWS, the column doesn't exist yet
-- If you see the row above, the column EXISTS ✅

-- ============================================
-- Check 2: View your messes table structure
-- ============================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messes'
ORDER BY ordinal_position;

-- This shows ALL columns in the messes table
