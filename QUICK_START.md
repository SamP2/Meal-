# Quick Start Guide - Testing Messes Display

## 🚀 Start Everything

### Terminal 1: Backend
```bash
cd backend
npx ts-node src/index.ts
```
**Expected output:**
```
Mess Finder API listening on port 3000
```

### Terminal 2: Mobile App
```bash
cd mobile
npx expo start --port 8095 --clear
```
**Then press:**
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR code for physical device

## ✅ What You Should See

### In Mobile App:
1. **Header**: "Good Morning, Foodie" with location icon
2. **Search Bar**: "Search mess, dish or area..."
3. **Filter Chips**: Popular (active), Nearby, Budget, Pure Veg, Rating 4.5+
4. **Best Pick Card**: 
   - Image placeholder
   - "Royal Kitchen" (4.8 ⭐, 0.7 km)
   - Price: ₹90
   - "Open Now" badge
5. **Messes Near You**: 3-4 mess cards showing:
   - Annapurna Executive Mess
   - Saraswati Dining (if open)
   - Other nearby messes

### In Mobile Console:
```
🌐 API Client initialized
📱 Platform: ios
🔗 BASE_URL: http://localhost:3000
🔍 Using test location: { lat: 18.5204, lng: 73.8567 }
📡 Fetching messes from API...
✅ API Response: { messes: [...] }
📊 Number of messes: 4
🍽️ First mess: { name: 'Annapurna Executive Mess', ... }
```

### In Backend Console:
```
🔍 Nearby messes request: { lat: '18.5204', lng: '73.8567', radius: '50' }
📍 Parsed coordinates: { studentLat: 18.5204, studentLng: 73.8567, radiusKm: 50 }
📊 Total messes in DB: 6
🔓 Open messes: 4
✅ Returning messes: 4
```

## 🐛 Troubleshooting

### Problem: "Cannot connect to server"
**Solution:**
1. Check backend is running: `curl http://localhost:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50`
2. If Android emulator, check API client uses `10.0.2.2:3000`
3. If physical device, update `mobile/.env` with your computer's IP

### Problem: "No messes nearby"
**Solution:**
1. Check backend logs show "Open messes: 4"
2. If 0, run seed script: `cd backend && npx ts-node scripts/seed-test-messes.ts`
3. Verify messes are open in database

### Problem: Empty screen / Loading forever
**Solution:**
1. Check mobile console for errors
2. Check backend console for requests
3. Test API: `cd mobile && node test-api.js`

## 🧪 Quick Tests

### Test 1: API Connectivity
```bash
cd mobile
node test-api.js
```
**Expected:** ✅ SUCCESS for at least one URL

### Test 2: Backend Health
```bash
curl http://localhost:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50
```
**Expected:** JSON with 4 messes

### Test 3: Database State
```bash
cd backend
npx ts-node scripts/seed-test-messes.ts
```
**Expected:** "🎉 Seeding complete!"

## 📱 Platform-Specific URLs

The app automatically uses the correct URL:

| Platform | URL | When to Use |
|----------|-----|-------------|
| iOS Simulator | `http://localhost:3000` | Default for iOS |
| Android Emulator | `http://10.0.2.2:3000` | Default for Android |
| Web | `http://localhost:3000` | Default for web |
| Physical Device | `http://192.168.1.14:3000` | Set in `mobile/.env` |

## 🎯 Success Checklist

- [ ] Backend shows "listening on port 3000"
- [ ] Mobile app loads without errors
- [ ] Console shows "API Response" with messes
- [ ] Backend logs show requests
- [ ] Home screen displays mess cards
- [ ] "Best Pick" card shows Royal Kitchen
- [ ] Pull to refresh works

## 📝 Current Test Data

**Location:** Pune, India (18.5204, 73.8567)
**Radius:** 50km

**Messes:**
1. ✅ Royal Kitchen - 4.8⭐ (OPEN) - Best Pick
2. ✅ Annapurna Executive Mess - 4.6⭐ (OPEN)
3. ❌ Saraswati Dining - 4.2⭐ (CLOSED - won't show)
4. ✅ 1-2 more open messes

## 🔧 Files Changed

All debugging and fixes are in place:
- ✅ Backend: Enhanced logging
- ✅ Mobile: Platform detection
- ✅ Database: Test data seeded
- ✅ API: Connectivity verified

**Just start the servers and it should work!** 🎉
