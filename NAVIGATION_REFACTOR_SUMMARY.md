# Navigation Refactor Summary

## Overview
Refactored the app navigation to create a clean separation between Student and Owner flows with persistent authentication.

## Key Changes

### 1. **Auth Persistence with AsyncStorage**
- ✅ Installed `@react-native-async-storage/async-storage`
- ✅ Updated `AuthContext` to persist auth state across app restarts
- ✅ Auth token and user data stored in AsyncStorage
- ✅ Auto-loads auth on app start (but doesn't auto-redirect)

**File:** `mobile/src/context/AuthContext.tsx`
- Added `isLoading` state for initial auth check
- `login()` and `logout()` now async and persist to storage
- Storage key: `@mess_finder_auth`

### 2. **Navigation Structure**
- ✅ App always starts with StudentStack (no role-based auto-routing)
- ✅ OwnerStack is a separate stack accessible via manual navigation
- ✅ Both stacks exist at root level for smooth switching

**File:** `mobile/App.tsx`
- Removed role-based conditional rendering
- Added `OwnerStackWithNav` wrapper for bottom nav
- Both stacks accessible via navigation

### 3. **Student Experience**
- ✅ Removed floating "Owner" FAB button from StudentHomeScreen
- ✅ Added subtle 3-dot menu in Header component
- ✅ Menu shows "Are you a mess owner?" or "Owner Dashboard" based on auth state
- ✅ Clean, distraction-free UI for students

**Files:**
- `mobile/src/components/home/Header.tsx` - Added menu modal
- `mobile/src/screens/student/NewStudentHomeScreen.tsx` - Removed FAB

### 4. **Owner Access Flow**

#### **Not Logged In:**
1. Tap 3-dot menu in header
2. Tap "Are you a mess owner?"
3. Navigate to LoginScreen
4. After login → Navigate to OwnerStack

#### **Already Logged In:**
1. Tap 3-dot menu in header
2. Tap "Owner Dashboard"
3. Navigate directly to OwnerStack (no login required)

**File:** `mobile/src/screens/auth/LoginScreen.tsx`
- After successful login, navigates to `OwnerStack`

### 5. **Owner Dashboard**
- ✅ Added "← Back to App" button in header
- ✅ Clicking back button navigates to StudentHome (without logout)
- ✅ Logout button clears auth and resets navigation to StudentHome

**File:** `mobile/src/screens/owner/SimpleOwnerDashboard.tsx`
- `handleBackToApp()` - Navigate to StudentStack without logout
- `handleLogout()` - Clear auth + reset navigation

### 6. **Logout Behavior**
```typescript
const handleLogout = async () => {
  await logout(); // Clear AsyncStorage + auth state
  navigation.reset({
    index: 0,
    routes: [{ name: 'StudentStack', params: { screen: 'StudentHome' } }],
  });
};
```

## User Flows

### **Student Flow (Default)**
```
App Launch → Splash → Onboarding → StudentHome
```

### **Owner Login Flow**
```
StudentHome → 3-dot menu → "Are you a mess owner?" → Login → OwnerDashboard
```

### **Owner Returning (Already Logged In)**
```
App Launch → Splash → Onboarding → StudentHome → 3-dot menu → "Owner Dashboard" → OwnerDashboard
```

### **Owner Switching to Student View**
```
OwnerDashboard → "← Back to App" → StudentHome (still logged in)
```

### **Owner Logout**
```
OwnerDashboard → "Logout" → StudentHome (auth cleared)
```

## Benefits

1. **Clean Separation**
   - Students never see owner UI
   - Owner access is hidden but accessible

2. **Persistent Auth**
   - Owners don't need to login every time
   - Auth survives app restarts

3. **Smooth Switching**
   - Owners can switch between dashboard and student view
   - No forced logout when switching views

4. **Simple Student UX**
   - No distracting owner buttons
   - Clean, focused interface

5. **Flexible Navigation**
   - Manual navigation between stacks
   - No role-based auto-routing
   - Full control over navigation flow

## Technical Details

### **AsyncStorage Keys**
- `@mess_finder_auth` - Stores user auth data (id, email, role, token)

### **Navigation Params**
```typescript
// Navigate to OwnerStack
navigation.navigate('OwnerStack', { screen: 'Dashboard' });

// Navigate to StudentStack
navigation.navigate('StudentStack', { screen: 'StudentHome' });

// Reset to StudentStack (after logout)
navigation.reset({
  index: 0,
  routes: [{ name: 'StudentStack', params: { screen: 'StudentHome' } }],
});
```

### **Auth Context API**
```typescript
interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean; // NEW: for initial auth check
}
```

## Testing Checklist

- [ ] Fresh install - app starts with StudentHome
- [ ] Owner login - navigates to OwnerDashboard
- [ ] Back to App - returns to StudentHome without logout
- [ ] Logout - clears auth and returns to StudentHome
- [ ] App restart - owner still logged in
- [ ] 3-dot menu - shows correct text based on auth state
- [ ] Student UI - no owner buttons visible
- [ ] Owner dashboard - shows messes correctly

## Files Modified

1. `mobile/src/context/AuthContext.tsx` - Added AsyncStorage persistence
2. `mobile/App.tsx` - Refactored navigation structure
3. `mobile/src/components/home/Header.tsx` - Added 3-dot menu
4. `mobile/src/screens/student/NewStudentHomeScreen.tsx` - Removed FAB
5. `mobile/src/screens/auth/LoginScreen.tsx` - Navigate to OwnerStack after login
6. `mobile/src/screens/owner/SimpleOwnerDashboard.tsx` - Added back button and logout
7. `mobile/package.json` - Added AsyncStorage dependency

## Dependencies Added

```json
{
  "@react-native-async-storage/async-storage": "^1.x.x"
}
```
