# Fix Image Upload - Quick Guide

## The Problem

Image upload is failing because the Supabase Storage bucket doesn't exist yet.

## Solution: Create Supabase Storage Bucket

### Step 1: Go to Supabase Dashboard

1. Open https://supabase.com
2. Login to your account
3. Select your project

### Step 2: Create Storage Bucket

1. Click **"Storage"** in the left sidebar
2. Click **"New bucket"** button
3. Fill in:
   - **Name**: `mess-covers` (exactly this name!)
   - **Public bucket**: ✅ **Check this box** (very important!)
4. Click **"Create bucket"**

### Step 3: Set Up Policies

1. Click on the `mess-covers` bucket you just created
2. Click **"Policies"** tab
3. Click **"New Policy"** button

**Add these 3 policies one by one:**

#### Policy 1: Allow Upload
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mess-covers');
```

#### Policy 2: Allow Read
```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'mess-covers');
```

#### Policy 3: Allow Delete
```sql
CREATE POLICY "Allow owners to delete their images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'mess-covers');
```

### Step 4: Test Upload Again

1. Go back to your mobile app
2. Tap "Upload Cover Photo"
3. Select an image
4. It should upload successfully now! ✅

## Alternative: Use Image URL (Temporary)

If you don't want to set up Supabase Storage right now:

1. Try uploading an image
2. When it fails, you'll see an option: **"Enter URL"**
3. Tap "Enter URL"
4. Paste an image URL (e.g., from Unsplash)
5. Image will display immediately

### Free Image URLs for Testing

```
https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200
https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200
https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200
```

## What Changed

✅ Better error messages
✅ Fallback to URL input if storage not configured
✅ More detailed error logging
✅ Graceful handling of missing bucket

## Verify It's Working

After creating the bucket:

1. Upload an image from your phone
2. You should see "Success!" message
3. Image appears in dashboard
4. Go to Supabase → Storage → mess-covers → covers/
5. You should see your uploaded image there

## Still Having Issues?

### Check Backend Logs

The backend will show detailed error messages. Common issues:

- **"Bucket not found"** → Create the bucket in Supabase
- **"Permission denied"** → Add the 3 storage policies
- **"Network error"** → Check backend is running on port 3000
- **"Timeout"** → Image too large, try smaller image

### Quick Checklist

- [ ] Supabase bucket `mess-covers` created
- [ ] Bucket is set to **public**
- [ ] All 3 storage policies added
- [ ] Backend running on port 3000
- [ ] Mobile app connected to backend
- [ ] Photo library permission granted

## Summary

**The issue**: Supabase Storage bucket doesn't exist yet

**The fix**: Create `mess-covers` bucket in Supabase Dashboard

**Time needed**: 2-3 minutes

**Alternative**: Use URL input (works immediately, no setup needed)

---

Once you create the bucket, image upload will work perfectly! 📷✨
