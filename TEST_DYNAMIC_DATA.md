# Test Script: Verify Dynamic Data Flow

## Objective
Prove that StudentHomeScreen displays real-time data from backend, not static/mock data.

## Prerequisites
- ✅ Backend running on port 3000
- ✅ Expo running on port 8095
- ✅ Phone and PC on same WiFi network
- ✅ Expo Go app installed on phone

## Test Steps

### Step 1: Check Current Messes
**Action:** Open StudentHomeScreen on phone

**Expected Result:**
- See "Annapurna Executive Mess"
- See "Royal Kitchen"
- Total: 2 messes

**Console Logs to Watch:**
```
🏠 [StudentHome] Component rendered, messes count: 2
📡 [StudentHome] API Base URL: http://192.168.1.14:3000
✅ [StudentHome] API Response received
📊 [StudentHome] Number of messes: 2
📝 [StudentHome] Mess names: Annapurna Executive Mess, Royal Kitchen
```

---

### Step 2: Login as Owner
**Action:** 
1. Tap "👤 Owner" button (bottom right)
2. Enter credentials:
   - Email: `test1@gmail.com`
   - Password: `Qwer@123`
3. Tap "Login"

**Expected Result:**
- Navigate to Owner Dashboard
- See existing messes (if any)

---

### Step 3: Add a New Mess
**Action:**
1. Tap "Add Mess" button
2. Fill in form:
   - **Name:** `Dynamic Test Mess`
   - **Area:** `Pune`
   - **Food Type:** Select "Veg" or "Non-Veg"
   - **Average meal price:** `150`
3. Tap "Save & Continue"

**Expected Result:**
- Success message appears
- Navigate back to dashboard
- New mess appears in dashboard list

**Backend Verification:**
```bash
# Run this in terminal to verify mess was added
curl "http://localhost:3000/messes/nearby-with-menus?lat=18.5204&lng=73.8567&radius=50"
```

Should now show 3 messes including "Dynamic Test Mess"

---

### Step 4: Add Menu for New Mess
**Action:**
1. Find "Dynamic Test Mess" in dashboard
2. Tap "Edit Lunch" button
3. Fill in menu:
   - **Items:** `Paneer Butter Masala, Naan, Rice, Salad`
   - **Price:** `150`
4. Tap "Save Menu"

**Expected Result:**
- Success message
- Dashboard shows "🍛 Lunch: 4 items • ₹150"

---

### Step 5: Logout
**Action:**
1. Tap "Logout" button (top right)

**Expected Result:**
- Automatically navigate to StudentHomeScreen
- No manual navigation needed
- Screen refreshes and fetches data

**Console Logs to Watch:**
```
🏠 [StudentHome] Component rendered, messes count: 0
🔍 [StudentHome] Using test location: {lat: 18.5204, lng: 73.8567}
📡 [StudentHome] Fetching messes with menus from API...
✅ [StudentHome] API Response received
📊 [StudentHome] Number of messes: 3
📝 [StudentHome] Mess names: Annapurna Executive Mess, Royal Kitchen, Dynamic Test Mess
```

---

### Step 6: Verify New Mess Appears
**Action:**
1. Look at StudentHomeScreen
2. Pull down to refresh (if needed)

**Expected Result:**
- ✅ See "Dynamic Test Mess" in the list
- ✅ See menu description: "Today's Lunch: Paneer Butter Masala, Naan, Rice..."
- ✅ See price: "₹150/meal"
- ✅ Total messes: 3 (was 2 before)

**This proves the data is dynamic!**

---

### Step 7: Delete Test Mess (Cleanup)
**Action:**
1. Login as owner again
2. Navigate to mess management
3. Delete "Dynamic Test Mess"
4. Logout

**Expected Result:**
- StudentHomeScreen shows 2 messes again
- "Dynamic Test Mess" is gone

---

## Verification Checklist

After completing all steps, verify:

- [ ] New mess appeared on StudentHomeScreen after adding
- [ ] Menu items displayed correctly
- [ ] Price updated correctly
- [ ] Logout navigation worked automatically
- [ ] Pull-to-refresh fetched latest data
- [ ] Console logs showed correct API calls
- [ ] No errors in console
- [ ] Data persisted across app restarts

## Troubleshooting

### Problem: "Cannot connect to server"
**Solution:**
1. Check backend is running: `Get-NetTCPConnection -LocalPort 3000`
2. Verify IP address: `ipconfig` → Look for "IPv4 Address"
3. Update IP in `mobile/app.json`, `mobile/.env`, `mobile/src/constants.ts`
4. Restart Expo: `npx expo start --clear`

### Problem: "New mess doesn't appear"
**Solution:**
1. Pull down to refresh on StudentHomeScreen
2. Check console logs for API errors
3. Verify mess was added: Check backend logs or Supabase dashboard
4. Ensure mess location is within 50km of test location (18.5204, 73.8567)

### Problem: "Menu shows as null"
**Solution:**
1. Verify menu was added for **today's date**
2. Check meal_type is "lunch" or "dinner"
3. Refresh StudentHomeScreen
4. Check backend response: `curl "http://localhost:3000/messes/nearby-with-menus?lat=18.5204&lng=73.8567&radius=50"`

### Problem: "Logout doesn't navigate to StudentHome"
**Solution:**
- This should work automatically via React state
- If stuck, force close app and reopen
- Check console for errors in AuthContext

## Success Criteria

✅ **Test Passes If:**
1. New mess appears on StudentHomeScreen after adding
2. Menu items display correctly
3. Data updates in real-time (no app restart needed)
4. Logout navigation works smoothly
5. Pull-to-refresh fetches latest data
6. Console logs show correct API calls

❌ **Test Fails If:**
1. StudentHomeScreen always shows same 2 messes
2. New mess doesn't appear after adding
3. Menu items don't display
4. Need to restart app to see changes
5. API errors in console

## Expected Timeline
- **Total test time:** 5-7 minutes
- **Step 1-2:** 1 minute
- **Step 3-4:** 2-3 minutes (adding mess + menu)
- **Step 5-6:** 1 minute (logout + verify)
- **Step 7:** 1-2 minutes (cleanup)

## Notes
- Keep Expo dev tools open to watch console logs
- Take screenshots at each step for documentation
- If test fails, check REAL_DATA_VERIFICATION.md for detailed troubleshooting
