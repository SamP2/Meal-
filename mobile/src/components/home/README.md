# Home Screen Components

Clean, modular React Native components converted from HTML design.

## Components

### 1. **Header**
Top app bar with greeting, location, and user avatar.

**Props:**
```typescript
{
  greeting: string;        // e.g., "Good Morning"
  userName: string;        // User's name
  userImage?: string;      // Avatar URL (optional)
  location?: string;       // Location text (optional)
}
```

### 2. **SearchBar**
Search input with filter button.

**Props:**
```typescript
{
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
}
```

### 3. **FilterChips**
Horizontal scrollable filter chips.

**Props:**
```typescript
{
  filters: Array<{ id: string; label: string }>;
  activeFilter: string;
  onFilterPress: (filterId: string) => void;
}
```

### 4. **BestPickCard**
Featured mess card with large image.

**Props:**
```typescript
{
  name: string;
  image: string;
  price: number;
  rating: number;
  distance: number;
  description: string;
  tags: string[];
  onPress: () => void;
}
```

### 5. **MessCard**
Compact mess listing card.

**Props:**
```typescript
{
  name: string;
  image: string;
  cuisine: string;
  distance: number;
  rating: number;
  pricePerMeal: number;
  isOpen: boolean;
  status?: string;
  onPress: () => void;
}
```

### 6. **MapSection**
Map preview with "View full map" button.

**Props:**
```typescript
{
  mapImageUrl?: string;
  onViewFullMap: () => void;
}
```

### 7. **SectionHeader**
Section title with optional action button.

**Props:**
```typescript
{
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}
```

### 8. **BottomNav**
Bottom navigation bar with 4 tabs.

**Props:**
```typescript
{
  activeTab: string;
  onTabPress: (tabId: string) => void;
}
```

## Usage Example

```tsx
import {
  Header,
  SearchBar,
  FilterChips,
  BestPickCard,
  MessCard,
  MapSection,
  SectionHeader,
  BottomNav,
} from '../../components/home';

function HomeScreen() {
  return (
    <SafeAreaView>
      <Header greeting="Good Morning" userName="Foodie" />
      <ScrollView>
        <SearchBar value={search} onChangeText={setSearch} onFilterPress={handleFilter} />
        <FilterChips filters={FILTERS} activeFilter={active} onFilterPress={setActive} />
        <BestPickCard {...bestPickData} onPress={handlePress} />
        <MessCard {...messData} onPress={handlePress} />
        <MapSection onViewFullMap={handleMapPress} />
      </ScrollView>
      <BottomNav activeTab="discover" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}
```

## Color Palette (from HTML design)

```javascript
{
  primary: '#AB3500',
  primaryContainer: '#FF6B35',
  background: '#FFF8F6',
  surface: '#FFF8F6',
  surfaceContainerLow: '#FFF1ED',
  surfaceDim: '#EED5CD',
  onBackground: '#261814',
  onSurface: '#261814',
  onSurfaceVariant: '#594139',
  outline: '#8D7168',
  outlineVariant: '#E1BFB5',
  secondary: '#635D58',
}
```

## Next Steps

1. **Connect to Supabase:**
   - Replace placeholder data with real API calls
   - Fetch messes, ratings, distances from backend

2. **Add Navigation:**
   - Wire up `onPress` handlers to navigate to detail screens
   - Implement bottom nav tab switching

3. **Add State Management:**
   - Manage search, filters, and data fetching
   - Handle loading and error states

4. **Enhance Features:**
   - Add pull-to-refresh
   - Implement infinite scroll
   - Add skeleton loaders
