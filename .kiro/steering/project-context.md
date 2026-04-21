---
inclusion: always
---

# MessFinder — Project Context

## What We're Building
A two-sided mobile platform for university/college students to discover nearby messes (local canteens/food stalls), browse daily menus, and decide where to eat. Mess owners can register their mess, manage daily menus, and toggle open/close status.

## Project Structure
```
Meal/
├── backend/          — Node.js + Express + TypeScript REST API
└── mobile/           — React Native (Expo SDK 54) mobile app
```

## Tech Stack
- Mobile: React Native (Expo SDK 54), React Navigation v6, Axios
- Backend: Node.js + Express + TypeScript, running on port 3000
- Database: PostgreSQL on Supabase with PostGIS for proximity search
- Auth: Supabase Auth (JWT, email/password, no email confirmation in dev)
- Theme: Custom teal + amber design system with light/dark mode

## Running the Project
```bash
# Backend
cd backend && npx ts-node src/index.ts

# Mobile
cd mobile && npx expo start --port 8095 --clear
```

## Key Files
- `backend/src/index.ts` — Express app entry, all routers mounted here
- `backend/src/routes/auth.ts` — POST /auth/register, POST /auth/login
- `backend/src/routes/messes.ts` — Mess CRUD + nearby search
- `backend/src/routes/menus.ts` — Menu + menu item CRUD
- `backend/src/middleware/authenticate.ts` — JWT validation
- `backend/src/middleware/requireRole.ts` — Role-based access (student | mess_owner)
- `backend/supabase/migrations/001_initial_schema.sql` — Full DB schema
- `backend/supabase/migrations/002_nearby_messes_fn.sql` — PostGIS proximity function
- `mobile/App.tsx` — Root navigator, role-based routing
- `mobile/src/context/AuthContext.tsx` — Auth state (user, login, logout)
- `mobile/src/context/ThemeContext.tsx` — Light/dark theme toggle
- `mobile/src/theme/` — Colors, spacing, typography, shadows
- `mobile/src/components/` — Button, Input, Card, Badge (shared UI)
- `mobile/src/api/client.ts` — Axios instance, auth token interceptor

## API Endpoints
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /auth/register | public | Register student or mess_owner |
| POST | /auth/login | public | Login, returns JWT |
| POST | /messes | mess_owner | Create a mess |
| GET | /messes/nearby | student | GPS-based nearby search (PostGIS) |
| GET | /messes/mine | mess_owner | List own messes |
| GET | /messes/:id | student | Mess details |
| PATCH | /messes/:id/status | mess_owner | Toggle open/close |
| GET | /messes/:messId/menu | student | Get menu for a date |
| PUT | /messes/:messId/menu/:date | mess_owner | Replace full menu |
| DELETE | /messes/:messId/menu/:date | mess_owner | Delete menu |
| POST | /messes/:messId/menu/:date/items | mess_owner | Add single item |
| PATCH | /messes/:messId/menu/:date/items/:itemId | mess_owner | Update item |
| DELETE | /messes/:messId/menu/:date/items/:itemId | mess_owner | Remove item |

## Database Schema
- `profiles` — mirrors Supabase auth users, stores role
- `messes` — mess listings with PostGIS geography column for proximity
- `menus` — one per mess per date (unique constraint)
- `menu_items` — items within a menu, ordered by sort_order

## Mobile Screens
**Auth:** LoginScreen, RegisterScreen (role selector: student | mess_owner)

**Student:** NearbyMessesScreen (GPS + search), MessDetailScreen (directions via Google Maps), MenuScreen

**Owner:** MyMessesScreen (dashboard + FAB), RegisterMessScreen (GPS auto-detect location), ManageMessScreen (status toggle + quick actions), MenuManagementScreen (add/delete items)

## Environment Variables
**Backend** (`backend/.env`):
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET, PORT=3000

**Mobile** (`mobile/.env`):
- API_BASE_URL=http://192.168.1.14:3000 (use PC's local IP for physical device)
- Use http://10.0.2.2:3000 for Android emulator
- Use http://localhost:3000 for web

## Current Status
- Backend: fully built and running
- Mobile: fully built, testable via Expo Go (SDK 54) on physical device
- Supabase: DB schema deployed, PostGIS function deployed, email confirmation OFF for dev
- Known: Google Maps API key not yet configured (directions use Linking to open Maps app)

## Planned Features (not yet built)
- Monthly subscription model
- Ratings and reviews
- Push notifications
- Mess photos
- Revenue model / payments
- Admin panel
- EAS Build for APK distribution
