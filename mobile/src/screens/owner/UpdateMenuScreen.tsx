import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import KeyboardAwareScreen from '../../components/KeyboardAwareScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MenuData {
  items: string; // comma-separated string for the input
  price: string;
}

const EMPTY: MenuData = { items: '', price: '' };

// ─── Component ────────────────────────────────────────────────────────────────
export default function UpdateMenuScreen({ route, navigation }: any) {
  const { messId, messName, mealType: initialMealType } = route.params;

  const [mealType, setMealType] = useState<'lunch' | 'dinner'>(initialMealType || 'lunch');
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true); // only true on initial load

  // Cache both meal types locally — no re-fetch on toggle
  const cache = useRef<{ lunch: MenuData; dinner: MenuData }>({
    lunch:  { ...EMPTY },
    dinner: { ...EMPTY },
  });

  // Local form state — driven from cache
  const [items, setItemsState] = useState('');
  const [price, setPriceState] = useState('');

  // Sync form → cache on every keystroke
  const setItems = (v: string) => {
    setItemsState(v);
    cache.current[mealType].items = v;
  };
  const setPrice = (v: string) => {
    setPriceState(v);
    cache.current[mealType].price = v;
  };

  // ── Fetch BOTH meal types once on mount ──────────────────────────────────
  useEffect(() => {
    fetchBothMenus();
  }, []);

  const fetchBothMenus = async () => {
    setFetching(true);
    try {
      const [lunchRes, dinnerRes] = await Promise.all([
        apiClient.get(`/menus/${messId}/today`, { params: { meal_type: 'lunch' } }).catch(() => null),
        apiClient.get(`/menus/${messId}/today`, { params: { meal_type: 'dinner' } }).catch(() => null),
      ]);

      if (lunchRes?.data?.exists && lunchRes.data.menu) {
        const m = lunchRes.data.menu;
        cache.current.lunch = {
          items: Array.isArray(m.items) ? m.items.join(', ') : m.items,
          price: m.price.toString(),
        };
      }

      if (dinnerRes?.data?.exists && dinnerRes.data.menu) {
        const m = dinnerRes.data.menu;
        cache.current.dinner = {
          items: Array.isArray(m.items) ? m.items.join(', ') : m.items,
          price: m.price.toString(),
        };
      }
    } catch {
      // silently fail — form stays empty
    } finally {
      // Populate form with the initial meal type
      setItemsState(cache.current[initialMealType || 'lunch'].items);
      setPriceState(cache.current[initialMealType || 'lunch'].price);
      setFetching(false);
    }
  };

  // ── Toggle meal type — instant, no API call ──────────────────────────────
  const handleToggle = (type: 'lunch' | 'dinner') => {
    if (type === mealType) return;
    // Save current form values to cache before switching
    cache.current[mealType] = { items, price };
    // Switch and restore from cache instantly
    setMealType(type);
    setItemsState(cache.current[type].items);
    setPriceState(cache.current[type].price);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!items.trim()) {
      Alert.alert('Required', 'Please enter menu items');
      return;
    }
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const itemsArray = items.split(',').map(i => i.trim()).filter(Boolean);
      await apiClient.post('/menus', {
        mess_id: messId,
        meal_type: mealType,
        items: itemsArray,
        price: priceNum,
      });
      Alert.alert('Saved', 'Menu updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update menu');
    } finally {
      setLoading(false);
    }
  };

  const isValid = items.trim() !== '' && price !== '' && !isNaN(parseFloat(price));

  // ── Loading (initial fetch only) ─────────────────────────────────────────
  if (fetching) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color="#AB3500" />
        <Text style={s.loadingText}>Loading menu…</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAwareScreen contentStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.messName}>{messName}</Text>
          <Text style={s.subtitle}>Update today's menu</Text>
        </View>

        {/* Meal type toggle — instant switch */}
        <View style={s.toggleRow}>
          <TouchableOpacity
            style={[s.toggleBtn, mealType === 'lunch' && s.toggleBtnActive]}
            onPress={() => handleToggle('lunch')}
            activeOpacity={0.8}
          >
            <Text style={s.toggleEmoji}>🍛</Text>
            <Text style={[s.toggleLabel, mealType === 'lunch' && s.toggleLabelActive]}>Lunch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.toggleBtn, mealType === 'dinner' && s.toggleBtnActive]}
            onPress={() => handleToggle('dinner')}
            activeOpacity={0.8}
          >
            <Text style={s.toggleEmoji}>🌙</Text>
            <Text style={[s.toggleLabel, mealType === 'dinner' && s.toggleLabelActive]}>Dinner</Text>
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <View style={s.card}>
          <View style={s.fieldHeader}>
            <Ionicons name="restaurant-outline" size={15} color="#AB3500" />
            <Text style={s.fieldLabel}>Menu Items</Text>
          </View>
          <TextInput
            style={s.textArea}
            placeholder="Dal, Roti, Rice, Sabzi…"
            placeholderTextColor="#C4A99E"
            value={items}
            onChangeText={setItems}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={s.hint}>Separate items with commas</Text>
        </View>

        {/* Price */}
        <View style={s.card}>
          <View style={s.fieldHeader}>
            <Ionicons name="pricetag-outline" size={15} color="#AB3500" />
            <Text style={s.fieldLabel}>Price per meal</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.rupee}>₹</Text>
            <TextInput
              style={s.priceInput}
              placeholder="100"
              placeholderTextColor="#C4A99E"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[s.saveBtn, (!isValid || loading) && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={s.saveBtnText}>Save Menu</Text>
              </>
          }
        </TouchableOpacity>
    </KeyboardAwareScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  content: { paddingBottom: 48 },

  loading:     { flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 14, color: '#594139' },

  header:   { marginBottom: 20 },
  messName: { fontSize: 22, fontWeight: '800', color: '#261814', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#8D7168' },

  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    backgroundColor: '#F4EBE4',
    borderRadius: 14,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleEmoji:       { fontSize: 16 },
  toggleLabel:       { fontSize: 14, fontWeight: '600', color: '#8D7168' },
  toggleLabelActive: { color: '#AB3500' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  fieldLabel:  { fontSize: 13, fontWeight: '700', color: '#261814' },
  hint:        { fontSize: 11, color: '#C4A99E', marginTop: 8, fontStyle: 'italic' },

  textArea: {
    fontSize: 15,
    color: '#261814',
    lineHeight: 22,
    minHeight: 72,
    padding: 0,
  },

  priceRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rupee:      { fontSize: 18, fontWeight: '700', color: '#AB3500' },
  priceInput: { flex: 1, fontSize: 20, fontWeight: '700', color: '#261814', padding: 0 },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#AB3500',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#AB3500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  saveBtnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
});
