import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius, shadow } from '../../theme';

interface MenuItem { id: string; name: string; price: number; }

export default function MenuScreen({ route }: any) {
  const { messId, date, messName } = route.params;
  const { colors } = useTheme();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/messes/${messId}/menu`, { params: { date } })
      .then(({ data }) => {
        setItems(data.items ?? []);
        if ((data.items ?? []).length === 0) setMessage(data.message ?? 'No menu available for today');
      })
      .catch(() => Alert.alert('Error', 'Could not load menu'))
      .finally(() => setLoading(false));
  }, [messId, date]);

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }, shadow.sm]}>
        <Text style={[styles.messName, { color: colors.text }]}>{messName}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>📅 {date}</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤷</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No menu today</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{message}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: spacing.md }}
            renderItem={({ item, index }) => (
              <View style={[styles.item, { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: index < items.length - 1 ? 1 : 0 }]}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemDot}>●</Text>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{item.price}</Text>
              </View>
            )}
            ListFooterComponent={() => (
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Avg. meal cost</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>₹{(total / items.length).toFixed(0)}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: spacing.lg },
  messName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  date: { fontSize: fontSize.sm, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: 8 },
  emptySubtitle: { fontSize: fontSize.sm, textAlign: 'center' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md, borderRadius: radius.md, marginBottom: 2 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  itemDot: { color: '#14b8a6', fontSize: 10 },
  itemName: { fontSize: fontSize.md, flex: 1 },
  itemPrice: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, marginTop: spacing.sm, borderTopWidth: 1 },
  totalLabel: { fontSize: fontSize.sm },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
});
