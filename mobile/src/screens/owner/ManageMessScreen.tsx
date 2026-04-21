import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius, shadow } from '../../theme';

export default function ManageMessScreen({ route, navigation }: any) {
  const { mess: initial } = route.params;
  const { colors } = useTheme();
  const [mess, setMess] = useState(initial);
  const [toggling, setToggling] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const toggleStatus = async () => {
    setToggling(true);
    try {
      const { data } = await apiClient.patch(`/messes/${mess.id}/status`, { is_open: !mess.is_open });
      setMess(data);
    } catch {
      Alert.alert('Error', 'Could not update status');
    } finally {
      setToggling(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: mess.is_open ? colors.primary : colors.surfaceSecondary }]}>
        <Text style={styles.heroEmoji}>🏪</Text>
        <Text style={[styles.heroName, { color: mess.is_open ? '#fff' : colors.text }]}>{mess.name}</Text>
        <Text style={[styles.heroAddress, { color: mess.is_open ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
          📍 {mess.address}
        </Text>
      </View>

      {/* Status toggle */}
      <View style={[styles.card, { backgroundColor: colors.surface }, shadow.sm]}>
        <View style={styles.statusRow}>
          <View>
            <Text style={[styles.statusTitle, { color: colors.text }]}>Mess Status</Text>
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              {mess.is_open ? 'Students can see your mess' : 'Hidden from students'}
            </Text>
          </View>
          {toggling
            ? <ActivityIndicator color={colors.primary} />
            : <Switch
                value={mess.is_open}
                onValueChange={toggleStatus}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
          }
        </View>
      </View>

      {/* Quick actions */}
      <View style={[styles.card, { backgroundColor: colors.surface }, shadow.sm]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('MenuManagement', { messId: mess.id, date: today, messName: mess.name })}
        >
          <Text style={styles.actionEmoji}>📋</Text>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Today's Menu</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Add or update today's food items</Text>
          </View>
          <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            navigation.navigate('MenuManagement', { messId: mess.id, date: tomorrow.toISOString().split('T')[0], messName: mess.name });
          }}
        >
          <Text style={styles.actionEmoji}>📅</Text>
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Tomorrow's Menu</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Plan ahead for tomorrow</Text>
          </View>
          <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={[styles.card, { backgroundColor: colors.surface }, shadow.sm]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
        <Text style={[styles.infoRow, { color: colors.textSecondary }]}>🕐 {mess.opening_time} – {mess.closing_time}</Text>
        {mess.price_range && <Text style={[styles.infoRow, { color: colors.textSecondary }]}>💰 {mess.price_range}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: spacing.xl, alignItems: 'center', paddingTop: spacing.xxl },
  heroEmoji: { fontSize: 56, marginBottom: spacing.sm },
  heroName: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, textAlign: 'center', marginBottom: 4 },
  heroAddress: { fontSize: fontSize.sm, textAlign: 'center' },
  card: { margin: spacing.md, marginTop: 0, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  statusSubtitle: { fontSize: fontSize.sm, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, gap: 12 },
  actionEmoji: { fontSize: 24 },
  actionText: { flex: 1 },
  actionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  actionSubtitle: { fontSize: fontSize.sm, marginTop: 2 },
  actionArrow: { fontSize: 22 },
  infoRow: { fontSize: fontSize.md, marginBottom: 8 },
});
