import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiClient from '../../api/client';
import KeyboardAwareScreen from '../../components/KeyboardAwareScreen';

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export default function SimpleDailyMenuScreen({ route, navigation }: any) {
  const { messId, messName } = route.params;
  
  const [selectedMeal, setSelectedMeal] = useState<'lunch' | 'dinner'>('lunch');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const { data } = await apiClient.get(`/messes/${messId}/menu`, {
        params: { date: today },
      });
      setItems(data.items || []);
    } catch (error) {
      console.log('No menu yet, starting fresh');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Required', 'Please enter item name');
      return;
    }

    const price = parseFloat(itemPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post(`/messes/${messId}/menu/${today}/items`, {
        name: itemName.trim(),
        price: price,
      });

      // Reload menu
      await loadMenu();
      
      // Clear inputs
      setItemName('');
      setItemPrice('');
      
      Alert.alert('Added!', `${itemName} added to menu`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (itemId: string, name: string) => {
    Alert.alert(
      'Remove Item',
      `Remove "${name}" from today's menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/messes/${messId}/menu/${today}/items/${itemId}`);
              setItems(items.filter(item => item.id !== itemId));
              Alert.alert('Removed', `${name} removed from menu`);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const saveMenu = () => {
    if (items.length === 0) {
      Alert.alert('Empty Menu', 'Please add at least one item');
      return;
    }

    Alert.alert(
      'Menu Saved! ✅',
      `Today's ${selectedMeal} menu with ${items.length} items is now live.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AB3500" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScreen contentStyle={styles.content}>
        <Text style={styles.title}>{messName}</Text>
        <Text style={styles.subtitle}>Update Today's Menu</Text>
        <Text style={styles.date}>📅 {new Date().toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>

        {/* Meal Selection */}
        <View style={styles.mealSelector}>
          <TouchableOpacity
            style={[
              styles.mealButton,
              selectedMeal === 'lunch' && styles.mealButtonActive,
            ]}
            onPress={() => setSelectedMeal('lunch')}
          >
            <Text
              style={[
                styles.mealText,
                selectedMeal === 'lunch' && styles.mealTextActive,
              ]}
            >
              🍛 Lunch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mealButton,
              selectedMeal === 'dinner' && styles.mealButtonActive,
            ]}
            onPress={() => setSelectedMeal('dinner')}
          >
            <Text
              style={[
                styles.mealText,
                selectedMeal === 'dinner' && styles.mealTextActive,
              ]}
            >
              🍽️ Dinner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Current Menu ({items.length} items)
          </Text>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No items yet</Text>
              <Text style={styles.emptySubtext}>Add items below</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {items.map((item) => (
                <View key={item.id} style={styles.menuItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPriceText}>₹{item.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id, item.name)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add New Item */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Item</Text>

          <View style={styles.addItemForm}>
            <TextInput
              style={styles.itemInput}
              placeholder="Item name (e.g., Dal Rice)"
              value={itemName}
              onChangeText={setItemName}
              autoCapitalize="words"
            />

            <View style={styles.priceRow}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Price"
                value={itemPrice}
                onChangeText={setItemPrice}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.addButton, saving && styles.addButtonDisabled]}
              onPress={addItem}
              disabled={saving}
            >
              <Text style={styles.addButtonText}>
                {saving ? 'Adding...' : '+ Add Item'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        {items.length > 0 && (
          <TouchableOpacity style={styles.saveButton} onPress={saveMenu}>
            <Text style={styles.saveButtonText}>✅ Save Menu</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF8F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#594139',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#261814',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#594139',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#AB3500',
    fontWeight: '600',
    marginBottom: 24,
  },
  mealSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  mealButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E1BFB5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  mealButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#AB3500',
  },
  mealText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#594139',
  },
  mealTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#261814',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#261814',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#594139',
  },
  itemsList: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E1BFB5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#261814',
    marginBottom: 4,
  },
  itemPriceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AB3500',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  addItemForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  itemInput: {
    backgroundColor: '#F4EBE4',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#261814',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EBE4',
    borderRadius: 8,
    paddingLeft: 14,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#594139',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#261814',
  },
  addButton: {
    backgroundColor: '#AB3500',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});
