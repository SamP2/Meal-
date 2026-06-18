# Menu Preview Update - StudentHomeScreen

## Changes Made ✅

### 1. Updated MessCard Component
**File:** `mobile/src/components/home/MessCard.tsx`

#### Added Props:
```typescript
interface MessCardProps {
  // ... existing props
  lunch?: { items: string[]; price: number } | null;
  dinner?: { items: string[]; price: number } | null;
}
```

#### Added Menu Preview Logic:
```typescript
const getMenuPreview = () => {
  const previews = [];
  
  if (lunch && lunch.items && lunch.items.length > 0) {
    const lunchItems = lunch.items.slice(0, 2).join(', ');
    previews.push(`🍛 Lunch: ${lunchItems}`);
  }
  
  if (dinner && dinner.items && dinner.items.length > 0) {
    const dinnerItems = dinner.items.slice(0, 2).join(', ');
    previews.push(`🌙 Dinner: ${dinnerItems}`);
  }
  
  if (previews.length === 0) {
    return 'No menu today';
  }
  
  return previews.join(' • ');
};
```

#### Added Menu Preview Display:
```typescript
<Text style={styles.menuPreview} numberOfLines={1}>
  {menuPreview}
</Text>
```

#### Added Styling:
```typescript
menuPreview: {
  fontSize: 12,
  fontWeight: '500',
  color: '#AB3500',  // Teal/orange theme color
  lineHeight: 16,
  marginBottom: 8,
}
```

### 2. Updated StudentHomeScreen
**File:** `mobile/src/screens/student/NewStudentHomeScreen.tsx`

#### Passed Menu Data to MessCard:
```typescript
<MessCard
  key={mess.id}
  name={mess.name}
  // ... other props
  lunch={mess.lunch}
  dinner={mess.dinner}
  onPress={() => handleMessPress(mess.id)}
/>
```

## Display Logic

### Case 1: Both Lunch and Dinner Available
```
🍛 Lunch: Dal, Roti • 🌙 Dinner: Paneer, Naan
```

### Case 2: Only Lunch Available
```
🍛 Lunch: Dal, Roti
```

### Case 3: Only Dinner Available
```
🌙 Dinner: Pizza, Burger
```

### Case 4: No Menu Available
```
No menu today
```

## Examples Based on Current Data

### Test Mess
- **Lunch:** Panner, naan, chavl7
- **Display:** `🍛 Lunch: Panner, naan`

### Tiku Mess
- **Dinner:** Pizza, burger
- **Display:** `🌙 Dinner: Pizza, burger`

### Athrva Mess
- **Lunch:** Daru, ganja
- **Display:** `🍛 Lunch: Daru, ganja`

### Adis Katta
- **No menu**
- **Display:** `No menu today`

## Visual Layout

```
┌─────────────────────────────────────────────┐
│  🍽️    Test Mess              [OPEN NOW]   │
│        Mixed • 12.1 km                      │
│        🍛 Lunch: Panner, naan               │ ← NEW
│        ⭐ 4.5              ₹100/meal        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🍽️    Tiku Mess              [OPEN NOW]   │
│        Mixed • 12.1 km                      │
│        🌙 Dinner: Pizza, burger             │ ← NEW
│        ⭐ 4.5              ₹100/meal        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🍽️    Adis Katta             [OPEN NOW]   │
│        Mixed • 12.1 km                      │
│        No menu today                        │ ← NEW
│        ⭐ 4.5              ₹100/meal        │
└─────────────────────────────────────────────┘
```

## Features

### ✅ Shows First 2 Items
- Limits display to first 2 items from each menu
- Prevents card from becoming too tall
- Gives quick preview without overwhelming

### ✅ Emoji Indicators
- 🍛 for Lunch
- 🌙 for Dinner
- Clear visual distinction

### ✅ Handles All Cases
- Both menus available
- Only lunch available
- Only dinner available
- No menu available

### ✅ Truncation
- Uses `numberOfLines={1}` to prevent wrapping
- Long menu items will be truncated with "..."

### ✅ Color Coding
- Menu preview uses theme color `#AB3500` (teal/orange)
- Stands out from other text
- Consistent with price color

## Testing

### Test on Mobile App:
1. Open StudentHomeScreen
2. Pull down to refresh
3. Check each mess card:
   - **Test Mess** → Should show "🍛 Lunch: Panner, naan"
   - **Tiku Mess** → Should show "🌙 Dinner: Pizza, burger"
   - **Athrva Mess** → Should show "🍛 Lunch: Daru, ganja"
   - **Adis Katta** → Should show "No menu today"

### Expected Console Logs:
```
🏠 [StudentHome] Component rendered, messes count: 4
📊 [StudentHome] Number of messes: 4
📝 [StudentHome] Mess names: Test Mess, Tiku Mess, Adis Katta, Athrva Mess
```

## Benefits

### For Users:
- ✅ See menu at a glance without clicking
- ✅ Quickly compare what different messes offer
- ✅ Make faster decisions about where to eat
- ✅ Know which messes have menus today

### For UX:
- ✅ More informative cards
- ✅ Better use of card space
- ✅ Reduces need to click into details
- ✅ Improves browsing experience

## Files Modified

1. ✅ `mobile/src/components/home/MessCard.tsx`
   - Added lunch and dinner props
   - Added getMenuPreview() function
   - Added menu preview display
   - Added menuPreview style

2. ✅ `mobile/src/screens/student/NewStudentHomeScreen.tsx`
   - Passed lunch and dinner data to MessCard

## Next Steps

### Recommended Enhancements:
1. **Add "View Full Menu" indicator** if more than 2 items
   - Example: "🍛 Lunch: Dal, Roti +3 more"

2. **Make menu preview tappable** to open menu details
   - Quick access to full menu

3. **Add time-based filtering**
   - Show only lunch before 4 PM
   - Show only dinner after 4 PM

4. **Add menu update time**
   - "Updated 2 hours ago"

5. **Highlight special items**
   - Bold or different color for special dishes

## Summary

✅ **Menu preview now displays on mess cards**
✅ **Shows first 2 items from lunch and/or dinner**
✅ **Handles all cases (both, one, or no menu)**
✅ **Uses emoji indicators for clarity**
✅ **Styled with theme colors**

The StudentHomeScreen now provides much more useful information at a glance, helping students quickly decide where to eat! 🎉
