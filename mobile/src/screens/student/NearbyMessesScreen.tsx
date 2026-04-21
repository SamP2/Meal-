import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius } from '../../theme';

interface Mess {
  id: string; name: string; address: string;
  opening_time: string; closing_time: string;
  price_range: string | null; is_open: boolean; distance_km: number;
}

export default function NearbyMessesScreen({ navigation }: any) {
  const { colors, toggle, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [filtered, setFiltered] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const fetchNearby = async (silent = false) => {
    if (!silent) setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Required', 'MessFinder needs your location to show nearby messes. Please enable it in settings.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    try {
      const { data } = await apiClient.get('/messes/nearby', {
        params: { lat: loc.coords.latitude, lng: loc.coords.longitude },
      });
      const list = data.messes ?? [];
      setMesses(list);
      setFiltered(list);
      if (list.length === 0) setMessage(data.message ?? 'No messes found nearby');
    } catch {
      Alert.alert('Error', 'Could not load nearby messes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchNearby(); }, []));

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text) { setFiltered(messes); return; }
    setFiltered(messes.filter(m => m.name.toLowerCase().includes(text.toLowerCase()) || m.address.toLowerCase().includes(text.toLowerCase())));
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Finding messes near you...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Hello 👋</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>What's for lunch?</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggle} style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search messes..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          {filtered.length} mess{filtered.length !== 1 ? 'es' : ''} found nearby
        </Text>
        <TouchableOpacity onPress={() => fetchNearby(true)}>
          <Text style={[styles.refreshText, { color: colors.primary }]}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No messes found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{message || 'Try expanding your search area'}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNearby(true); }} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <Card onPress={() => navigation.navigate('MessDetail', { messId: item.id })}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.messName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Badge label={item.is_open ? 'Open' : 'Closed'} type={item.is_open ? 'success' : 'error'} />
                </View>
              </View>
              <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>📍 {item.address}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>🕐 {item.opening_time} – {item.closing_time}</Text>
                <Text style={[styles.distance, { color: colors.primary }]}>{item.distance_km?.toFixed(1)} km</Text>
              </View>
              {item.price_range && (
                <View style={[styles.priceTag, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.priceText, { color: colors.primary }]}>💰 {item.price_range}</Text>
                </View>
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: fontSize.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
  greeting: { fontSize: fontSize.sm },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: spacing.md, marginTop: 0, padding: spacing.md, borderRadius: radius.lg },
  searchInput: { flex: 1, fontSize: fontSize.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: 4 },
  statsText: { fontSize: fontSize.sm },
  refreshText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: 8 },
  emptySubtitle: { fontSize: fontSize.sm, textAlign: 'center' },
  cardHeader: { marginBottom: 6 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, flex: 1, marginRight: 8 },
  address: { fontSize: fontSize.sm, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: fontSize.sm },
  distance: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  priceTag: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  priceText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
});
