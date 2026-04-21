-- Add new fields to messes table
ALTER TABLE messes
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cuisine TEXT DEFAULT 'Multi-Cuisine',
  ADD COLUMN IF NOT EXISTS is_veg BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add new fields to menu_items table
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image TEXT;

-- Ratings/reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id     UUID NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (mess_id, student_id)
);

-- Function to update mess rating when a review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_mess_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE messes
  SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE mess_id = COALESCE(NEW.mess_id, OLD.mess_id)),
    review_count = (SELECT COUNT(*) FROM reviews WHERE mess_id = COALESCE(NEW.mess_id, OLD.mess_id))
  WHERE id = COALESCE(NEW.mess_id, OLD.mess_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_mess_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_mess_rating();
