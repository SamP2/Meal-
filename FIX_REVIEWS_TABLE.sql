-- Fix reviews table - Run this in Supabase SQL Editor
-- This will recreate the reviews table with the correct schema

-- Drop existing table if it exists (WARNING: This will delete existing reviews)
DROP TABLE IF EXISTS reviews CASCADE;

-- Create reviews table with device_id
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id UUID NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mess_id, device_id)
);

-- Create indexes
CREATE INDEX idx_reviews_mess_id ON reviews(mess_id);
CREATE INDEX idx_reviews_device_id ON reviews(device_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Disable RLS for reviews (public access)
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Function to update average rating in messes table
CREATE OR REPLACE FUNCTION update_mess_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE messes
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE mess_id = COALESCE(NEW.mess_id, OLD.mess_id)
  )
  WHERE id = COALESCE(NEW.mess_id, OLD.mess_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update mess rating when review is added/updated/deleted
DROP TRIGGER IF EXISTS trigger_update_mess_rating ON reviews;
CREATE TRIGGER trigger_update_mess_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_mess_rating();

-- Verify the table was created
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
