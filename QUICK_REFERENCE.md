# Quick Reference Guide

## 🚀 Quick Start

### Start Backend
```bash
cd backend
npx ts-node src/index.ts
```

### Start Mobile
```bash
cd mobile
npx expo start --port 8095 --clear
```

## 🔧 Configuration

### Change API URL
Update in 3 places:
1. `mobile/app.json` → `extra.apiBaseUrl`
2. `mobile/.env` → `API_BASE_URL`
3. `mobile/src/constants.ts` → `API_BASE_URL`

Then restart Expo:
```bash
npx expo start --clear
```

### Find Your Local IP
**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

**Mac/Linux:**
```bash
ifconfig
```

## 📱 Platform-Specific URLs

| Platform | URL |
|----------|-----|
| Physical Device | `http://192.168.1.14:3000` (your local IP) |
| Android Emulator | `http://10.0.2.2:3000` |
| iOS Simulator | `http://localhost:3000` |
| Web | `http://localhost:3000` |

## 🧪 Test Credentials

**Owner Account:**
- Email: `test1@gmail.com`
- Password: `Qwer@123`

**Test Location:**
- Latitude: `18.5204`
- Longitude: `73.8567`
- Location: Pune, India

## 📊 Current Database

**Messes:**
1. Annapurna Executive Mess (Shivaji Nagar, Pune)
2. Royal Kitchen (Kothrud, Pune)

**Note:** These are REAL data, not mock data!

## 🔍 Debug Commands

### Check Backend Status
```bash
Get-NetTCPConnection -LocalPort 3000
```

### Check Expo Status
```bash
Get-NetTCPConnection -LocalPort 8095
```

### Test API Endpoint
```bash
curl "http://localhost:3000/messes/nearby-with-menus?lat=18.5204&lng=73.8567&radius=50"
```

### View Backend Logs
```bash
# In Kiro, use:
getProcessOutput with terminalId: 4
```

## 📝 Console Log Prefixes

Watch for these in Expo dev tools:

| Prefix | Source | Purpose |
|--------|--------|---------|
| `🏠 [StudentHome]` | NewStudentHomeScreen | Component lifecycle |
| `🔍 [StudentHome]` | NewStudentHomeScreen | Location/search |
| `📡 [StudentHome]` | NewStudentHomeScreen | API calls |
| `✅ [StudentHome]` | NewStudentHomeScreen | Success |
| `❌ [StudentHome]` | NewStudentHomeScreen | Errors |
| `📊 [StudentHome]` | NewStudentHomeScreen | Data stats |
| `📝 [StudentHome]` | NewStudentHomeScreen | Data content |

## 🐛 Common Issues

### "Cannot connect to server"
1. Check backend is running
2. Verify IP address is correct
3. Ensure phone and PC on same WiFi

### "No messes nearby"
1. Add messes as owner
2. Ensure location is near Pune
3. Pull down to refresh

### "Menu shows null"
1. Add menu for today's date
2. Select correct meal type (lunch/dinner)
3. Refresh screen

## 📂 Key Files

| File | Purpose |
|------|---------|
| `mobile/src/screens/student/NewStudentHomeScreen.tsx` | Student home screen |
| `mobile/src/api/client.ts` | API configuration |
| `mobile/src/constants.ts` | App constants |
| `mobile/app.json` | Expo configuration |
| `backend/src/routes/messes.ts` | Mess API endpoints |
| `backend/src/index.ts` | Backend entry point |

## 🎯 Quick Test

1. Open app on phone
2. See 2 messes (Annapurna, Royal Kitchen)
3. Login as owner (test1@gmail.com)
4. Add new mess
5. Logout
6. Pull to refresh
7. See 3 messes (including new one)

**If this works → Everything is working correctly! ✅**

## 📚 Documentation

- `ISSUE_RESOLUTION_SUMMARY.md` - Complete overview
- `REAL_DATA_VERIFICATION.md` - Data flow details
- `TEST_DYNAMIC_DATA.md` - Step-by-step test script
- `STUDENT_HOME_INTEGRATION.md` - API integration details

## 🆘 Need Help?

1. Check console logs in Expo dev tools
2. Review `REAL_DATA_VERIFICATION.md` troubleshooting section
3. Run test script from `TEST_DYNAMIC_DATA.md`
4. Verify both servers are running
5. Check API URL configuration

## ✅ System Status

- Backend: ✅ Running on port 3000
- Expo: ✅ Running on port 8095
- API: ✅ Responding correctly
- Database: ✅ Connected with 2 messes
- Mobile: ✅ Fetching real data
- Logout: ✅ Navigation working

**All systems operational!** 🚀
