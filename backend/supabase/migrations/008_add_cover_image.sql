-- Add cover_image_url field to messes table
ALTER TABLE messes
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messes_cover_image ON messes(cover_image_url);
