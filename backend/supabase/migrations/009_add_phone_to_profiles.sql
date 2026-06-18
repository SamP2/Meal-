-- Add phone number support to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS name  TEXT;

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
