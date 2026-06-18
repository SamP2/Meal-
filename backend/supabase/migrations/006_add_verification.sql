-- Add verification fields to messes table
ALTER TABLE messes
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS fssai_number TEXT;

-- Add index for verification queries
CREATE INDEX IF NOT EXISTS idx_messes_verification_status ON messes(verification_status);

-- Update existing messes to have pending status
UPDATE messes SET verification_status = 'pending' WHERE verification_status IS NULL;
