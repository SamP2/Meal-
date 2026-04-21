import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius, shadow } from '../../theme';

interface MenuItem { id: string; name: string; price: number; }

export default function MenuManagementScreen({ route }: any) {
  const { messId, date, messName } = route.params;
  const { colors } = useTheme();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMenu = async () => {
    try {
      const { data } = await apiClient.get(`/messes/${messId}/menu`, { params: { date } });
      setItems(data.items ?? []);
    } catch {
      Alert.alert('Error', 'Could not load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenu(); }, []);

  const addItem = async () => {
    if (!newName.trim()) { Alert.alert('Error', 'Item name is required'); return; }
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) { Alert.alert('Error', 'Enter a valid price'); return; }
    setSaving(true);
    try {
      await apiClient.post(`/messes/${messId}/menu/${date}/items`, { name: newName.trim(), price });
      setNewName(''); setNewPrice('');
      await fetchMenu();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = (itemId: string, name: string) => {
    Alert.alert('Remove Item', `Remove "${name}" from the menu?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/messes/${messId}/menu/${date}/items/${itemId}`);
          setItems(prev => prev.filter(i => i.id !== itemId));
        } catch { Alert.alert('Error', 'Could not remove item'); }
      }},
    ]);
  };

  const clearMenu = () => {
    Alert.alert('Clear Menu', `Delete the entire menu for ${date}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/messes/${messId}/menu/${date}`);
          setItems([]);
        } catch { Alert.alert('Error', 'Could not delete menu'); }
      }},
    ]);
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }, shadow.sm]}>
          <Text style={[styles.messName, { color: colors.text }]}>{messName}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>📅 {date}</Text>
          <Text style={[styles.count, { color: colors.primary }]}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
        </View>

        {/* Items list */}
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 160 }}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No items yet. Add your first dish below.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.itemRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <View style={styles.itemLeft}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteItem(item.id, item.name)} style={[styles.deleteBtn, { backgroundColor: colors.errorBg }]}>
                <Text style={[styles.deleteBtnText, { color: colors.error }]}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Add item panel */}
        <View style={[styles.addPanel, { backgroundColor: colors.surface }, shadow.lg]}>
          {items.length > 0 && (
            <TouchableOpacity onPress={clearMenu} style={styles.clearRow}>
              <Text style={[styles.clearText, { color: colors.error }]}>🗑 Clear entire menu</Text>
            </TouchableOpacity>
          )}
          <View style={styles.addRow}>
            <TextInput
              style={[styles.nameInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="Dish name"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.priceInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="₹"
              placeholderTextColor={colors.textSecondary}
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />
          </View>
          <Button label={saving ? 'Adding...' : '+ Add Item'} onPress={addItem} loading={saving} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: spacing.lg },
  messName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  date: { fontSize: fontSize.sm, marginTop: 2 },
  count: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: 4 },
  emptyList: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.sm, textAlign: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: radius.md, marginBottom: 8, borderBottomWidth: 1 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  itemPrice: { fontSize: fontSize.sm, marginTop: 2, fontWeight: fontWeight.semibold },
  deleteBtn: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 14, fontWeight: fontWeight.bold },
  addPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  clearRow: { alignItems: 'center', marginBottom: spacing.sm },
  clearText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  nameInput: { flex: 2, borderRadius: radius.md, padding: spacing.sm, fontSize: fontSize.md, borderWidth: 1, height: 48 },
  priceInput: { flex: 1, borderRadius: radius.md, padding: spacing.sm, fontSize: fontSize.md, borderWidth: 1, height: 48 },
});
