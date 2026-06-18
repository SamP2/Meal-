-- ============================================
-- STORAGE POLICIES FOR mess-covers BUCKET
-- ============================================
-- Run these AFTER creating the mess-covers bucket
-- ============================================

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mess-covers');

-- Policy 2: Allow public to read (so students can see images)
CREATE POLICY "Allow public to read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mess-covers');

-- Policy 3: Allow users to delete their own images
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mess-covers');

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Go to Storage → mess-covers → Policies
-- You should see 3 policies listed
-- ============================================
