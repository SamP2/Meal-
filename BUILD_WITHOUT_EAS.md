# Build APK Without EAS Account

## Option 1: Create Free Expo Account (Easiest - 2 minutes)

Expo accounts are completely free for building APKs.

### **Steps:**
1. Go to https://expo.dev/signup
2. Sign up with email (or GitHub/Google)
3. Verify email
4. Done! Now you can build.

```bash
npm install -g eas-cli
eas login
cd mobile
eas build --platform android --profile preview
```

**Benefits:**
- Free forever
- Cloud builds (no Android Studio needed)
- Easy updates
- Build history

---

## Option 2: Build Locally with Android Studio (No Account Needed)

This requires Android Studio but gives you full control.

### **Prerequisites:**
1. Install Android Studio: https://developer.android.com/studio
2. Install JDK 17
3. Set up Android SDK

### **Steps:**

#### **1. Install Expo Prebuild**
```bash
cd mobile
npx expo install expo-dev-client
```

#### **2. Generate Android Project**
```bash
npx expo prebuild --platform android
```

#### **3. Build with Gradle**
```bash
cd android
./gradlew assembleRelease
```

#### **4. Find APK**
The APK will be at:
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

**Cons:**
- Requires Android Studio setup (large download)
- More complex
- Need to handle signing keys
- Windows-specific build issues

---

## Option 3: Use Expo Go for Testing (No Build Needed)

For quick testing without building APK.

### **Steps:**

1. **Install Expo Go on your phone:**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Start development server:**
```bash
cd mobile
npm start
```

3. **Scan QR code with Expo Go**

**Limitations:**
- Can't add custom native code
- Users need Expo Go installed
- Not suitable for distribution
- Good for personal testing only

---

## Option 4: Use GitHub Actions (Free CI/CD)

Build APKs using GitHub's free cloud runners.

### **Setup:**

1. **Create Expo account** (still need this for builds)

2. **Get Expo token:**
```bash
eas login
eas whoami
# Copy your token from https://expo.dev/accounts/[username]/settings/access-tokens
```

3. **Add to GitHub Secrets:**
   - Go to your repo → Settings → Secrets
   - Add: `EXPO_TOKEN`

4. **Create workflow file:**

Create `.github/workflows/build.yml`:
```yaml
name: Build APK

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: |
          cd mobile
          npm install
      
      - name: Build APK
        run: |
          cd mobile
          eas build --platform android --non-interactive --no-wait
```

---

## 🎯 **Recommended: Just Create Expo Account**

**Why?**
- ✅ Free forever
- ✅ Takes 2 minutes
- ✅ Easiest option
- ✅ Cloud builds
- ✅ No Android Studio needed
- ✅ Works on any computer

**Steps:**
1. Visit: https://expo.dev/signup
2. Enter email & password
3. Verify email
4. Run: `eas login`
5. Build: `eas build --platform android --profile preview`

---

## 📱 **Quick Comparison**

| Method | Difficulty | Time | Requires |
|--------|-----------|------|----------|
| **Expo Account** | ⭐ Easy | 2 min | Email signup |
| Android Studio | ⭐⭐⭐⭐⭐ Hard | 2+ hours | Android Studio, JDK |
| Expo Go | ⭐ Easy | 0 min | Expo Go app |
| GitHub Actions | ⭐⭐⭐ Medium | 30 min | Expo account |

---

## 🆘 **Still Don't Want Expo Account?**

If you absolutely don't want to create an account, the only real alternatives are:

1. **Local build with Android Studio** (very complex)
2. **Use Expo Go** (testing only, not for distribution)
3. **Ask someone with Expo account** to build for you

But honestly, creating a free Expo account is by far the easiest option. It's like GitHub - free and essential for modern React Native development.

---

## ✅ **Next Step**

Just create free Expo account:
→ https://expo.dev/signup

Then run:
```bash
eas login
cd mobile
eas build --platform android --profile preview
```

You'll have your APK in 10 minutes! 🚀
