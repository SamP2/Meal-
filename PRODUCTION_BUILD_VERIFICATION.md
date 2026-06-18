# Production Build Environment Variable Verification

## What Was Done

### 1. Added Supabase Environment Variables to app.json ✅
Updated `mobile/app.json` to include:
```json
"extra": {
  "apiBaseUrl": "http://192.168.1.14:3000",
  "mapboxToken": "pk.eyJ1IjoibWVhbDIxIiwiYSI6ImNtb3pybHU5bDBpcW8ydHIyYmZ5dGEzbjQifQ.vLJWxO5g3DAGlqFmH1j79Q",
  "supabaseUrl": "https://zhmzafxgoevhixkwajer.supabase.co",
  "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "eas": {
    "projectId": "c6791d08-4c17-4271-bfb3-b15fa97abaa0"
  }
}
```

### 2. Enhanced API Client Logging ✅
Updated `mobile/src/api/client.ts` with comprehensive logging:
- ✅ Logs BASE_URL initialization
- ✅ Validates environment variables
- ✅ Logs all API requests with full URLs
- ✅ Logs response status and errors
- ✅ Shows all extra config keys in console

### 3. Created Diagnostics Screen ✅
Created `mobile/src/screens/DiagnosticsScreen.tsx`:
- Shows all environment variables
- Displays system information
- Shows raw extra config JSON
- Can be accessed in production APK for debugging

## How to Test in Production APK

### Method 1: Check Console Logs (Recommended)

When you install the APK on your device, connect it via USB and check logs:

**Android (via USB debugging):**
```bash
# Enable USB debugging on your phone
# Connect phone via USB
adb logcat | grep "API CLIENT"
```

You should see output like:
```
═══════════════════════════════════════════════════════
🔧 API CLIENT INITIALIZATION
═══════════════════════════════════════════════════════
📱 Platform: android
🏗️  Build Type: PRODUCTION
📦 Expo Config Present: true
🔗 BASE_URL: http://192.168.1.14:3000
🔗 BASE_URL Type: string
🔗 BASE_URL Length: 29
✅ BASE_URL is defined: true
✅ BASE_URL is not null: true
✅ BASE_URL is not empty: true
📋 All Extra Config Keys: ['apiBaseUrl', 'mapboxToken', 'supabaseUrl', 'supabaseAnonKey', 'eas']
📋 apiBaseUrl: http://192.168.1.14:3000
📋 mapboxToken: ✅ Present
📋 supabaseUrl: ✅ Present
📋 supabaseAnonKey: ✅ Present
═══════════════════════════════════════════════════════
```

### Method 2: Add Diagnostics Screen to Navigation (Optional)

If you want to see environment variables in-app:

1. Add DiagnosticsScreen to your navigation:

```typescript
// In your navigator file
import DiagnosticsScreen from './src/screens/DiagnosticsScreen';

// Add to stack:
<Stack.Screen name="Diagnostics" component={DiagnosticsScreen} />
```

2. Add a button to access it (e.g., in settings or account screen):

```typescript
<TouchableOpacity onPress={() => navigation.navigate('Diagnostics')}>
  <Text>View Diagnostics</Text>
</TouchableOpacity>
```

### Method 3: Test API Requests

The enhanced logging will show every API request:

```
🌐 API Request: POST /auth/login
🔗 Full URL: http://192.168.1.14:3000/auth/login
⚠️ Request without auth token
✅ API Response: 200 /auth/login
```

Or if there's an error:
```
❌ API Error: /auth/login
❌ Error Message: Network Error
❌ Error Response: undefined
❌ Status Code: undefined
```

## Important Notes

### Your App Architecture
- ✅ Your mobile app **does NOT use Supabase directly**
- ✅ Your mobile app uses **your backend API** (`apiBaseUrl`)
- ✅ Your **backend** uses Supabase
- ✅ This is a good, secure architecture

### What You Need for Production

1. **Deploy Backend to Cloud** (Render/Railway/Fly.io)
   - Currently: `apiBaseUrl: "http://192.168.1.14:3000"` (local)
   - Production: `apiBaseUrl: "https://your-backend.onrender.com"`

2. **Update app.json with Production URL**
   ```json
   "apiBaseUrl": "https://your-backend.onrender.com"
   ```

3. **Rebuild APK**
   ```bash
   cd mobile
   eas build --platform android --profile preview
   ```

## Verification Checklist

Before rebuilding APK, verify:

- [ ] ✅ `apiBaseUrl` in app.json (production backend URL)
- [ ] ✅ `mapboxToken` in app.json (for map features)
- [ ] ✅ `supabaseUrl` in app.json (for reference, used by backend)
- [ ] ✅ `supabaseAnonKey` in app.json (for reference, used by backend)
- [ ] ✅ Backend deployed to cloud (Render/Railway)
- [ ] ✅ Backend environment variables set (in Render dashboard)
- [ ] ✅ Test backend health endpoint: `curl https://your-backend.onrender.com/health`

## Current Status

✅ **Code Updated**: Comprehensive logging added
✅ **app.json Updated**: All environment variables present
✅ **Diagnostics Tool**: Created for in-app verification
🔄 **Next Step**: Deploy backend to Render and update apiBaseUrl
🔄 **Final Step**: Rebuild APK with production backend URL

## Expected Behavior

### If Environment Variables Are Correct:
- App loads without errors
- API requests succeed
- Maps work correctly
- Authentication works

### If Environment Variables Are Missing:
- You'll see `❌ CRITICAL: BASE_URL is not properly configured!` in logs
- API requests will fail immediately
- You'll see error: `Network Error` or `Request failed with status code 404`

## Troubleshooting

### Problem: API requests fail with "Network Error"
**Solution**: 
1. Check logs for BASE_URL value
2. Verify backend is running: `curl https://your-backend.onrender.com/health`
3. Make sure apiBaseUrl in app.json matches deployed backend URL

### Problem: Can't see logs
**Solution**: 
1. Use Diagnostics Screen (add to navigation)
2. Or use remote debugging: `npx react-devtools`
3. Or check Expo logs in browser

### Problem: Environment variables are undefined
**Solution**: 
1. Verify app.json extra config is correct
2. Rebuild APK (environment variables baked in at build time)
3. Don't use .env files - use app.json extra config instead

## Next Steps

1. Deploy backend to Render (see RENDER_DEPLOYMENT.md)
2. Get your production backend URL
3. Update `mobile/app.json` apiBaseUrl to production URL
4. Rebuild APK: `eas build --platform android --profile preview`
5. Install and test APK
6. Check logs to verify environment variables
