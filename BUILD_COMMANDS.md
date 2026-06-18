# 🚀 Build Your APK - Step by Step

## ✅ Step 1: Login to EAS (Do This Now)

Open a **new PowerShell window** and run:

```bash
eas login
```

Enter the email and password you just created on expo.dev.

---

## ✅ Step 2: Configure EAS

```bash
cd mobile
eas build:configure
```

When prompted:
- Select: **Android**
- Press Enter to accept defaults

---

## ✅ Step 3: Build APK

```bash
eas build --platform android --profile preview
```

**What happens:**
1. EAS uploads your code
2. Builds APK in the cloud (~5-10 minutes)
3. Gives you a download link

**While building:**
- You can close the terminal
- Check progress at: https://expo.dev/accounts/[your-username]/builds
- You'll get an email when done

---

## ✅ Step 4: Download & Test

1. Click the download link from terminal or email
2. Transfer APK to your phone
3. Install it (enable "Unknown Sources" if needed)
4. Test the app!

---

## 📱 What to Test

After installing:
- [ ] App opens with warm orange welcome screen
- [ ] Welcome screen auto-navigates after 2.5s
- [ ] GPS permission works
- [ ] Can see nearby messes
- [ ] Can view mess details
- [ ] Can view menus
- [ ] Owner login works

---

## 🔄 To Build Again (After Changes)

```bash
cd mobile
eas build --platform android --profile preview
```

---

## 📊 Track Your Builds

Visit: https://expo.dev/accounts/[your-username]/projects/mess-finder/builds

---

## 🆘 Troubleshooting

**"Not logged in"**
→ Run: `eas login`

**"Project not found"**
→ Make sure you're in the `mobile` folder

**Build fails**
→ Check the build logs in the Expo dashboard
→ Usually a dependency issue

---

## ✨ Ready to Start?

Just run these 3 commands:

```bash
eas login
cd mobile
eas build --platform android --profile preview
```

🎉 Your APK will be ready in ~10 minutes!
