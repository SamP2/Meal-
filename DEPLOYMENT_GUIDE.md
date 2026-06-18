# MessFinder Deployment Guide

## 📱 **Current Status: Ready for Deployment**

### ✅ **What's Working:**
- Backend API running on port 3000
- Frontend mobile app with Expo
- Supabase database with 5 messes, 15 users
- Authentication (email/password)
- GPS-based mess discovery (5km radius)
- Menu management system
- Review system
- Performance optimizations
- New warm amber/orange welcome screen

---

## 🚀 **Deployment Options**

### **Option 1: Build APK for Testing (Recommended for Start)**

Build an APK file that can be installed on any Android device without Play Store.

#### **Step 1: Install EAS CLI**
```bash
npm install -g eas-cli
```

#### **Step 2: Login to Expo**
```bash
eas login
```

#### **Step 3: Configure EAS Build**
```bash
cd mobile
eas build:configure
```

#### **Step 4: Build APK**
```bash
# For development/testing APK
eas build --platform android --profile preview

# For production APK
eas build --platform android --profile production
```

**Result:** You'll get a downloadable APK link that you can share with testers.

---

### **Option 2: Publish to Google Play Store**

For official public release.

#### **Prerequisites:**
- Google Play Developer Account ($25 one-time fee)
- App signing key
- Privacy policy URL
- App screenshots

#### **Steps:**
1. Create app bundle:
```bash
cd mobile
eas build --platform android --profile production
```

2. Download the AAB file from Expo

3. Upload to Google Play Console:
   - Go to https://play.google.com/console
   - Create new app
   - Upload AAB
   - Fill store listing details
   - Submit for review

---

### **Option 3: Deploy Backend to Production**

Your backend needs to be hosted on a server accessible from the internet.

#### **Recommended Hosting Options:**

**A. Railway (Easiest)**
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
cd backend
railway init
railway up
```

**B. Render**
1. Go to https://render.com
2. Connect GitHub repo
3. Create new Web Service
4. Set build command: `npm install`
5. Set start command: `npx ts-node src/index.ts`
6. Add environment variables from `.env`

**C. Heroku**
```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
cd backend
heroku create messfinder-api

# 4. Deploy
git push heroku main
```

---

## ⚙️ **Pre-Deployment Checklist**

### **1. Update Environment Variables**

**Mobile (.env):**
```env
API_BASE_URL=https://your-backend-url.com
MAPBOX_TOKEN=your_mapbox_token_here
```

**Backend (.env):**
- Already configured with Supabase
- Make sure all values are production-ready

### **2. Update app.json**

Replace development values:
```json
{
  "extra": {
    "apiBaseUrl": "https://your-backend-url.com"
  }
}
```

### **3. Add Google Maps API Key** (Optional)

Get from: https://console.cloud.google.com/

Update in `app.json`:
```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ACTUAL_API_KEY"
      }
    }
  }
}
```

### **4. Test App Thoroughly**
- [ ] Register new user
- [ ] Login with existing user
- [ ] GPS location permission
- [ ] View nearby messes
- [ ] View mess details
- [ ] View daily menu
- [ ] Owner: Register mess
- [ ] Owner: Add/edit menu
- [ ] Owner: Toggle open/closed

### **5. Create App Assets**

Ensure you have:
- [ ] `assets/icon.png` (1024x1024)
- [ ] `assets/adaptive-icon.png` (1024x1024)
- [ ] `assets/splash.png` (1242x2688)
- [ ] App screenshots for store listing

---

## 📦 **Quick Deploy Commands**

### **For Android APK (Development Testing)**
```bash
cd mobile
eas build --platform android --profile preview
```

### **For Production Release**
```bash
# 1. Build production APK/AAB
cd mobile
eas build --platform android --profile production

# 2. Deploy backend
cd ../backend
# Use Railway/Render/Heroku (see options above)

# 3. Update mobile app with production backend URL
# Edit mobile/.env and mobile/app.json

# 4. Rebuild mobile app with new backend URL
eas build --platform android --profile production
```

---

## 🔒 **Security Checklist**

- [x] RLS enabled on all Supabase tables
- [x] JWT authentication implemented
- [x] API_BASE_URL configurable via environment
- [ ] Backend deployed with HTTPS
- [ ] Rate limiting enabled on API
- [ ] Input validation on all endpoints
- [ ] Secrets not committed to git

---

## 📱 **Distribution Options**

### **Internal Testing:**
1. Build APK with EAS
2. Share download link with testers
3. Users install directly (enable "Unknown Sources")

### **Beta Testing (Google Play):**
1. Upload AAB to Play Console
2. Create closed/open testing track
3. Share opt-in link with testers

### **Public Release:**
1. Upload AAB to Play Console
2. Complete store listing
3. Submit for review
4. Wait 1-3 days for approval

---

## 🎯 **Next Steps**

1. **Choose deployment path:**
   - Quick testing? → Build APK
   - Public release? → Play Store
   - Backend? → Railway/Render

2. **Update configuration:**
   - Production backend URL
   - Google Maps API key (optional)

3. **Build and test:**
   - Build APK/AAB
   - Test on real devices
   - Fix any issues

4. **Deploy:**
   - Backend → Cloud hosting
   - Mobile → APK/Play Store

---

## 📞 **Support**

For deployment issues:
- Expo Docs: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- Supabase: https://supabase.com/docs

---

## 🎉 **Current Build Info**

- **App Version:** 1.0.0
- **Package:** com.messfinder.app
- **Expo SDK:** 54
- **React Native:** 0.81.5
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Features:** GPS search, Menus, Reviews, Auth

**Status:** ✅ Production Ready
