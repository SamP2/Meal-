import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MessCard from '../../components/home/MessCard';
import MessCardSkeleton from '../../components/home/MessCardSkeleton';
import BestPickCard from '../../components/home/BestPickCard';
import MapSection from '../../components/home/MapSection';
import Header from '../../components/home/Header';
import apiClient from '../../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Mess {
  id: string;
  name: string;
  address: string;
  distance_km: number;
  is_open: boolean;
  verified: boolean;
  price_range: string | null;
  rating: number;
  is_veg: boolean;
  cuisine: string;
  latitude: number;
  longitude: number;
  cover_image_url: string | null;
  opening_time?: string;
  closing_time?: string;
  lunch: { items: string[]; price: number } | null;
  dinner: { items: string[]; price: number } | null;
}

const FILTERS = [
  { id: 'nearby',    label: 'Nearby' },
  { id: 'open-now', label: 'Open' },
  { id: 'top-rated', label: 'Top Rated' },
  { id: 'budget',   label: 'Budget' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewStudentHomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery]   = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('nearby');
  const [messes, setMesses]             = useState<Mess[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Locating…');

  // Cache location so back-navigation doesn't re-request GPS
  const cachedLocation = useRef<{ lat: number; lng: number } | null>(null);
  // Track if initial load was done — avoid full reload on back-nav
  const initialLoadDone = useRef(false);
  // Debounce timer
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search — only update filter query 300ms after typing stops
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(text), 300);
  }, []);

  // ── Get real GPS location + reverse geocode ──────────────────────────────
  const getLocation = async (): Promise<{ lat: number; lng: number }> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Permission denied — fall back to Pune test coords
        setLocationName('Pune, India');
        return { lat: 18.5204, lng: 73.8567 };
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;

      // Reverse geocode to get area name
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const parts = [
          place.district || place.subregion || place.city,
          place.city || place.region,
        ].filter(Boolean);
        setLocationName(parts.length > 0 ? parts.join(', ') : 'Your Location');
      } catch {
        setLocationName('Your Location');
      }

      return { lat: latitude, lng: longitude };
    } catch {
      setLocationName('Pune, India');
      return { lat: 18.5204, lng: 73.8567 };
    }
  };

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchNearbyMesses = useCallback(async (forceRefresh = false) => {
    // Skip full reload on back-navigation if data already loaded
    if (initialLoadDone.current && !forceRefresh) return;

    // Use cached location if available — avoids re-requesting GPS on every focus
    let loc = cachedLocation.current;
    if (!loc || forceRefresh) {
      if (!forceRefresh) setLoading(true);
      loc = await getLocation();
      cachedLocation.current = loc;
      setUserLocation(loc);
    }

    try {
      const { data } = await apiClient.get('/messes/nearby-with-menus', {
        params: { lat: loc.lat, lng: loc.lng, radius: 5 },
      });
      setMesses(Array.isArray(data) ? data : []);
      initialLoadDone.current = true;
    } catch (error: any) {
      const msg = error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')
        ? 'Cannot connect to server. Make sure the backend is running.'
        : error.response
          ? `Server error: ${error.response.status}`
          : 'Could not load nearby messes.';
      if (!initialLoadDone.current) Alert.alert('Error', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchNearbyMesses(); }, [fetchNearbyMesses]));

  // ── Filtering & sorting ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...messes];

    // Text search — uses debounced query so it doesn't recalc on every keystroke
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.cuisine?.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case 'open-now':
        result = result.filter(m => m.is_open);
        break;
      case 'top-rated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'budget':
        result = result.filter(m => {
          const p = m.lunch?.price ?? m.dinner?.price ?? Infinity;
          return p <= 100;
        });
        break;
    }

    // Always: verified first, then distance
    result.sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      return a.distance_km - b.distance_km;
    });

    return result;
  }, [messes, debouncedQuery, activeFilter]);

  const bestPick   = useMemo(() =>
    filtered.length > 0 ? filtered.reduce((p, c) => c.rating > p.rating ? c : p) : null,
    [filtered]
  );
  const nearbyList = useMemo(() =>
    filtered.filter(m => m.id !== bestPick?.id).slice(0, 6),
    [filtered, bestPick]
  );

  // ── Search suggestions (from all messes, not filtered) ───────────────────
  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return messes.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.cuisine?.toLowerCase().includes(q) ||
      m.address?.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [messes, debouncedQuery]);

  // ── Stable callbacks — won't cause MessCard re-renders ───────────────────
  const handleMessPress     = useCallback((mess: Mess) => navigation.navigate('MessDetail', { mess }), [navigation]);
  const handleBestPickPress = useCallback(() => bestPick && navigation.navigate('MessDetail', { mess: bestPick }), [navigation, bestPick]);
  const handleViewFullMap   = useCallback(() => navigation.navigate('MapView'), [navigation]);
  const handleSuggestionPress = useCallback((mess: Mess) => {
    setSearchQuery('');
    setDebouncedQuery('');
    navigation.navigate('MessDetail', { mess });
  }, [navigation]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root} edges={['bottom', 'left', 'right']}>
      {/* ── Header ── */}
      <Header location={locationName} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchNearbyMesses(true); }}
            tintColor="#AB3500"
          />
        }
      >
        {/* ── Hero ── */}
        <View style={s.section}>
          <Text style={s.heroTitle}>What's for Lunch?</Text>
          <Text style={s.heroSub}>Find the best home-cooked messes near you.</Text>

          {/* Search bar + suggestions */}
          <View style={s.searchWrapper}>
            <View style={s.searchBar}>
              <Ionicons name="search-outline" size={20} color="#8D7168" />
              <TextInput
                style={s.searchInput}
                placeholder="Search mess, dish or area..."
                placeholderTextColor="#8D7168"
                value={searchQuery}
                onChangeText={handleSearchChange}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setDebouncedQuery(''); }}>
                  <Ionicons name="close-circle" size={18} color="#8D7168" />
                </TouchableOpacity>
              )}
            </View>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <View style={s.suggestions}>
                {suggestions.map((mess, index) => (
                  <TouchableOpacity
                    key={mess.id}
                    style={[
                      s.suggestionItem,
                      index < suggestions.length - 1 && s.suggestionBorder,
                    ]}
                    onPress={() => handleSuggestionPress(mess)}
                    activeOpacity={0.7}
                  >
                    <View style={s.suggestionIcon}>
                      <Ionicons name="restaurant-outline" size={16} color="#AB3500" />
                    </View>
                    <View style={s.suggestionText}>
                      <Text style={s.suggestionName} numberOfLines={1}>{mess.name}</Text>
                      <Text style={s.suggestionMeta} numberOfLines={1}>
                        {mess.cuisine} · {mess.distance_km.toFixed(1)} km
                      </Text>
                    </View>
                    <View style={[s.suggestionStatus, mess.is_open ? s.statusOpen : s.statusClosed]}>
                      <Text style={[s.suggestionStatusText, mess.is_open ? s.statusOpenText : s.statusClosedText]}>
                        {mess.is_open ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Filter chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
          style={s.chipsScroll}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[s.chip, activeFilter === f.id && s.chipActive]}
              onPress={() => setActiveFilter(f.id)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipText, activeFilter === f.id && s.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* ── Best Pick ── */}
        {!loading && bestPick && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Today's Best Pick</Text>
            <BestPickCard
              name={bestPick.name}
              image={bestPick.cover_image_url || 'https://via.placeholder.com/400x300'}
              price={bestPick.lunch?.price ?? bestPick.dinner?.price ?? 100}
              rating={bestPick.rating}
              distance={bestPick.distance_km}
              description={
                bestPick.lunch
                  ? `Today's Lunch: ${bestPick.lunch.items.slice(0, 3).join(', ')}${bestPick.lunch.items.length > 3 ? '…' : ''}`
                  : bestPick.dinner
                  ? `Today's Dinner: ${bestPick.dinner.items.slice(0, 3).join(', ')}${bestPick.dinner.items.length > 3 ? '…' : ''}`
                  : 'Delicious home-cooked meals with authentic flavors.'
              }
              tags={[bestPick.is_open ? 'Open Now' : 'Closed', bestPick.cuisine].filter(Boolean)}
              onPress={handleBestPickPress}
            />
          </View>
        )}

        {/* ── Nearby list ── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Messes Near You</Text>
            {!loading && nearbyList.length > 0 && (
              <TouchableOpacity>
                <Text style={s.viewAll}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={s.list}>
              <MessCardSkeleton /><MessCardSkeleton /><MessCardSkeleton />
            </View>
          ) : nearbyList.length > 0 ? (
            <View style={s.list}>
              {nearbyList.map(mess => (
                <MessCard
                  key={mess.id}
                  name={mess.name}
                  image={mess.cover_image_url || ''}
                  cuisine={mess.cuisine}
                  distance={mess.distance_km}
                  rating={mess.rating}
                  pricePerMeal={mess.lunch?.price ?? mess.dinner?.price ?? 100}
                  isOpen={mess.is_open}
                  verified={mess.verified}
                  openingTime={mess.opening_time}
                  closingTime={mess.closing_time}
                  lunch={mess.lunch}
                  dinner={mess.dinner}
                  onPress={() => handleMessPress(mess)}
                />
              ))}
            </View>
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🔍</Text>
              <Text style={s.emptyTitle}>No messes found</Text>
              <Text style={s.emptySub}>
                {activeFilter === 'open-now'
                  ? 'No messes are currently open nearby.'
                  : activeFilter === 'budget'
                  ? 'No budget-friendly messes within 5 km.'
                  : searchQuery.trim()
                  ? `No results for "${searchQuery}".`
                  : 'No messes found within 5 km of your location.'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Map ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📍 Explore on Map</Text>
          <MapSection
            userLocation={userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : undefined}
            messes={messes.map(m => ({ id: m.id, latitude: m.latitude, longitude: m.longitude, verified: m.verified }))}
            onViewFullMap={handleViewFullMap}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F6' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 12 },

  // Section
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#261814', marginBottom: 14 },
  viewAll: { fontSize: 13, fontWeight: '600', color: '#AB3500' },

  // Hero
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#261814', lineHeight: 36, marginBottom: 4 },
  heroSub: { fontSize: 15, color: '#594139', lineHeight: 22, marginBottom: 14 },

  // Search
  searchWrapper: {
    position: 'relative',
    zIndex: 50,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EBE4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#261814', padding: 0 },

  // Suggestions
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4EBE4',
  },
  suggestionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF1ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#261814',
    marginBottom: 2,
  },
  suggestionMeta: {
    fontSize: 12,
    color: '#594139',
  },
  suggestionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusOpen: { backgroundColor: '#D1FAE5' },
  statusClosed: { backgroundColor: '#FEE2E2' },
  suggestionStatusText: { fontSize: 11, fontWeight: '700' },
  statusOpenText: { color: '#065F46' },
  statusClosedText: { color: '#DC2626' },

  // Filter chips
  chipsScroll: { marginBottom: 8 },
  chipsRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1BFB5',
  },
  chipActive: { backgroundColor: '#AB3500', borderColor: '#AB3500' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#594139' },
  chipTextActive: { color: '#fff' },

  // List
  list: { gap: 12 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#261814', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#594139', textAlign: 'center' },
});
