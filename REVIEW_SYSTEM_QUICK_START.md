# Review System - Quick Start Guide

## 🚀 Setup (One-Time)

### Step 1: Run Database Migration

Go to Supabase Dashboard → SQL Editor → **New Query**

Copy and paste this SQL:

```sql
-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id UUID NOT NULL REFERENCES messes(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mess_id, device_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_mess_id ON reviews(mess_id);
CREATE INDEX IF NOT EXISTS idx_reviews_device_id ON reviews(device_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Disable RLS
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Auto-update mess rating trigger
CREATE OR REPLACE FUNCTION update_mess_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE messes
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE mess_id = COALESCE(NEW.mess_id, OLD.mess_id)
  )
  WHERE id = COALESCE(NEW.mess_id, OLD.mess_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mess_rating ON reviews;
CREATE TRIGGER trigger_update_mess_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_mess_rating();
```

Click **Run** ✅

### Step 2: Verify Backend is Running

Backend should already be running on port 3000 with review routes loaded.

If not:
```bash
cd backend
npx ts-node src/index.ts
```

### Step 3: Start Mobile App

```bash
cd mobile
npx expo start --port 8095 --clear
```

## 📱 Test the Review System

### 1. Navigate to Mess Detail
- Open app on your device
- Tap any mess card from home screen
- Scroll down to "⭐ Reviews" section

### 2. Write a Review
- Tap "✍️ Write a Review" button
- Select rating (tap stars 1-5)
- Optionally add comment
- Tap "Submit"

### 3. Verify Review Appears
- Your review should appear in the list
- Average rating should update
- Review count should increment

### 4. Edit Your Review
- Tap "✏️ Edit Your Review" button
- Form pre-fills with your existing review
- Change rating or comment
- Tap "Update"

### 5. Test on Different Device
- Open app on another device (or clear app data)
- Navigate to same mess
- Submit a different review
- Both reviews should appear

## ✅ What to Check

### Reviews Section
- [ ] "⭐ Reviews" header visible
- [ ] Average rating displays (e.g., "4.5")
- [ ] Review count displays (e.g., "(3 reviews)")
- [ ] "Write a Review" button visible

### Review Form
- [ ] Star selector works (1-5 stars)
- [ ] Stars highlight when selected
- [ ] Comment input accepts text
- [ ] Character limit enforced (500 chars)
- [ ] Cancel button closes form
- [ ] Submit button works
- [ ] Loading spinner shows during submission

### After Submission
- [ ] Success alert appears
- [ ] Form closes automatically
- [ ] Review appears in list immediately
- [ ] Average rating updates
- [ ] Review count updates
- [ ] Button changes to "Edit Your Review"

### Edit Existing Review
- [ ] "Edit Your Review" button appears
- [ ] Form pre-fills with existing rating
- [ ] Form pre-fills with existing comment
- [ ] Can change rating
- [ ] Can change comment
- [ ] Update button works
- [ ] Review updates in list

### Reviews List
- [ ] All reviews display
- [ ] Each review shows stars
- [ ] Comments display (if provided)
- [ ] Dates show relative time ("Today", "2 days ago")
- [ ] Newest reviews appear first
- [ ] Empty state shows if no reviews

## 🎯 User Flow

```
MessDetailScreen
    ↓
Scroll to "⭐ Reviews" section
    ↓
Tap "✍️ Write a Review"
    ↓
Select rating (1-5 stars)
    ↓
Optionally add comment
    ↓
Tap "Submit"
    ↓
✅ Review submitted!
    ↓
Review appears in list
Average rating updates
```

## 🔍 API Endpoints

Test directly in browser or Postman:

### Get Reviews
```
GET http://192.168.1.14:3000/reviews/{messId}
```

### Submit Review
```
POST http://192.168.1.14:3000/reviews/{messId}
Content-Type: application/json

{
  "device_id": "test-device-123",
  "rating": 5,
  "comment": "Great food!"
}
```

### Check User Review
```
GET http://192.168.1.14:3000/reviews/{messId}/user/{deviceId}
```

## 🐛 Troubleshooting

### "Failed to load reviews"
- Check backend is running on port 3000
- Check Supabase migration was run
- Check console logs for errors

### "Failed to submit review"
- Check device ID is being generated
- Check rating is between 1-5
- Check mess exists in database
- Check backend logs for errors

### Reviews not appearing
- Check reviews table exists in Supabase
- Check RLS is disabled on reviews table
- Refresh the screen (pull down)

### Average rating not updating
- Check trigger function was created
- Check trigger is enabled
- Manually run: `SELECT update_mess_rating();`

### Can't edit review
- Check device ID is consistent
- Check unique constraint exists
- Try clearing app data and reviewing again

## 💡 Tips

1. **Device ID**: Each device gets a unique ID. Clearing app data generates a new ID.

2. **One Review Per Device**: You can only have one review per mess per device. Submitting again updates your existing review.

3. **No Deletion**: Reviews can be updated but not deleted. This prevents manipulation.

4. **Optional Comments**: Rating is required, but comments are optional.

5. **Character Limit**: Comments are limited to 500 characters.

6. **Real-time Updates**: Average ratings update automatically via database trigger.

## 🎨 UI Features

- **Star Rating**: Interactive star selector (⭐ filled, ☆ empty)
- **Clean Design**: Matches app's teal + amber theme
- **Loading States**: Shows spinners during API calls
- **Error Handling**: User-friendly error messages
- **Relative Dates**: "Today", "Yesterday", "2 days ago"
- **Empty States**: Encourages first review

## 📊 Expected Behavior

### First Review
- Average rating = Your rating
- Total reviews = 1
- Your review appears in list

### Second Review (Different Device)
- Average rating = (Review1 + Review2) / 2
- Total reviews = 2
- Both reviews appear in list

### Update Review
- Average rating recalculates
- Total reviews stays same
- Your review updates in list

---

**Ready to test!** Just run the migration and start reviewing! 🌟
