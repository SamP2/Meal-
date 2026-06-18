# Deploy Backend to Railway - Step by Step

## Prerequisites
- GitHub account
- Railway account (free): https://railway.app/

## Step 1: Push Code to GitHub

```bash
cd C:\Users\Samarth\Meal
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app/
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your `Meal` repository**
6. **Railway will detect it's a Node.js project**

## Step 3: Configure Railway

### Set Root Directory
1. In Railway dashboard, go to **Settings**
2. Under **Build**, set **Root Directory** to: `backend`
3. Click **Save**

### Add Environment Variables
1. Go to **Variables** tab
2. Add these variables:

```
SUPABASE_URL=https://zhmzafxgoevhixkwajer.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobXphZnhnb2V2aGl4a3dhamVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODc1NjUsImV4cCI6MjA1MDI2MzU2NX0.LXi3FqkEXJ7eO2snqfV_yREkC1KrCi3BvzEKKCv-0vg
SUPABASE_JWT_SECRET=your-jwt-secret-from-backend-env
PORT=3000
```

**IMPORTANT**: Copy `SUPABASE_JWT_SECRET` from your `backend/.env` file!

3. Click **Add** for each variable

## Step 4: Deploy!

1. Railway will automatically start building
2. Wait 2-3 minutes for deployment
3. Once deployed, go to **Settings** tab
4. Under **Networking**, click **Generate Domain**
5. You'll get a URL like: `https://mess-finder-production.up.railway.app`

## Step 5: Test Your Deployment

```bash
# Test the health endpoint
curl https://YOUR-RAILWAY-URL.railway.app/health
```

Should return: `{"status":"ok"}`

## Step 6: Update Mobile App

1. Copy your Railway URL (e.g., `https://mess-finder-production.up.railway.app`)
2. Update `mobile/app.json`:

```json
"extra": {
  "apiBaseUrl": "https://YOUR-RAILWAY-URL.railway.app",
  "eas": { ... }
}
```

3. Rebuild the APK:

```bash
cd mobile
eas build --platform android --profile preview
```

## Troubleshooting

### Build Fails
- Check **Deployments** tab for error logs
- Make sure `backend` folder has `package.json`
- Verify all environment variables are set

### App Can't Connect
- Make sure Railway URL starts with `https://`
- Test the `/health` endpoint first
- Check if Railway service is running (green status)

### Port Issues
- Railway automatically assigns a port via `process.env.PORT`
- Your `backend/src/index.ts` should already handle this:
  ```typescript
  const PORT = process.env.PORT || 3000;
  ```

## Costs

- **Free Tier**: $5/month credit (enough for small apps)
- **After free credit**: ~$5-10/month for basic usage
- **First deployment**: 100% FREE to try!

## Next Steps

After Railway is live:
1. Update `mobile/app.json` with Railway URL
2. Rebuild APK with `eas build`
3. Your app will work anywhere!
