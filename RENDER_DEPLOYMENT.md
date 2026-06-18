# Deploy Backend to Render - 100% Free (No Credit Card)

## Why Render?
- ✅ **Completely FREE** - no credit card required
- ✅ 750 hours/month free tier
- ✅ Auto-deploys from GitHub
- ✅ Easy setup (5 minutes)
- ⚠️ Spins down after 15 min inactivity (first request ~30 sec)

## Step-by-Step Deployment

### Step 1: Go to Render

1. Visit: https://render.com/
2. Click **"Get Started for Free"**
3. Sign up with **GitHub**

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account (if not already)
3. Find and select **`SamP2/Meal-`** repository
4. Click **"Connect"**

### Step 3: Configure Service

Fill in these settings:

**Basic Settings:**
- **Name**: `mess-finder-backend` (or any name you like)
- **Region**: Choose closest to your users (e.g., Singapore for Asia)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** ($0/month)

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section and add:

```
SUPABASE_URL=https://zhmzafxgoevhixkwajer.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobXphZnhnb2V2aGl4a3dhamVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODc1NjUsImV4cCI6MjA1MDI2MzU2NX0.LXi3FqkEXJ7eO2snqfV_yREkC1KrCi3BvzEKKCv-0vg
SUPABASE_JWT_SECRET=<COPY_FROM_backend/.env>
PORT=3000
```

**IMPORTANT**: Copy the `SUPABASE_JWT_SECRET` from your `backend/.env` file!

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Render will start building (takes ~2-3 minutes)
3. Watch the logs for any errors
4. Once deployed, you'll get a URL like: `https://mess-finder-backend.onrender.com`

### Step 6: Test Your Backend

```bash
# Test the health endpoint
curl https://YOUR-RENDER-URL.onrender.com/health
```

Should return: `{"status":"ok"}`

### Step 7: Update Mobile App

1. Copy your Render URL (e.g., `https://mess-finder-backend.onrender.com`)
2. Update `mobile/app.json`:

```json
"extra": {
  "apiBaseUrl": "https://YOUR-RENDER-URL.onrender.com",
  "mapboxToken": "...",
  "eas": { ... }
}
```

3. Commit and rebuild APK:

```bash
git add mobile/app.json
git commit -m "Update backend URL to Render"
git push origin main

cd mobile
eas build --platform android --profile preview
```

## Free Tier Limitations

- **750 hours/month** = 31 days of 24/7 uptime ✅
- **Spins down after 15 min** of no requests
- **First request after spin-down**: ~30 seconds delay
- **No credit card required** ✅

## Keeping Your Backend Awake (Optional)

If you want to avoid the 30-second delay:

### Option 1: Use UptimeRobot (Free)
1. Go to: https://uptimerobot.com/
2. Create free account
3. Add monitor: `https://YOUR-RENDER-URL.onrender.com/health`
4. Set interval: 5 minutes
5. This will ping your backend every 5 min → stays awake 24/7

### Option 2: Use Cron-job.org (Free)
1. Go to: https://cron-job.org/
2. Create free account
3. Add job to ping your health endpoint every 10 minutes

## Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Make sure `backend/package.json` has correct scripts
- Verify all environment variables are set

### App Can't Connect
- Make sure URL starts with `https://`
- Test `/health` endpoint first
- Check if service is running (green status in Render)

### Slow First Load
- Normal behavior on free tier
- Use UptimeRobot to keep it awake
- Or upgrade to paid plan ($7/month) for always-on

## Costs

- **Free Tier**: $0/month forever ✅
- **Paid Tier**: $7/month (no spin-down, more resources)

## Next Steps

After Render is live:
1. Update `mobile/app.json` with Render URL
2. Rebuild APK with `eas build`
3. Your app will work anywhere!
4. (Optional) Set up UptimeRobot to keep backend awake
