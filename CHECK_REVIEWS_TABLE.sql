-- Check if reviews table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- If no results, the table doesn't exist
-- If results show but no device_id column, we need to add it
