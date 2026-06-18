# Get Your Supabase Service Role Key

## 🔑 Where to Find It

1. **Open Supabase Dashboard**: https://zhmzafxgoevhixkwajer.supabase.co
2. **Click "Settings"** (gear icon in left sidebar)
3. **Click "API"**
4. **Scroll down to "Project API keys"**
5. **Find "service_role" key** (it's a long JWT token)
6. **Click "Reveal" or the eye icon** to show it
7. **Copy the entire key**

## ⚠️ Important
- **DO NOT share this key publicly**
- **DO NOT commit it to git**
- This key bypasses all RLS policies
- Only use it in backend code, never in frontend

## 📝 Add to .env

Once you have the key, add it to `backend/.env`:

```env
# Add this line at the end
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

Replace the `eyJhbGci...` part with your actual service role key.

## 🔄 Restart Backend

After adding the key:

```bash
cd backend
npx ts-node src/index.ts
```

## ✅ Test Upload

Now the upload should work because the backend will use the service role key which bypasses RLS!
