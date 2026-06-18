import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius, shadow } from '../../theme';

const FILTERS = ['Nearby', 'Top Rated', 'Open Now', 'Pure Veg'];

interface Mess {
  id: string; name: string; description: string | null;
  address: string; is_open: boolean; is_verified: boolean; is_veg: boolean;
  rating: number; review_count: number; distance_km: number;
  opening_time: string; closing_time: string; price_range: string | null;
  cuisine: string; cover_image: string | null;
}

export default function StudentHomeScreen({ navigation }: any) {
  const { colors, toggle, isDark } = useTheme();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [filtered, setFiltered] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Nearby');

  const fetchNearby = async (silent = false) => {
    if (!silent) setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Required', 'MessFinder needs your location to show nearby messes.');
      setLoading(false); setRefreshing(false); return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    try {
      const { data } = await apiClient.get('/messes/nearby', {
        params: { lat: loc.coords.latitude, lng: loc.coords.longitude },
      });
      const list = data.messes ?? [];
      setMesses(list);
      applyFilter(list, activeFilter, search);
    } catch {
      Alert.alert('Error', 'Could not load nearby messes');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchNearby(); }, []));

  const applyFilter = (list: Mess[], filter: string, q: string) => {
    let result = [...list];
    if (q) result = result.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.address.toLowerCase().includes(q.toLowerCase()));
    if (filter === 'Top Rated') result = result.sort((a, b) => b.rating - a.rating);
    if (filter === 'Open Now') result = result.filter(m => m.is_open);
    if (filter === 'Pure Veg') result = result.filter(m => m.is_veg);
    setFiltered(result);
  };

  const handleSearch = (text: string) => { setSearch(text); applyFilter(messes, activeFilter, text); };
  const handleFilter = (f: string) => { setActiveFilter(f); applyFilter(messes, f, search); };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>📍 Near You</Text>
          <Text style={[styles.appTitle, { color: colors.primary }]}>MessFinder</Text>
        </View>
        <TouchableOpacity onPress={toggle} style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}>
          <Text>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNearby(true); }} tintColor={colors.primary} />}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search messes..."
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={handleSearch}
              />
            </View>
            <FlatList
              horizontal data={FILTERS} keyExtractor={f => f}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.filterBtn, { backgroundColor: activeFilter === item ? colors.primary : colors.surface }]}
                  onPress={() => handleFilter(item)}
                >
                  <Text style={[styles.filterText, { color: activeFilter === item ? '#fff' : colors.textSecondary }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Messes</Text>
              <Text style={[styles.sectionCount, { color: colors.primary }]}>{filtered.length} found</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No messes found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Try a different filter or check back later</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }, shadow.md]}
            onPress={() => navigation.navigate('MessDetail', { messId: item.id })}
            activeOpacity={0.9}
          >
            <View style={styles.cardImage}>
              {item.cover_image
                ? <Image source={{ uri: item.cover_image }} style={styles.image} />
                : <View style={[styles.imagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                    <Text style={styles.imagePlaceholderEmoji}>🍽️</Text>
                  </View>
              }
              <View style={styles.imageBadges}>
                <View style={[styles.statusBadge, { backgroundColor: item.is_open ? colors.primary : colors.error }]}>
                  <Text style={styles.statusBadgeText}>{item.is_open ? 'Open' : 'Closed'}</Text>
                </View>
                {item.is_verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <View style={[styles.ratingBadge, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <Text style={styles.ratingText}>⭐ {item.rating > 0 ? item.rating.toFixed(1) : 'New'}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.messName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.priceRange, { color: colors.textSecondary }]}>{item.price_range ?? ''}</Text>
              </View>
              {item.description && <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>}
              <View style={styles.cardMeta}>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>📍 {item.distance_km?.toFixed(1)} km</Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>🍴 {item.cuisine}</Text>
                {item.is_veg && <View style={[styles.vegDot, { borderColor: '#22c55e' }]}><View style={[styles.vegDotInner, { backgroundColor: '#22c55e' }]} /></View>}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.ownerLink} onPress={() => navigation.navigate('OwnerLogin')}>
            <Text style={[styles.ownerLinkText, { color: colors.textSecondary }]}>
              Own a mess?{' '}
              <Text style={{ color: colors.primary, fontWeight: fontWeight.semibold }}>Login here</Text>
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  locationLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 1 },
  appTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, letterSpacing: -0.5 },
  iconBtn: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  listHeader: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.full, paddingHorizontal: spacing.md, height: 52, marginBottom: spacing.md, gap: 8 },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: fontSize.md },
  filtersRow: { gap: 10, paddingBottom: spacing.md },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full },
  filterText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, letterSpacing: -0.5 },
  sectionCount: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: 8 },
  emptySubtitle: { fontSize: fontSize.sm, textAlign: 'center' },
  card: { marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.xl, overflow: 'hidden' },
  cardImage: { height: 180, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderEmoji: { fontSize: 64 },
  imageBadges: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusBadgeText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, textTransform: 'uppercase', letterSpacing: 0.5 },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  verifiedText: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: '#0d9488' },
  ratingBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  ratingText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  cardBody: { padding: spacing.md },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  messName: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, flex: 1 },
  priceRange: { fontSize: fontSize.sm },
  description: { fontSize: fontSize.sm, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaText: { fontSize: fontSize.sm },
  vegDot: { width: 16, height: 16, borderRadius: 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  vegDotInner: { width: 8, height: 8, borderRadius: 4 },
  ownerLink: { alignItems: 'center', paddingVertical: spacing.xl },
  ownerLinkText: { fontSize: fontSize.sm },
});
