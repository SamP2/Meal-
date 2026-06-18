# Image Upload Fix Guide - "Mess Not Found" Issue

## Problem
The image upload is failing with "Mess not found" error because the `cover_image_url` column doesn't exist in the database yet.

## Root Cause
The migration file `008_add_cover_image.sql` was created but **NOT executed in Supabase**. The backend code is trying to query a column that doesn't exist.

## Solution - Follow These Steps Exactly

### Step 1: Run the Database Migration in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://zhmzafxgoevhixkwajer.supabase.co
   - Login to your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run This SQL** (copy and paste):
   ```sql
   -- Add cover_image_url field to messes table
   ALTER TABLE messes
   ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

   -- Create index for faster queries
   CREATE INDEX IF NOT EXISTS idx_messes_cover_image ON messes(cover_image_url);
   ```

4. **Click "Run"** button
   - You should see: "Success. No rows returned"

### Step 2: Create Supabase Storage Bucket

1. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "New Bucket"

2. **Create Bucket**
   - Name: `mess-covers`
   - Public bucket: **YES** (toggle ON)
   - Click "Create bucket"

### Step 3: Add Storage Policies

1. **Click on the `mess-covers` bucket**
2. **Click "Policies" tab**
3. **Add 3 policies:**

**Policy 1: Allow Upload**
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mess-covers');
```

**Policy 2: Allow Public Read**
```sql
CREATE POLICY "Allow public to read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mess-covers');
```

**Policy 3: Allow Delete**
```sql
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mess-covers');
```

### Step 4: Verify Backend is Running

1. **Check if backend is running:**
   ```bash
   # In backend folder
   npx ts-node src/index.ts
   ```

2. **You should see:**
   ```
   ✅ Server running on http://localhost:3000
   ```

### Step 5: Test Image Upload

1. **Open the mobile app**
2. **Login as mess owner:** test1@gmail.com / Qwer@123
3. **Go to your mess dashboard**
4. **Click "Upload Cover Photo"**
5. **Select an image from gallery**
6. **Upload should succeed!**

## Verification

After completing all steps, test the upload. You should see:
- ✅ Image uploads successfully
- ✅ Image appears in owner dashboard
- ✅ Image appears in student home screen (MessCard)
- ✅ Image appears in mess detail screen

## Troubleshooting

### If you still get "Mess not found":
- Verify the migration ran: Check in Supabase → Database → Tables → messes → Columns
- You should see `cover_image_url` column

### If you get "Bucket not found":
- Verify bucket exists: Supabase → Storage → You should see `mess-covers`
- Verify bucket is public: Click bucket → Settings → Public bucket should be ON

### If you get "Permission denied":
- Verify storage policies are created
- Check Supabase → Storage → mess-covers → Policies
- You should see 3 policies

## Backend Logs to Watch

When testing, watch backend console for these logs:
```
📸 Upload request for mess: <mess-id>
📸 User ID: <user-id>
📸 File: <filename> (<size> bytes)
📸 Mess query result: { mess: {...}, error: null }
✅ Upload successful
```

## Current Status
- ✅ Migration file created: `backend/supabase/migrations/008_add_cover_image.sql`
- ✅ Upload endpoint created: `POST /upload/cover-image/:messId`
- ✅ Mobile image picker integrated
- ❌ **Migration NOT run in Supabase** ← YOU ARE HERE
- ❌ Storage bucket not created
- ❌ Storage policies not created

## Next Action
**Run Step 1 first** - Add the column to the database. This will immediately fix the "Mess not found" error.
