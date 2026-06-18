# Google Maps API Setup for Mess Finder

## Overview
The Map View feature requires a Google Maps API key to display maps on Android and iOS devices.

## Steps to Get Google Maps API Key

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" → "New Project"
- Name: "Mess Finder" (or your preferred name)
- Click "Create"

### 3. Enable Required APIs
Navigate to: **APIs & Services** → **Library**

Enable these APIs:
- **Maps SDK for Android** (for Android app)
- **Maps SDK for iOS** (for iOS app)

### 4. Create API Key
1. Go to: **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **API Key**
3. Copy the generated API key

### 5. Restrict API Key (Recommended for Production)
1. Click on the API key you just created
2. Under **Application restrictions**:
   - For Android: Select "Android apps"
     - Add package name: `com.messfinder.app`
     - Add SHA-1 certificate fingerprint (get from `keytool` or Expo)
   - For iOS: Select "iOS apps"
     - Add bundle identifier: `com.messfinder.app`
3. Under **API restrictions**:
   - Select "Restrict key"
   - Check: Maps SDK for Android, Maps SDK for iOS
4. Click **Save**

### 6. Add API Key to Your App

#### Option A: Using app.json (Current Setup)
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `mobile/app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy..."
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSy..."
      }
    }
  }
}
```

#### Option B: Using Environment Variables (More Secure)
1. Add to `.env`:
```
GOOGLE_MAPS_API_KEY=AIzaSy...
```

2. Update `app.json` to use env variable (requires app.config.js)

### 7. Rebuild the App
After adding the API key, rebuild your app:

```bash
# For development
npx expo start --clear

# For production build
eas build --platform android
eas build --platform ios
```

## Testing Without API Key (Development Only)

For development/testing, the map will work with limited functionality:
- Basic map display works
- Some features may show "For development purposes only" watermark
- Production apps MUST have a valid API key

## Troubleshooting

### Map shows gray screen
- Check if API key is correctly added to app.json
- Verify APIs are enabled in Google Cloud Console
- Check API key restrictions (temporarily remove restrictions to test)
- Rebuild the app after adding API key

### "This API project is not authorized to use this API"
- Enable "Maps SDK for Android" and "Maps SDK for iOS" in Google Cloud Console

### Map works on one platform but not the other
- Check if you've added the API key for both Android and iOS in app.json
- Verify both Maps SDKs are enabled in Google Cloud Console

## Cost Information

Google Maps Platform offers:
- **$200 free credit per month** (covers ~28,000 map loads)
- After free tier: ~$7 per 1,000 map loads
- Monitor usage in Google Cloud Console

For a small app, the free tier is usually sufficient.

## Security Best Practices

1. **Never commit API keys to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables for production

2. **Restrict API keys**
   - Add application restrictions (package name/bundle ID)
   - Add API restrictions (only enable needed APIs)

3. **Monitor usage**
   - Set up billing alerts in Google Cloud Console
   - Review usage regularly

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [React Native Maps GitHub](https://github.com/react-native-maps/react-native-maps)
