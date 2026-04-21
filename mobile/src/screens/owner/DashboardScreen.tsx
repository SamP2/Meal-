import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius, shadow } from '../../theme';

interface Mess { id: string; name: string; is_open: boolean; rating: number; review_count: number; }

export default function DashboardScreen({ navigation }: any) {
  const { colors, toggle, isDark } = useTheme();
  const { logout } = useAuth();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const fetchMesses = async () => {
    try {
      const { data } = await apiClient.get('/messes/mine');
      setMesses(data);
      if (data.length > 0 && !selectedMess) setSelectedMess(data[0]);
    } catch { Alert.alert('Error', 'Could not load your messes'); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchMesses(); }, []));

  const toggleStatus = async () => {
    if (!selectedMess) return;
    setToggling(true);
    try {
      const { data } = await apiClient.patch(`/messes/${selectedMess.id}/status`, { is_open: !selectedMess.is_open });
      setSelectedMess(data);
      setMesses(prev => prev.map(m => m.id === data.id ? data : m));
    } catch { Alert.alert('Error', 'Could not update status'); }
    finally { setToggling(false); }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={{ fontSize: 20 }}>👨‍🍳</Text>
          </View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Mess Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggle} style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Text>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <Text>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {messes.length === 0 ? (
          <View style={styles.noMess}>
            <Text style={styles.noMessEmoji}>🏪</Text>
            <Text style={[styles.noMessTitle, { color: colors.text }]}>No messes yet</Text>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('RegisterMess')}>
              <Text style={styles.addBtnText}>+ Register Your Mess</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Mess selector */}
            {messes.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.messSelector}>
                {messes.map(m => (
                  <TouchableOpacity key={m.id} style={[styles.messSelectorBtn, { backgroundColor: selectedMess?.id === m.id ? colors.primary : colors.surface }]} onPress={() => setSelectedMess(m)}>
                    <Text style={[styles.messSelectorText, { color: selectedMess?.id === m.id ? '#fff' : colors.text }]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Hero greeting card */}
            <View style={[styles.heroCard, { backgroundColor: colors.primaryLight }]}>
              <View style={styles.heroCardContent}>
                <Text style={[styles.heroGreeting, { color: colors.primary }]}>{greeting}, Chef.</Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Ready for today's service?</Text>
              </View>
              <Text style={styles.heroEmoji}>🍳</Text>
            </View>

            {/* Status toggle */}
            <View style={[styles.card, { backgroundColor: colors.surface }, shadow.sm]}>
              <View style={styles.statusRow}>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{selectedMess?.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    {selectedMess?.is_open ? '● Students can find your mess' : '● Hidden from students'}
                  </Text>
                </View>
                {toggling
                  ? <ActivityIndicator color={colors.primary} />
                  : <Switch value={selectedMess?.is_open ?? false} onValueChange={toggleStatus} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
                }
              </View>
            </View>

            {/* Quick actions grid */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.grid}>
              <TouchableOpacity style={[styles.gridCard, styles.gridCardWide, { backgroundColor: colors.surface }, shadow.sm]}
                onPress={() => navigation.navigate('MenuManagement', { messId: selectedMess?.id, date: today, messName: selectedMess?.name })}>
                <View style={styles.gridCardHeader}>
                  <Text style={styles.gridEmoji}>📋</Text>
                  <Text style={[styles.gridTitle, { color: colors.text }]}>Today's Menu</Text>
                </View>
                <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>Update breakfast, lunch & dinner</Text>
                <View style={[styles.gridArrow, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.gridArrowText, { color: colors.primary }]}>→</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridCard, { backgroundColor: colors.surface }, shadow.sm]}
                onPress={() => navigation.navigate('RegisterMess')}>
                <Text style={styles.gridEmoji}>🏪</Text>
                <Text style={[styles.gridTitle, { color: colors.text }]}>Add Mess</Text>
                <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>Register new</Text>
              </TouchableOpacity>

              <View style={[styles.gridCard, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={styles.gridEmoji}>⭐</Text>
                <Text style={[styles.gridTitle, { color: colors.text }]}>Rating</Text>
                <Text style={[styles.ratingValue, { color: colors.primary }]}>{selectedMess?.rating ? selectedMess.rating.toFixed(1) : 'New'}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md },
  noMess: { alignItems: 'center', paddingTop: 80 },
  noMessEmoji: { fontSize: 64, marginBottom: spacing.md },
  noMessTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.lg },
  addBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.xl },
  addBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
  messSelector: { marginBottom: spacing.md },
  messSelectorBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, marginRight: 8 },
  messSelectorText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  heroCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.md },
  heroCardContent: { flex: 1 },
  heroGreeting: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold },
  heroSubtitle: { fontSize: fontSize.sm, marginTop: 4 },
  heroEmoji: { fontSize: 48 },
  card: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  cardSubtitle: { fontSize: fontSize.sm, marginTop: 4 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridCard: { borderRadius: radius.xl, padding: spacing.md, width: '47%' },
  gridCardWide: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gridCardHeader: { flex: 1 },
  gridEmoji: { fontSize: 28, marginBottom: spacing.sm },
  gridTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  gridSubtitle: { fontSize: fontSize.xs, marginTop: 2 },
  gridArrow: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  gridArrowText: { fontSize: 18, fontWeight: fontWeight.bold },
  ratingValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, marginTop: 4 },
});
