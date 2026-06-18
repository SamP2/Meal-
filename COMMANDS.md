# Command Reference - Quick Copy/Paste

## 🚀 Start Services

### Backend (Terminal 1)
```bash
cd backend
npx ts-node src/index.ts
```

### Mobile (Terminal 2)
```bash
cd mobile
npx expo start --port 8095 --clear
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- Scan QR code for physical device

## 🧪 Testing Commands

### Test API Connectivity
```bash
cd mobile
node test-api.js
```

### Test Backend Directly
```bash
curl http://localhost:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50
```

### Seed Test Data
```bash
cd backend
npx ts-node scripts/seed-test-messes.ts
```

## 🔍 Debugging Commands

### Check Backend Logs
Backend terminal will show logs automatically when requests come in.

### Check Mobile Logs
Mobile terminal (where you ran `expo start`) will show logs automatically.

### View Backend Process
```bash
# If backend is running in background
curl http://localhost:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50
```

## 🛠️ Troubleshooting Commands

### Kill Port 3000 (if backend won't start)
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Clear Expo Cache
```bash
cd mobile
npx expo start --clear
```

### Reinstall Dependencies
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Mobile
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Reset Database (if needed)
```bash
cd backend
# Run migrations again
# Then seed data
npx ts-node scripts/seed-test-messes.ts
```

## 📱 Platform-Specific Testing

### iOS Simulator
```bash
cd mobile
npx expo start --ios
```

### Android Emulator
```bash
cd mobile
npx expo start --android
```

### Web Browser
```bash
cd mobile
npx expo start --web
```

## 🔧 Configuration Commands

### Update Mobile API URL (for physical device)
```bash
# Edit mobile/.env
echo "API_BASE_URL=http://YOUR_COMPUTER_IP:3000" > mobile/.env
```

### Get Your Computer's IP
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep "inet "
```

## 📊 Database Commands

### Check Messes in Database (via API)
```bash
curl http://localhost:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50 | json_pp
```

### Seed More Test Data
```bash
cd backend
npx ts-node scripts/seed-test-messes.ts
```

## 🧹 Cleanup Commands

### Stop All Processes
```bash
# Press Ctrl+C in each terminal
```

### Clean Build Artifacts
```bash
# Backend
cd backend
rm -rf dist

# Mobile
cd mobile
rm -rf .expo
```

## 📝 Log Commands

### Save Backend Logs
```bash
cd backend
npx ts-node src/index.ts > backend.log 2>&1
```

### Save Mobile Logs
```bash
cd mobile
npx expo start --port 8095 > mobile.log 2>&1
```

## 🎯 One-Line Test Suite

```bash
# Test everything at once
cd backend && npx ts-node scripts/seed-test-messes.ts && cd ../mobile && node test-api.js
```

## 🚨 Emergency Reset

If everything is broken:

```bash
# 1. Stop all processes (Ctrl+C)

# 2. Kill port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 3. Reseed database
cd backend
npx ts-node scripts/seed-test-messes.ts

# 4. Restart backend
npx ts-node src/index.ts

# 5. Clear and restart mobile (in new terminal)
cd mobile
npx expo start --port 8095 --clear
```

## 📱 Device-Specific URLs

### Update for Your Setup

**iOS Simulator:**
```bash
# No change needed - uses localhost:3000
```

**Android Emulator:**
```bash
# No change needed - uses 10.0.2.2:3000
```

**Physical Device:**
```bash
# Get your computer's IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Update mobile/.env
echo "API_BASE_URL=http://YOUR_IP:3000" > mobile/.env

# Restart Expo
cd mobile
npx expo start --port 8095 --clear
```

## ✅ Verification Commands

### Check Backend is Running
```bash
curl http://localhost:3000/messes/nearby?lat=18.5204&lng=73.8567&radius=50
```
**Expected:** JSON with 4 messes

### Check Mobile Can Connect
```bash
cd mobile
node test-api.js
```
**Expected:** ✅ SUCCESS for at least one URL

### Check Database Has Data
```bash
cd backend
npx ts-node scripts/seed-test-messes.ts
```
**Expected:** "🎉 Seeding complete!"

## 🎉 Success Command

When everything works:
```bash
echo "🎉 MessFinder is running! Check your mobile app."
```
