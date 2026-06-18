import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import KeyboardAwareScreen from '../../components/KeyboardAwareScreen';

interface EverydayMenuItem {
  id: string;
  name: string;
  price: number;
}

export default function EverydayMenuScreen({ route }: any) {
  const { messId, messName } = route.params;
  const [items, setItems]           = useState<EverydayMenuItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [newName, setNewName]       = useState('');
  const [newPrice, setNewPrice]     = useState('');

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const { data } = await apiClient.get(`/messes/${messId}/everyday-menu`);
      setItems(data || []);
    } catch {
      Alert.alert('Error', 'Could not load everyday menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter an item name');
      return;
    }
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    setAdding(true);
    try {
      const { data } = await apiClient.post(`/messes/${messId}/everyday-menu`, {
        name: newName.trim(),
        price,
      });
      setItems(prev => [...prev, data]);
      setNewName('');
      setNewPrice('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not add item');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (itemId: string, itemName: string) => {
    Alert.alert('Delete Item', `Remove "${itemName}" from everyday menu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/everyday-menu/${itemId}`);
            setItems(prev => prev.filter(i => i.id !== itemId));
          } catch {
            Alert.alert('Error', 'Could not delete item');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color="#AB3500" />
        <Text style={s.loadingText}>Loading…</Text>
      </View>
    );
  }

  const isValid = newName.trim() !== '' && newPrice !== '' && !isNaN(parseFloat(newPrice));

  return (
    <KeyboardAwareScreen contentStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.messName}>{messName}</Text>
          <Text style={s.subtitle}>Items available every day</Text>
        </View>

        {/* Add item card */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="add-circle-outline" size={15} color="#AB3500" />
            <Text style={s.cardTitle}>Add New Item</Text>
          </View>

          {/* Name input */}
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              placeholder="Item name (e.g., Roti, Rice)"
              placeholderTextColor="#C4A99E"
              value={newName}
              onChangeText={setNewName}
              returnKeyType="next"
            />
          </View>

          {/* Price input */}
          <View style={s.priceRow}>
            <Text style={s.rupee}>₹</Text>
            <TextInput
              style={s.priceInput}
              placeholder="Price"
              placeholderTextColor="#C4A99E"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>

          <TouchableOpacity
            style={[s.addBtn, (!isValid || adding) && s.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!isValid || adding}
            activeOpacity={0.85}
          >
            {adding
              ? <ActivityIndicator size="small" color="#fff" />
              : <>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={s.addBtnText}>Add Item</Text>
                </>
            }
          </TouchableOpacity>
        </View>

        {/* Items list */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            Current Items
            {items.length > 0 && <Text style={s.sectionCount}> · {items.length}</Text>}
          </Text>

          {items.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>📋</Text>
              <Text style={s.emptyTitle}>No items yet</Text>
              <Text style={s.emptySub}>Add items that are always available</Text>
            </View>
          ) : (
            <View style={s.list}>
              {items.map((item, index) => (
                <View
                  key={item.id}
                  style={[s.itemRow, index < items.length - 1 && s.itemBorder]}
                >
                  <View style={s.itemLeft}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemPrice}>₹{item.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

      <View style={{ height: 40 }} />
    </KeyboardAwareScreen>
  );
}

const s = StyleSheet.create({
  content: {},

  loading:     { flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, color: '#594139' },

  // Header
  header:   { marginBottom: 20 },
  messName: { fontSize: 22, fontWeight: '800', color: '#261814', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#8D7168' },

  // Add card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  cardTitle:  { fontSize: 13, fontWeight: '700', color: '#261814' },

  inputRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4EBE4',
    marginBottom: 12,
    paddingBottom: 10,
  },
  input: {
    fontSize: 15,
    color: '#261814',
    padding: 0,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EBE4',
    paddingBottom: 10,
  },
  rupee:      { fontSize: 16, fontWeight: '700', color: '#AB3500' },
  priceInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#261814', padding: 0 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#AB3500',
    borderRadius: 12,
    paddingVertical: 13,
    shadowColor: '#AB3500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  addBtnText:     { fontSize: 15, fontWeight: '700', color: '#fff' },

  // List section
  section:      { marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#261814', marginBottom: 12 },
  sectionCount: { color: '#8D7168', fontWeight: '500' },

  list: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4EBE4',
  },
  itemLeft:  { flex: 1 },
  itemName:  { fontSize: 14, fontWeight: '600', color: '#261814', marginBottom: 2 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: '#AB3500' },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  empty:      { backgroundColor: '#fff', borderRadius: 14, padding: 36, alignItems: 'center' },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#261814', marginBottom: 4 },
  emptySub:   { fontSize: 13, color: '#8D7168', textAlign: 'center' },
});
