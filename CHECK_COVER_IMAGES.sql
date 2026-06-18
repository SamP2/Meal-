-- Check which messes have cover images
SELECT 
  id,
  name,
  cover_image_url,
  CASE 
    WHEN cover_image_url IS NULL THEN '❌ No image'
    WHEN cover_image_url = '' THEN '❌ Empty string'
    ELSE '✅ Has image'
  END as status
FROM messes
ORDER BY name;
