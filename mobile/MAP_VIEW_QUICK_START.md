# Map View - Quick Start Guide

## 🚀 Test the Map View NOW (Without API Key)

The map will work immediately for testing, even without a Google Maps API key!

### Step 1: Start the App
```bash
# Terminal 1: Start backend (if not running)
cd backend
npx ts-node src/index.ts

# Terminal 2: Start mobile app
cd mobile
npx expo start --port 8095 --clear
```

### Step 2: Open on Your Device
- Scan QR code with Expo Go app
- App will load StudentHomeScreen

### Step 3: Access Map View
You have 2 ways to access the map:

**Option A: Floating Button (Quick Access)**
- Look for the orange 🗺️ Map button at bottom-right
- Tap it to open map view

**Option B: Map Section**
- Scroll down to "📍 Explore on Map" section
- Tap "View Full Map" button

### Step 4: Interact with Map
1. **Pan** - Drag to move around
2. **Zoom** - Pinch to zoom in/out
3. **Tap Markers** - Tap any marker to see mess details
4. **View Details** - Tap "View Details" in callout to see full mess info

### What You'll See

#### Markers
- 🔵 **Blue Pin** - Your location (Pune test coordinates)
- 🟢 **Green Pin** - Verified messes
- 🟡 **Amber Pin** - Pending review messes

#### Callout (When You Tap a Marker)
- Mess name with ✓ badge (if verified)
- ⭐ Rating and price range
- 📍 Distance from you
- Status badge (OPEN NOW / CLOSED)
- "View Details →" button

#### Legend (Bottom of Screen)
- Shows what each marker color means

### Development Note
Without a Google Maps API key, you'll see:
- ⚠️ "For development purposes only" watermark on map
- ✅ All functionality works perfectly
- ✅ Suitable for development and testing

This is normal and expected for development!

## 🔑 Add Google Maps API Key (Optional for Testing)

For production or to remove the watermark:

### Quick Steps
1. Go to: https://console.cloud.google.com/
2. Create project → Enable "Maps SDK for Android" and "Maps SDK for iOS"
3. Create API key
4. Open `mobile/app.json`
5. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual key
6. Restart app: `npx expo start --clear`

**Full instructions:** See `mobile/GOOGLE_MAPS_SETUP.md`

## 🎯 Testing Checklist

- [ ] Map loads and shows Pune area
- [ ] Blue marker visible (your location)
- [ ] Mess markers visible (green/amber pins)
- [ ] Tap marker shows callout with mess info
- [ ] Callout shows correct data (name, rating, distance, status)
- [ ] "View Details" button navigates to MessDetailScreen
- [ ] Back button returns to map
- [ ] Floating 🗺️ button works from StudentHomeScreen
- [ ] "View Full Map" button works from map section
- [ ] Legend visible at bottom
- [ ] Pan and zoom work smoothly

## 🐛 Troubleshooting

### Map shows gray screen
- Check if backend is running on port 3000
- Check if messes have valid latitude/longitude in database
- Try restarting the app: `npx expo start --clear`

### No markers visible
- Check backend logs for API response
- Verify messes exist in database with coordinates
- Check console logs in Expo for errors

### "Network request failed"
- Verify backend is running: `http://192.168.1.14:3000`
- Check your phone is on same WiFi as computer
- Try accessing `http://192.168.1.14:3000/messes/nearby-with-menus?lat=18.5204&lng=73.8567&radius=50` in browser

### Callout doesn't show
- Make sure you're tapping directly on the marker pin
- Try tapping slightly above the pin point
- Check console for any errors

## 📱 User Experience

### From Student Perspective
1. **Discover** - See all nearby messes at a glance
2. **Compare** - Visually compare distances and locations
3. **Explore** - Pan around to find messes in different areas
4. **Quick Info** - Tap marker for key details
5. **Deep Dive** - Tap "View Details" for full information

### Benefits Over List View
- **Visual Context** - See actual locations on map
- **Distance Awareness** - Better understanding of proximity
- **Area Exploration** - Discover messes in specific neighborhoods
- **Quick Comparison** - Compare multiple messes visually

## 🎨 Design Highlights

- **Floating Action Button** - Always accessible, doesn't block content
- **Color-Coded Markers** - Instant verification status recognition
- **Rich Callouts** - All key info without leaving map
- **Clean Legend** - Clear explanation of marker colors
- **Smooth Navigation** - Seamless transition to detail screen

## 📊 Current Test Data

Using test location: **Pune, India (18.5204, 73.8567)**
- Search radius: 50km
- Should show all messes in database with valid coordinates
- Markers will appear based on actual mess locations in DB

## Next Steps

1. ✅ Test map view with current setup
2. ⏳ Add Google Maps API key (optional for testing)
3. ⏳ Test on physical device
4. ⏳ Verify all messes appear correctly
5. ⏳ Test navigation flow (map → detail → back)

---

**Ready to test!** Just start the app and tap the 🗺️ button! 🚀
