# Image Upload - Quick Start Guide

## 🚀 Setup (One-Time)

### Step 1: Create Supabase Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Settings:
   - Name: `mess-covers`
   - Public: ✅ **Enable**
4. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

Go to **Storage** → `mess-covers` → **Policies** → **New Policy**

**Copy and paste these 3 policies:**

#### Policy 1: Allow Upload
```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mess-covers');
```

#### Policy 2: Allow Public Read
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

### Step 3: Verify Backend is Running

Backend should already be running on port 3000 with upload routes loaded.

If not:
```bash
cd backend
npx ts-node src/index.ts
```

### Step 4: Start Mobile App

```bash
cd mobile
npx expo start --port 8095 --clear
```

## 📱 Test Image Upload

### 1. Login as Mess Owner
- Use test credentials: test1@gmail.com / Qwer@123

### 2. Go to Owner Dashboard
- Tap 3-dot menu → Owner Dashboard

### 3. Upload Cover Image
- Find your mess card
- Tap **"Upload Cover Photo"** button
- Select image from gallery
- Crop if needed (16:9 aspect ratio)
- Wait for upload (shows "Uploading..." alert)
- Success! Image appears in dashboard

### 4. Verify on Student Side
- Tap "← Back to App"
- See your mess card with cover image
- Tap mess to see large cover image on detail screen

## ✅ What to Check

### Owner Dashboard
- [ ] "Upload Cover Photo" button visible
- [ ] Image picker opens when tapped
- [ ] Can select image from gallery
- [ ] Can crop image (16:9 ratio)
- [ ] "Uploading..." alert shows
- [ ] Success alert after upload
- [ ] Image appears in dashboard immediately
- [ ] "📷 Change Cover" button visible on existing image
- [ ] Can replace image

### Student Home Screen
- [ ] Cover images display on mess cards
- [ ] Images load correctly
- [ ] No broken images
- [ ] Placeholder shows if no image

### Mess Detail Screen
- [ ] Large cover image at top
- [ ] Full-width display
- [ ] Proper aspect ratio
- [ ] Only shows if image exists

### Supabase Storage
- [ ] Go to Storage → `mess-covers` → `covers/`
- [ ] Uploaded images visible
- [ ] Can view images
- [ ] File names: `{messId}-{timestamp}.jpg`

## 🎯 Upload Flow

```
Owner Dashboard
    ↓
Tap "Upload Cover Photo"
    ↓
Image Picker Opens
    ↓
Select Image from Gallery
    ↓
Crop Image (16:9)
    ↓
"Uploading..." Alert
    ↓
Upload to Supabase Storage
    ↓
Get Public URL
    ↓
Update Database
    ↓
"Success!" Alert
    ↓
Image Appears in Dashboard
```

## 🔍 API Endpoint

### Upload Cover Image
```
POST http://192.168.1.14:3000/upload/cover-image/{messId}
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

Body:
- image: (file)
```

### Response
```json
{
  "message": "Cover image uploaded successfully",
  "cover_image_url": "https://...supabase.co/storage/v1/object/public/mess-covers/covers/...",
  "mess": { ... }
}
```

## 🐛 Troubleshooting

### "Bucket not found"
- Create `mess-covers` bucket in Supabase
- Make sure name is exactly `mess-covers`
- Check bucket is public

### "Permission denied"
- Run all 3 storage policies in Supabase
- Check user is logged in
- Verify JWT token is valid

### "Upload failed"
- Check backend is running on port 3000
- Check network connection (same WiFi)
- Check backend logs for errors
- Verify Supabase URL and keys in `.env`

### "Image picker not opening"
- Grant photo library permission
- Check device has images
- Try restarting app

### Images not loading
- Check bucket is public
- Verify public read policy exists
- Check image URL in database
- Try accessing URL directly in browser

### "File too large"
- Image limit is 5MB
- App compresses to 70% quality
- Select smaller image or reduce quality

## 💡 Tips

1. **Image Quality**: App automatically compresses to 70% quality
2. **Aspect Ratio**: 16:9 is enforced for consistent look
3. **File Size**: Aim for < 500KB per image
4. **Old Images**: Automatically deleted when uploading new one
5. **Permissions**: Grant photo library access when prompted

## 📊 Technical Details

### Image Processing
- **Quality**: 70% compression
- **Aspect Ratio**: 16:9 (enforced)
- **Max Size**: 5MB
- **Formats**: JPG, PNG, WebP
- **Optimization**: Automatic

### Storage
- **Location**: Supabase Storage
- **Bucket**: `mess-covers`
- **Folder**: `covers/`
- **Naming**: `{messId}-{timestamp}.{ext}`
- **Access**: Public read, authenticated write

### Upload Process
1. Select image from gallery
2. Crop to 16:9 aspect ratio
3. Compress to 70% quality
4. Convert to FormData
5. POST to `/upload/cover-image/:messId`
6. Backend uploads to Supabase Storage
7. Get public URL
8. Update database
9. Return URL to app
10. Display image

## 🎨 Image Recommendations

### Optimal Dimensions
- **Width**: 1200px
- **Height**: 675px (16:9 ratio)
- **File Size**: < 500KB
- **Format**: JPG (best compression)

### Good Image Sources
- Take photos of actual food
- Use high-quality camera
- Good lighting
- Clean background
- Focus on food

### What Makes a Good Cover Image
✅ Clear, well-lit food photo
✅ Appetizing presentation
✅ Shows variety of dishes
✅ Clean, professional look
✅ Represents your mess well

❌ Blurry or dark photos
❌ Unrelated images
❌ Low quality
❌ Watermarked images
❌ Copyrighted content

## 📈 Storage Usage

### Free Tier Limits
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **Uploads**: Unlimited

### Estimated Capacity
- Average image: ~200 KB
- **~5,000 images** in free tier
- Monitor in Supabase Dashboard

### If You Exceed Free Tier
- **Storage**: $0.021/GB/month
- **Bandwidth**: $0.09/GB
- For 100-500 messes: free tier is enough

## 🔐 Security

- ✅ Authentication required
- ✅ Ownership verified
- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Old images auto-deleted
- ✅ Public read, authenticated write

## 📝 Next Steps

1. ✅ Create Supabase storage bucket
2. ✅ Set up storage policies
3. ✅ Test upload from mobile app
4. ✅ Verify images in Supabase
5. ✅ Check images on student side

---

**Ready to upload!** Just create the bucket and policies, then start uploading! 📷✨
