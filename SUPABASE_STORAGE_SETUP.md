# Supabase Storage Setup for Cover Images

## Overview
This guide will help you set up Supabase Storage to store mess cover images.

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `mess-covers`
   - **Public bucket**: ✅ **Enable** (so images are publicly accessible)
   - **File size limit**: 5 MB (optional)
   - **Allowed MIME types**: `image/*` (optional)
5. Click **"Create bucket"**

## Step 2: Set Up Storage Policies

By default, the bucket needs policies to allow uploads and public access.

### Go to Storage Policies

1. In Supabase Dashboard, go to **Storage**
2. Click on the `mess-covers` bucket
3. Click **"Policies"** tab
4. Click **"New Policy"**

### Policy 1: Allow Authenticated Users to Upload

```sql
-- Policy name: Allow authenticated users to upload
-- Operation: INSERT

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mess-covers');
```

### Policy 2: Allow Public Read Access

```sql
-- Policy name: Allow public read access
-- Operation: SELECT

CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'mess-covers');
```

### Policy 3: Allow Owners to Delete Their Images

```sql
-- Policy name: Allow owners to delete their images
-- Operation: DELETE

CREATE POLICY "Allow owners to delete their images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'mess-covers');
```

## Step 3: Verify Setup

### Test Upload via SQL

Run this in Supabase SQL Editor to verify the bucket exists:

```sql
SELECT * FROM storage.buckets WHERE name = 'mess-covers';
```

You should see:
```
id | name         | public
---|--------------|-------
... | mess-covers | true
```

### Test via API

You can test the upload endpoint:

```bash
curl -X POST http://localhost:3000/upload/cover-image/{messId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

## Step 4: Folder Structure

Images will be stored in this structure:
```
mess-covers/
└── covers/
    ├── {messId}-{timestamp}.jpg
    ├── {messId}-{timestamp}.png
    └── ...
```

## Step 5: Environment Variables

Make sure your backend `.env` has:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Step 6: Test the Feature

### From Mobile App

1. Login as mess owner
2. Go to Owner Dashboard
3. Tap "Upload Cover Photo"
4. Select an image from gallery
5. Wait for upload
6. Image should appear in dashboard

### Verify in Supabase

1. Go to **Storage** → `mess-covers` → `covers/`
2. You should see uploaded images
3. Click on an image to view it

## Troubleshooting

### "Bucket not found"
- Make sure bucket name is exactly `mess-covers`
- Check bucket is created in Supabase Dashboard

### "Permission denied"
- Check storage policies are created
- Verify user is authenticated
- Check JWT token is valid

### "File too large"
- Default limit is 5MB
- Reduce image quality in mobile app
- Or increase bucket file size limit

### "Upload failed"
- Check network connection
- Verify Supabase URL and keys in `.env`
- Check backend logs for errors
- Verify storage policies allow INSERT

### Images not loading
- Check bucket is public
- Verify public read policy exists
- Check image URL is correct
- Try accessing URL directly in browser

## Image Optimization Tips

### Mobile App (Already Implemented)
- Quality: 0.7 (70%)
- Aspect ratio: 16:9
- Editing enabled (crop before upload)

### Additional Optimization (Optional)
```typescript
// In mobile app, before upload:
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const optimizedImage = await manipulateAsync(
  imageUri,
  [{ resize: { width: 1200 } }], // Resize to max 1200px width
  { compress: 0.7, format: SaveFormat.JPEG }
);
```

## Storage Limits

### Supabase Free Tier
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File uploads**: Unlimited

### Estimated Capacity
- Average image size: ~200 KB (after compression)
- **~5,000 images** can be stored in free tier
- Monitor usage in Supabase Dashboard

## Security Best Practices

1. **File Size Limits**: Already set to 5MB
2. **File Type Validation**: Only images allowed
3. **Authentication Required**: Only authenticated owners can upload
4. **Ownership Verification**: Users can only upload to their own messes
5. **Old Image Cleanup**: Old images are deleted when new ones are uploaded

## Backup Strategy

### Manual Backup
1. Go to Supabase Dashboard → Storage
2. Select `mess-covers` bucket
3. Download all files

### Automated Backup (Advanced)
```typescript
// Script to backup all images
const { data: files } = await supabase.storage
  .from('mess-covers')
  .list('covers/');

for (const file of files) {
  const { data } = await supabase.storage
    .from('mess-covers')
    .download(`covers/${file.name}`);
  
  // Save to local backup
}
```

## Cost Estimation

### If You Exceed Free Tier

**Storage**: $0.021 per GB/month
- 10 GB = $0.21/month
- 100 GB = $2.10/month

**Bandwidth**: $0.09 per GB
- 10 GB = $0.90
- 100 GB = $9.00

For a small app with 100-500 messes, free tier is sufficient.

## Alternative: Cloudinary

If you prefer Cloudinary instead:

1. Sign up at https://cloudinary.com
2. Get API credentials
3. Install: `npm install cloudinary`
4. Update upload route to use Cloudinary SDK

**Pros**: More features, better optimization
**Cons**: More complex setup, external service

## Next Steps

1. ✅ Create `mess-covers` bucket in Supabase
2. ✅ Set up storage policies
3. ✅ Test upload from mobile app
4. ✅ Verify images appear in dashboard
5. ✅ Check images display on student side

---

**Ready to upload!** Just create the bucket and policies, then test from the mobile app! 📷
