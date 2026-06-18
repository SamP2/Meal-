# Image Upload Flow Diagram

## 📱 Current Flow (What Happens When You Click Upload)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS "Upload Cover Photo"                            │
│    Location: Owner Dashboard                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. MOBILE APP - Request Gallery Permission                     │
│    expo-image-picker.requestMediaLibraryPermissionsAsync()     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. MOBILE APP - Open Image Picker                              │
│    - User selects image from gallery                           │
│    - Image is cropped to 16:9 aspect ratio                     │
│    - Quality reduced to 0.7 for optimization                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. MOBILE APP - Create FormData                                │
│    FormData {                                                   │
│      image: {                                                   │
│        uri: "file:///path/to/image.jpg",                       │
│        name: "cover-1735123456789.jpg",                        │
│        type: "image/jpeg"                                       │
│      }                                                          │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. MOBILE APP - Send POST Request                              │
│    POST http://192.168.1.14:3000/upload/cover-image/:messId   │
│    Headers:                                                     │
│      Authorization: Bearer <jwt-token>                          │
│      Content-Type: multipart/form-data                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND - Authenticate Middleware                           │
│    - Verify JWT token                                          │
│    - Extract user ID from token                                │
│    - Attach user to request: req.user                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. BACKEND - Require Role Middleware                           │
│    - Check if user role is "mess_owner"                        │
│    - Reject if not owner                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. BACKEND - Multer Middleware                                 │
│    - Parse multipart/form-data                                 │
│    - Extract image file                                        │
│    - Validate: must be image type                             │
│    - Validate: max 5MB size                                    │
│    - Store in memory buffer                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. BACKEND - Query Database for Mess                           │
│    SELECT id, owner_id, cover_image_url                        │
│    FROM messes                                                  │
│    WHERE id = :messId                                          │
│                                                                 │
│    ❌ ERROR HERE: "column cover_image_url does not exist"     │
│    ← THIS IS THE CURRENT PROBLEM                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ❌ UPLOAD FAILS ❌
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. MOBILE APP - Show Error                                    │
│     Alert: "Failed to upload image"                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Expected Flow (After Running the Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│ Steps 1-8: Same as above                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. BACKEND - Query Database for Mess                           │
│    SELECT id, owner_id, cover_image_url                        │
│    FROM messes                                                  │
│    WHERE id = :messId                                          │
│                                                                 │
│    ✅ SUCCESS: Mess found                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. BACKEND - Verify Ownership                                 │
│     if (mess.owner_id !== req.user.id) {                       │
│       return 403 Forbidden                                     │
│     }                                                           │
│     ✅ User owns this mess                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 11. BACKEND - Delete Old Image (if exists)                     │
│     if (mess.cover_image_url) {                                │
│       supabase.storage                                         │
│         .from('mess-covers')                                   │
│         .remove(['covers/old-image.jpg'])                      │
│     }                                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 12. BACKEND - Generate Unique Filename                         │
│     fileName = `${messId}-${Date.now()}.jpg`                  │
│     filePath = `covers/${fileName}`                            │
│     Example: covers/123-1735123456789.jpg                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 13. BACKEND - Upload to Supabase Storage                       │
│     supabase.storage                                           │
│       .from('mess-covers')                                     │
│       .upload(filePath, fileBuffer, {                          │
│         contentType: 'image/jpeg',                             │
│         upsert: false                                          │
│       })                                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 14. BACKEND - Get Public URL                                   │
│     publicUrl = supabase.storage                               │
│       .from('mess-covers')                                     │
│       .getPublicUrl(filePath)                                  │
│                                                                 │
│     Result: https://...supabase.co/storage/v1/object/public/  │
│             mess-covers/covers/123-1735123456789.jpg           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 15. BACKEND - Update Database                                  │
│     UPDATE messes                                              │
│     SET cover_image_url = :publicUrl                           │
│     WHERE id = :messId                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 16. BACKEND - Return Success Response                          │
│     {                                                           │
│       message: "Cover image uploaded successfully",            │
│       cover_image_url: "https://...jpg",                       │
│       mess: { ... }                                            │
│     }                                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 17. MOBILE APP - Update Local State                            │
│     setMesses(messes.map(m =>                                  │
│       m.id === messId                                          │
│         ? { ...m, cover_image_url: response.data.cover_image_url }│
│         : m                                                     │
│     ))                                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 18. MOBILE APP - Show Success Message                          │
│     Alert: "Success - Cover image uploaded successfully!"      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 19. MOBILE APP - Display Image                                 │
│     <Image source={{ uri: mess.cover_image_url }} />          │
│     - Shows in Owner Dashboard                                 │
│     - Shows in Student Home (MessCard)                         │
│     - Shows in Mess Detail Screen                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ✅ UPLOAD COMPLETE ✅
```

---

## 🔧 What Needs to Be Fixed

### Problem Location: Step 9

**Current State:**
```sql
SELECT id, owner_id, cover_image_url FROM messes WHERE id = :messId
                      ↑
                      ❌ This column doesn't exist
```

**Solution:**
```sql
ALTER TABLE messes ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
```

---

## 📊 Database State

### Before Fix
```
messes table:
┌──────────────┬────────────┬─────────┬──────────┬─────────┐
│ id           │ owner_id   │ name    │ address  │ is_open │
├──────────────┼────────────┼─────────┼──────────┼─────────┤
│ 123-456-789  │ abc-def    │ Mess A  │ Pune     │ true    │
└──────────────┴────────────┴─────────┴──────────┴─────────┘
                                                   ↑
                                    No cover_image_url column
```

### After Fix
```
messes table:
┌──────────────┬────────────┬─────────┬──────────┬─────────┬──────────────────┐
│ id           │ owner_id   │ name    │ address  │ is_open │ cover_image_url  │
├──────────────┼────────────┼─────────┼──────────┼─────────┼──────────────────┤
│ 123-456-789  │ abc-def    │ Mess A  │ Pune     │ true    │ https://...jpg   │
└──────────────┴────────────┴─────────┴──────────┴─────────┴──────────────────┘
                                                             ↑
                                              ✅ Column exists, can store URL
```

---

## 🎯 Quick Summary

**Current Issue:** Step 9 fails because `cover_image_url` column doesn't exist

**Fix:** Run SQL migration to add the column

**Time:** 2 minutes

**Impact:** Unblocks entire image upload feature

**Next Steps:**
1. Add column (Step 1)
2. Create storage bucket (Step 2)
3. Add storage policies (Step 3)
4. Test upload ✅
