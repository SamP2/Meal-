# Student Home Screen - Backend Integration

## Summary
Connected the StudentHomeScreen to real backend data using the optimized `/messes/nearby-with-menus` endpoint.

## Changes Made

### 1. Updated Mess Interface
**File:** `mobile/src/screens/student/NewStudentHomeScreen.tsx`

Changed from the old interface with many unused fields to a streamlined interface matching the backend response:

```typescript
interface Mess {
  id: string;
  name: string;
  address: string;
  distance_km: number;
  is_open: boolean;
  price_range: string | null;
  rating: number;
  is_veg: boolean;
  cuisine: string;
  lunch: {
    items: string[];
    price: number;
  } | null;
  dinner: {
    items: string[];
    price: number;
  } | null;
}
```

### 2. Updated API Endpoint
Changed from `/messes/nearby` to `/messes/nearby-with-menus`:

**Before:**
```typescript
const { data } = await apiClient.get('/messes/nearby', {
  params: { lat, lng, radius: 50 }
});
const messes = data.messes || [];
```

**After:**
```typescript
const { data } = await apiClient.get('/messes/nearby-with-menus', {
  params: { lat, lng, radius: 50 }
});
const messes = Array.isArray(data) ? data : [];
```

### 3. Updated Best Pick Card
Now displays actual menu items from lunch or dinner:

```typescript
description={
  bestPick.lunch 
    ? `Today's Lunch: ${bestPick.lunch.items.slice(0, 3).join(', ')}...`
    : bestPick.dinner
    ? `Today's Dinner: ${bestPick.dinner.items.slice(0, 3).join(', ')}...`
    : 'Delicious home-cooked meals with authentic flavors.'
}
```

### 4. Updated Mess Cards
Now uses actual menu prices from lunch or dinner:

```typescript
pricePerMeal={mess.lunch?.price || mess.dinner?.price || 100}
```

## Backend Endpoint Details

**Endpoint:** `GET /messes/nearby-with-menus`

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude  
- `radius` (optional): Search radius in km (default: 5)

**Response Format:**
```json
[
  {
    "id": "uuid",
    "name": "Mess Name",
    "address": "Full Address",
    "distance_km": 2.5,
    "is_open": true,
    "price_range": "₹80-120",
    "rating": 4.5,
    "is_veg": true,
    "cuisine": "North Indian",
    "lunch": {
      "items": ["Dal", "Roti", "Rice"],
      "price": 100
    },
    "dinner": {
      "items": ["Paneer", "Chapati", "Dal"],
      "price": 120
    }
  }
]
```

## Performance Improvements

### Single API Call
- **Before:** Multiple calls to fetch messes, then separate calls for each menu
- **After:** One optimized call that returns messes with their menus

### Data Efficiency
- Backend joins `messes`, `menus`, and `menu_items` tables in a single query
- Returns only today's menus (lunch and dinner)
- Sorted by distance automatically

## Testing

### Current Status
- ✅ Backend running on port 3000
- ✅ Expo running on port 8095
- ✅ API endpoint `/messes/nearby-with-menus` implemented
- ✅ Frontend updated to use new endpoint

### Test Credentials
- **Owner:** test1@gmail.com / Qwer@123
- **Test Location:** Pune, India (18.5204, 73.8567)
- **Search Radius:** 50km

### Expected Behavior
1. On screen load, fetch nearby messes with menus
2. Display loading skeletons while fetching
3. Show "Best Pick" card with highest-rated mess
4. Display menu items in description (first 3 items)
5. Show nearby messes with actual prices from menus
6. Handle empty state when no messes found
7. Pull-to-refresh functionality

### Error Handling
- Network errors: "Cannot connect to server"
- Timeout errors: "Request timed out"
- Server errors: Shows status code and message
- Empty results: Shows "No messes nearby" with emoji

## Next Steps

### Recommended Enhancements
1. **Add Menu Preview in Cards**
   - Show "🍛 Lunch: Dal, Roti, Rice" below mess name
   - Show "🍽️ Dinner: Paneer, Chapati" if available

2. **Filter by Menu Availability**
   - Add filter chip: "Has Lunch Menu"
   - Add filter chip: "Has Dinner Menu"

3. **Real-time Updates**
   - Auto-refresh when app comes to foreground
   - Show "Updated 2 mins ago" timestamp

4. **GPS Location**
   - Replace test location with actual GPS
   - Request location permissions
   - Show distance from user's location

5. **Caching**
   - Cache messes data for offline viewing
   - Show cached data while fetching fresh data

## Files Modified
- `mobile/src/screens/student/NewStudentHomeScreen.tsx`

## Files Referenced
- `backend/src/routes/messes.ts` (endpoint already exists)
- `mobile/src/components/home/MessCard.tsx` (no changes needed)
- `mobile/src/components/home/BestPickCard.tsx` (no changes needed)
