# Delete Menu Feature Summary

## Overview
Added delete functionality for lunch and dinner menus in the Owner Dashboard with confirmation dialog and safe deletion.

## Backend Changes

### New Endpoint: DELETE /menus/:messId/today

**Route:** `DELETE /menus/:messId/today?meal_type=lunch|dinner`

**Authentication:** Required (mess_owner role)

**Query Parameters:**
- `meal_type` (required): "lunch" or "dinner"

**Validation:**
- Verifies mess ownership
- Checks meal_type is valid
- Ensures menu exists for today

**Process:**
1. Finds today's menu for the specified meal type
2. Deletes menu items first (foreign key constraint)
3. Deletes the menu record
4. Returns success message

**Response:**
```json
{
  "message": "Lunch menu deleted successfully",
  "deleted": true,
  "meal_type": "lunch",
  "date": "2026-05-02"
}
```

**Error Responses:**
- 400: Invalid meal_type
- 403: Not the mess owner
- 404: Mess or menu not found
- 500: Internal server error

**File:** `backend/src/routes/menus.ts`

## Mobile Changes

### SimpleOwnerDashboard Updates

**New Function: `handleDeleteMenu()`**
- Shows confirmation dialog before deletion
- Calls DELETE endpoint with meal_type
- Refreshes dashboard after successful deletion
- Shows error alert if deletion fails

**UI Changes:**

**Before:**
```
[ Edit Lunch ] [ Edit Dinner ]
```

**After:**
```
[ Edit Lunch ] [🗑️]    [ Edit Dinner ] [🗑️]
```

**Layout:**
- Each meal type has its own action button group
- Edit button takes most space (flex: 1)
- Delete button is compact (50px width)
- Delete button only shows if menu exists

**Confirmation Dialog:**
```
Title: "Delete Menu"
Message: "Delete lunch menu for Test Mess?

This action cannot be undone."

Buttons: [Cancel] [Delete]
```

**Styling:**
- Delete button: Light red background (#FEE2E2)
- Delete icon: 🗑️ emoji (18px)
- Subtle appearance to avoid accidental clicks
- Destructive action style in alert

**File:** `mobile/src/screens/owner/SimpleOwnerDashboard.tsx`

## User Flow

### Deleting a Menu

1. **Owner Dashboard** - View mess card with existing menu
2. **Click Delete Button** (🗑️) - Next to Edit button
3. **Confirmation Dialog** - Shows warning message
4. **Confirm Delete** - Click "Delete" button
5. **API Call** - DELETE /menus/:messId/today?meal_type=lunch
6. **Success** - Dashboard refreshes, menu removed
7. **UI Update** - Delete button disappears, "Add" button appears

### Error Handling

**If deletion fails:**
- Shows error alert: "Could not delete lunch menu. Please try again."
- Dashboard state remains unchanged
- User can retry

**If menu doesn't exist:**
- Backend returns 404
- Shows error alert
- Dashboard refreshes to sync state

## Safety Features

1. **Confirmation Dialog**
   - Requires explicit confirmation
   - Shows mess name and meal type
   - Warns "This action cannot be undone"

2. **Ownership Verification**
   - Backend verifies mess ownership
   - Prevents unauthorized deletions

3. **Subtle UI**
   - Delete button is small and secondary
   - Not prominently displayed
   - Reduces accidental clicks

4. **Immediate Feedback**
   - Shows loading state during deletion
   - Refreshes dashboard on success
   - Shows error message on failure

5. **Database Integrity**
   - Deletes menu items first (foreign key)
   - Then deletes menu record
   - Maintains referential integrity

## Testing Checklist

- [ ] Delete lunch menu - success
- [ ] Delete dinner menu - success
- [ ] Cancel deletion - no changes
- [ ] Delete non-existent menu - shows error
- [ ] Delete without ownership - shows 403 error
- [ ] Dashboard refreshes after deletion
- [ ] Delete button disappears after deletion
- [ ] Add button appears after deletion
- [ ] Multiple deletions in sequence
- [ ] Network error handling

## API Examples

### Delete Lunch Menu
```bash
DELETE http://localhost:3000/menus/{messId}/today?meal_type=lunch
Authorization: Bearer {token}
```

### Delete Dinner Menu
```bash
DELETE http://localhost:3000/menus/{messId}/today?meal_type=dinner
Authorization: Bearer {token}
```

## Files Modified

1. **Backend:**
   - `backend/src/routes/menus.ts` - Added DELETE endpoint

2. **Mobile:**
   - `mobile/src/screens/owner/SimpleOwnerDashboard.tsx` - Added delete functionality and UI

## Benefits

1. **Owner Control** - Full CRUD operations on menus
2. **Safe Deletion** - Confirmation prevents accidents
3. **Clean UI** - Subtle delete button doesn't clutter interface
4. **Immediate Feedback** - Dashboard updates instantly
5. **Error Handling** - Clear error messages for failures
6. **Database Safety** - Proper foreign key handling
