import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius } from '../../theme';

interface Mess { id: string; name: string; address: string; is_open: boolean; opening_time: string; closing_time: string; }

export default function MyMessesScreen({ navigation }: any) {
  const { colors, toggle, isDark } = useTheme();
  const { logout } = useAuth();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMesses = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await apiClient.get('/messes/mine');
      setMesses(data);
    } catch {
      Alert.alert('Error', 'Could not load your messes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchMesses(); }, []));

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Owner Dashboard</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Messes</Text>
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

      {messes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏪</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No messes yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Register your first mess to get started</Text>
          <Button label="+ Register a Mess" onPress={() => navigation.navigate('RegisterMess')} style={{ marginTop: spacing.lg, paddingHorizontal: spacing.xl }} />
        </View>
      ) : (
        <>
          <FlatList
            data={messes}
            keyExtractor={m => m.id}
            contentContainerStyle={{ padding: spacing.md }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMesses(true); }} tintColor={colors.primary} />}
            renderItem={({ item }) => (
              <Card onPress={() => navigation.navigate('ManageMess', { mess: item })}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.messName, { color: colors.text }]}>{item.name}</Text>
                  <Badge label={item.is_open ? '● Open' : '● Closed'} type={item.is_open ? 'success' : 'error'} />
                </View>
                <Text style={[styles.address, { color: colors.textSecondary }]}>📍 {item.address}</Text>
                <Text style={[styles.hours, { color: colors.textSecondary }]}>🕐 {item.opening_time} – {item.closing_time}</Text>
                <View style={[styles.manageHint, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.manageHintText, { color: colors.primary }]}>Tap to manage →</Text>
                </View>
              </Card>
            )}
          />
          <View style={styles.fab}>
            <TouchableOpacity style={[styles.fabBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('RegisterMess')}>
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
  greeting: { fontSize: fontSize.sm },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: 8 },
  emptySubtitle: { fontSize: fontSize.sm, textAlign: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  messName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, flex: 1, marginRight: 8 },
  address: { fontSize: fontSize.sm, marginBottom: 4 },
  hours: { fontSize: fontSize.sm, marginBottom: 10 },
  manageHint: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  manageHintText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  fab: { position: 'absolute', bottom: spacing.xl, right: spacing.lg },
  fabBtn: { width: 56, height: 56, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
