# Everyday Menu Feature Summary

## Overview
Added support for "Everyday Menu" - permanent items that are always available, separate from daily lunch/dinner menus.

## Database Changes

### New Table: `everyday_menu_items`

**Schema:**
```sql
CREATE TABLE everyday_menu_items (
  id UUID PRIMARY KEY,
  mess_id UUID REFERENCES messes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
- `idx_everyday_menu_items_mess_id` on `mess_id`

**RLS Policies:**
- Anyone can view everyday menu items
- Mess owners can insert/update/delete their own items

**Migration File:** `backend/supabase/migrations/005_add_everyday_menu.sql`

## Backend API

### New Endpoints

#### 1. GET /messes/:messId/everyday-menu
**Description:** Get all everyday menu items for a mess

**Authentication:** Not required (public)

**Response:**
```json
[
  {
    "id": "uuid",
    "mess_id": "uuid",
    "name": "Roti",
    "price": 5,
    "created_at": "2026-05-02T...",
    "updated_at": "2026-05-02T..."
  }
]
```

#### 2. POST /messes/:messId/everyday-menu
**Description:** Add item to everyday menu

**Authentication:** Required (mess_owner)

**Request Body:**
```json
{
  "name": "Roti",
  "price": 5
}
```

**Validation:**
- `name` is required
- `price` must be a positive number
- Verifies mess ownership

**Response:**
```json
{
  "id": "uuid",
  "mess_id": "uuid",
  "name": "Roti",
  "price": 5,
  "created_at": "2026-05-02T...",
  "updated_at": "2026-05-02T..."
}
```

#### 3. DELETE /everyday-menu/:itemId
**Description:** Delete an everyday menu item

**Authentication:** Required (mess_owner)

**Validation:**
- Verifies item exists
- Verifies mess ownership

**Response:**
```json
{
  "message": "Everyday menu item deleted successfully",
  "deleted": true
}
```

**File:** `backend/src/routes/everydayMenu.ts`

## Mobile - Owner Side

### New Screen: EverydayMenuScreen

**Route:** `EverydayMenu`

**Parameters:**
- `messId` - ID of the mess
- `messName` - Name of the mess

**Features:**
1. **Add New Item Form**
   - Input: Item name
   - Input: Price (₹)
   - Button: "+ Add Item"
   - Validation: Name required, price must be positive

2. **Items List**
   - Shows all everyday menu items
   - Each item displays: name and price
   - Delete button (🗑️) for each item
   - Empty state if no items

3. **Delete Confirmation**
   - Shows dialog before deletion
   - Warning: "This action cannot be undone"
   - Buttons: Cancel / Delete

**File:** `mobile/src/screens/owner/EverydayMenuScreen.tsx`

### Owner Dashboard Updates

**New Button:** "📋 Manage Everyday Menu"
- Placed above lunch/dinner action buttons
- Light blue background (#F0F9FF)
- Blue border and text (#0369A1)
- Navigates to EverydayMenuScreen

**File:** `mobile/src/screens/owner/SimpleOwnerDashboard.tsx`

## Mobile - Student Side

### MessDetailScreen Updates

**New Section:** "📋 Everyday Menu"
- Placed below daily lunch/dinner menus
- Light blue background (#F0F9FF)
- Shows subtitle: "Always available items"

**Display:**
- Lists all everyday menu items
- Each item shows: name and price
- Format: "• Item Name" → "₹Price"

**Empty State:**
- Shows: "No everyday items available"
- Italic text style

**File:** `mobile/src/screens/student/MessDetailScreen.tsx`

## User Flows

### Owner: Adding Everyday Menu Items

1. **Owner Dashboard** - View mess card
2. **Click "📋 Manage Everyday Menu"** - Navigate to EverydayMenuScreen
3. **Enter Item Details** - Name and price
4. **Click "+ Add Item"** - Item added to list
5. **Success** - Item appears in list immediately

### Owner: Deleting Everyday Menu Items

1. **Everyday Menu Screen** - View items list
2. **Click Delete Button (🗑️)** - Shows confirmation
3. **Confirm Delete** - Item removed from list
4. **Success** - List updates immediately

### Student: Viewing Everyday Menu

1. **Browse Messes** - Find a mess
2. **Click Mess Card** - Open MessDetailScreen
3. **Scroll Down** - See "📋 Everyday Menu" section
4. **View Items** - See all always-available items with prices

## Design Decisions

### Separation from Daily Menus
- **Clear Visual Distinction:** Different color scheme (blue vs. brown/orange)
- **Separate Section:** Placed below daily menus
- **Different Icon:** 📋 (clipboard) vs. 🍛/🌙 (food)
- **Explicit Label:** "Everyday Menu" with subtitle

### Why Separate?
1. **Clarity:** Users know which items are always available
2. **Flexibility:** Owners can manage permanent items separately
3. **No Confusion:** Daily menus change, everyday items don't
4. **Better UX:** Students can plan based on permanent availability

### Color Scheme
- **Everyday Menu:** Light blue (#F0F9FF) with blue accents
- **Daily Menus:** White/cream with brown/orange accents
- **Rationale:** Blue suggests "always" or "constant"

## Benefits

1. **Owner Convenience**
   - Manage permanent items once
   - No need to add same items daily
   - Separate management interface

2. **Student Clarity**
   - Know what's always available
   - Can plan visits based on permanent items
   - Clear distinction from daily specials

3. **Flexibility**
   - Owners can have both daily and permanent items
   - Students see complete menu picture
   - Easy to update permanent items

4. **Database Efficiency**
   - Permanent items stored once
   - No duplication in daily menus
   - Cleaner data model

## Testing Checklist

### Backend
- [ ] GET everyday menu - returns items
- [ ] POST everyday menu - creates item
- [ ] POST with invalid data - returns 400
- [ ] POST without ownership - returns 403
- [ ] DELETE everyday menu item - removes item
- [ ] DELETE without ownership - returns 403

### Owner Side
- [ ] Navigate to Everyday Menu screen
- [ ] Add new item - appears in list
- [ ] Add item with invalid data - shows error
- [ ] Delete item - shows confirmation
- [ ] Confirm delete - item removed
- [ ] Cancel delete - no changes
- [ ] Empty state displays correctly

### Student Side
- [ ] View mess with everyday items - displays correctly
- [ ] View mess without everyday items - shows empty state
- [ ] Everyday menu visually distinct from daily menus
- [ ] Items display with correct prices

## Files Created/Modified

### Created:
1. `backend/supabase/migrations/005_add_everyday_menu.sql` - Database migration
2. `backend/src/routes/everydayMenu.ts` - API routes
3. `mobile/src/screens/owner/EverydayMenuScreen.tsx` - Management screen

### Modified:
1. `backend/src/index.ts` - Mounted everyday menu routes
2. `mobile/App.tsx` - Added EverydayMenu route
3. `mobile/src/screens/owner/SimpleOwnerDashboard.tsx` - Added manage button
4. `mobile/src/screens/student/MessDetailScreen.tsx` - Added everyday menu section

## API Examples

### Get Everyday Menu
```bash
GET http://localhost:3000/messes/{messId}/everyday-menu
```

### Add Item
```bash
POST http://localhost:3000/messes/{messId}/everyday-menu
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Roti",
  "price": 5
}
```

### Delete Item
```bash
DELETE http://localhost:3000/everyday-menu/{itemId}
Authorization: Bearer {token}
```

## Future Enhancements

1. **Bulk Operations:** Add multiple items at once
2. **Categories:** Group items (Breads, Rice, Sides, etc.)
3. **Availability Toggle:** Temporarily disable items
4. **Item Images:** Add photos for everyday items
5. **Sorting:** Reorder items by drag-and-drop
6. **Item Descriptions:** Add details about each item
