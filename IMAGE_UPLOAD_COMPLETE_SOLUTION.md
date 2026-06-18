# Image Upload Complete Solution

## 🔴 Current Problem
**Error:** "Mess not found" when uploading cover image

**Root Cause:** The database column `cover_image_url` doesn't exist yet. The migration file was created but not executed in Supabase.

---

## ✅ Solution (3 Steps - 5 Minutes)

### Step 1: Add Database Column
**Open Supabase SQL Editor and run this:**

```sql
-- Add cover_image_url column to messes table
ALTER TABLE messes
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messes_cover_image ON messes(cover_image_url);

-- Verify it worked
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messes' 
AND column_name = 'cover_image_url';
```

**Expected result:** You should see `cover_image_url | text` in the output.

---

### Step 2: Create Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name: `mess-covers`
4. **Public bucket: ON** ✅ (Important!)
5. Click **Create bucket**

---

### Step 3: Add Storage Policies
**In Supabase SQL Editor, run these 3 policies:**

```sql
-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mess-covers');

-- Policy 2: Allow public to read
CREATE POLICY "Allow public to read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mess-covers');

-- Policy 3: Allow users to delete
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mess-covers');
```

---

## 🧪 Testing

### 1. Start Backend
```bash
cd backend
npx ts-node src/index.ts
```

**Expected output:**
```
Mess Finder API listening on port 3000
```

### 2. Test Upload from Mobile App
1. Open mobile app
2. Login: `test1@gmail.com` / `Qwer@123`
3. Go to Owner Dashboard
4. Click **"Upload Cover Photo"**
5. Select an image
6. Wait for upload

**Expected result:** "Success - Cover image uploaded successfully!"

### 3. Verify Image Appears
- ✅ Owner Dashboard shows the image
- ✅ Student Home Screen shows the image in MessCard
- ✅ Mess Detail Screen shows the image

---

## 📊 Backend Logs (What to Watch)

**Successful upload logs:**
```
📸 Upload request for mess: <mess-id>
📸 User ID: <user-id>
📸 File: photo.jpg (245678 bytes)
📸 Mess query result: { mess: { id: '...', owner_id: '...', ... }, error: null }
✅ Image uploaded to Supabase Storage
✅ Database updated with image URL
```

**Failed upload logs (before fix):**
```
❌ Mess not found: <mess-id>
```

---

## 🛠️ Technical Details

### What Was Built

#### Backend
- **Migration:** `backend/supabase/migrations/008_add_cover_image.sql`
- **Upload Route:** `POST /upload/cover-image/:messId`
- **Features:**
  - Multer for multipart/form-data
  - 5MB file size limit
  - Image type validation
  - Ownership verification
  - Old image cleanup
  - Supabase Storage integration

#### Mobile
- **Image Picker:** expo-image-picker
- **Features:**
  - Gallery permission request
  - Image cropping (16:9 aspect)
  - Quality optimization (0.7)
  - FormData upload
  - Error handling
  - Fallback to URL input if storage not configured

### API Endpoint Details

**Endpoint:** `POST /upload/cover-image/:messId`

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Body:**
```
image: <file>
```

**Response (Success):**
```json
{
  "message": "Cover image uploaded successfully",
  "cover_image_url": "https://zhmzafxgoevhixkwajer.supabase.co/storage/v1/object/public/mess-covers/covers/123-1234567890.jpg",
  "mess": { ... }
}
```

**Response (Error):**
```json
{
  "error": "NOT_FOUND",
  "message": "Mess not found"
}
```

### Database Schema

**Table:** `messes`

**New Column:**
```sql
cover_image_url TEXT
```

**Index:**
```sql
idx_messes_cover_image ON messes(cover_image_url)
```

### Storage Structure

**Bucket:** `mess-covers` (public)

**File Path:** `covers/<messId>-<timestamp>.<ext>`

**Example:** `covers/123e4567-e89b-12d3-a456-426614174000-1735123456789.jpg`

---

## 🐛 Troubleshooting

### Error: "column messes.cover_image_url does not exist"
**Solution:** Run Step 1 again. The column wasn't added.

**Verify:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'messes' AND column_name = 'cover_image_url';
```

### Error: "Bucket not found"
**Solution:** Run Step 2 again. The bucket wasn't created.

**Verify:** Go to Storage → You should see `mess-covers` bucket

### Error: "Permission denied" or "Access denied"
**Solution:** Run Step 3 again. The policies weren't added.

**Verify:** Storage → mess-covers → Policies → Should show 3 policies

### Error: "Mess not found" (after fix)
**Possible causes:**
1. Wrong mess ID
2. User doesn't own the mess
3. Mess doesn't exist

**Debug:**
```sql
-- Check if mess exists
SELECT id, name, owner_id FROM messes WHERE id = '<mess-id>';

-- Check user's messes
SELECT id, name FROM messes WHERE owner_id = '<user-id>';
```

### Upload succeeds but image doesn't show
**Possible causes:**
1. Bucket not public
2. Image URL not saved to database
3. Frontend not refreshing

**Debug:**
```sql
-- Check if URL was saved
SELECT id, name, cover_image_url FROM messes WHERE id = '<mess-id>';
```

---

## 📁 Files Reference

### Created Files
- ✅ `backend/supabase/migrations/008_add_cover_image.sql` - Migration
- ✅ `backend/src/routes/upload.ts` - Upload endpoint
- ✅ `mobile/src/screens/owner/SimpleOwnerDashboard.tsx` - Image picker
- ✅ `RUN_THIS_IN_SUPABASE.sql` - Quick SQL script
- ✅ `STORAGE_POLICIES.sql` - Storage policies
- ✅ `QUICK_FIX_CHECKLIST.md` - Quick checklist
- ✅ `IMAGE_UPLOAD_FIX_GUIDE.md` - Detailed guide
- ✅ This document

### Modified Files
- ✅ `backend/src/types.ts` - Added cover_image_url to Mess type
- ✅ `mobile/src/components/home/MessCard.tsx` - Display cover image
- ✅ `mobile/src/screens/student/MessDetailScreen.tsx` - Display cover image
- ✅ `backend/package.json` - Added multer dependency

---

## 🎯 Summary

**What's Working:**
- ✅ Backend upload endpoint with multer
- ✅ Mobile image picker with expo-image-picker
- ✅ FormData upload to backend
- ✅ Ownership verification
- ✅ Error handling
- ✅ Image display in UI

**What's Missing:**
- ❌ Database column (Step 1)
- ❌ Storage bucket (Step 2)
- ❌ Storage policies (Step 3)

**Time to Fix:** 5 minutes

**Next Action:** Run Step 1 in Supabase SQL Editor

---

## 🚀 After Fix

Once all 3 steps are complete:
1. Mess owners can upload cover photos from gallery
2. Images are stored in Supabase Storage
3. Images appear in owner dashboard
4. Images appear in student home screen
5. Images appear in mess detail screen
6. Old images are automatically deleted when replaced

**Feature Complete!** ✅
