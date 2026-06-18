import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Mess {
  id: string;
  name: string;
  address: string;
  is_open: boolean;
  verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  cover_image_url: string | null;
  lunch:  { items: string[]; price: number } | null;
  dinner: { items: string[]; price: number } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SimpleOwnerDashboard({ navigation }: any) {
  const { logout, user } = useAuth();
  const [messes, setMesses]         = useState<Mess[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Stale-while-revalidate: show cached data instantly, refresh in background
  const hasData = useRef(false);

  // ── Data ─────────────────────────────────────────────────────────────────
  const loadMesses = async (silent = false) => {
    // If we already have data, don't show full loading screen — just refresh silently
    if (!silent && !hasData.current) setLoading(true);
    if (!user) {
      setLoading(false);
      navigation.navigate('StudentStack', { screen: 'OwnerLogin' });
      return;
    }
    try {
      const { data } = await apiClient.get('/menus/mine-with-menus');
      setMesses(data || []);
      hasData.current = true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again.', [{
          text: 'OK',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'StudentStack', params: { screen: 'OwnerLogin' } }] });
          },
        }]);
      } else if (!hasData.current) {
        // Only show error if we have no cached data to show
        Alert.alert('Error', 'Could not load your messes.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    // Silent refresh when returning from a sub-screen (data already visible)
    loadMesses(hasData.current);
  }, []));

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'StudentStack', params: { screen: 'StudentHome' } }] });
  };

  const toggleStatus = async (messId: string, current: boolean) => {
    setMesses(prev => prev.map(m => m.id === messId ? { ...m, is_open: !current } : m));
    try {
      await apiClient.patch(`/messes/${messId}/status`, { is_open: !current });
    } catch {
      setMesses(prev => prev.map(m => m.id === messId ? { ...m, is_open: current } : m));
      Alert.alert('Error', 'Could not update status');
    }
  };

  const handleDeleteMenu = (messId: string, messName: string, mealType: 'lunch' | 'dinner') => {
    Alert.alert('Delete Menu', `Delete ${mealType} menu for ${messName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/menus/${messId}/today`, { params: { meal_type: mealType } });
            loadMesses(true);
          } catch {
            Alert.alert('Error', `Could not delete ${mealType} menu.`);
          }
        },
      },
    ]);
  };

  const handleUploadCoverImage = async (messId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const formData = new FormData();
    formData.append('image', { uri: imageUri, name: `cover-${Date.now()}.${fileType}`, type: `image/${fileType}` } as any);

    try {
      const response = await apiClient.post(`/upload/cover-image/${messId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setMesses(prev => prev.map(m => m.id === messId ? { ...m, cover_image_url: response.data.cover_image_url } : m));
      Alert.alert('Success', 'Cover image uploaded!');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.message || 'Failed to upload image.');
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#AB3500" />
        <Text style={s.loadingText}>Loading your messes…</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('StudentStack', { screen: 'StudentHome' })}>
          <Ionicons name="arrow-back" size={20} color="#AB3500" />
          <Text style={s.backBtnText}>Back to App</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Messes</Text>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMesses(true); }} tintColor="#AB3500" />}
      >
        {messes.length === 0 ? (
          /* ── Empty state ── */
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>🏪</Text>
            <Text style={s.emptyTitle}>No Mess Yet</Text>
            <Text style={s.emptySub}>Register your mess to start receiving orders</Text>
            <TouchableOpacity style={s.registerBtn} onPress={() => navigation.navigate('SimpleRegisterMess')}>
              <Text style={s.registerBtnText}>+ Register Mess</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {messes.map(mess => (
              <View key={mess.id} style={s.card}>

                {/* ── Status row ── */}
                <View style={s.statusRow}>
                  <View style={s.nameBlock}>
                    <View style={s.nameRow}>
                      <Text style={s.messName}>{mess.name}</Text>
                      {mess.verified && (
                        <Ionicons name="checkmark-circle" size={18} color="#00677E" style={{ marginLeft: 6 }} />
                      )}
                    </View>
                    <View style={s.addressRow}>
                      <Ionicons name="location-outline" size={13} color="#594139" />
                      <Text style={s.messAddress}>{mess.address}</Text>
                    </View>
                    {mess.verification_status === 'pending' && (
                      <View style={s.pendingBadge}>
                        <Text style={s.pendingText}>⏳ Pending Review</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.toggleBlock}>
                    <Text style={[s.statusLabel, mess.is_open ? s.statusOpen : s.statusClosed]}>
                      {mess.is_open ? 'OPEN' : 'CLOSED'}
                    </Text>
                    <Switch
                      value={mess.is_open}
                      onValueChange={() => toggleStatus(mess.id, mess.is_open)}
                      trackColor={{ false: '#FEE2E2', true: '#D1FAE5' }}
                      thumbColor={mess.is_open ? '#10B981' : '#EF4444'}
                    />
                  </View>
                </View>

                {/* ── Cover photo ── */}
                <View style={s.coverSection}>
                  {mess.cover_image_url ? (
                    <View style={s.coverWrapper}>
                      <Image source={{ uri: mess.cover_image_url }} style={s.coverImage} resizeMode="cover" />
                      <TouchableOpacity style={s.changeCoverBtn} onPress={() => handleUploadCoverImage(mess.id)}>
                        <Ionicons name="camera" size={14} color="#fff" />
                        <Text style={s.changeCoverText}>Change Cover</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={s.uploadCoverBtn} onPress={() => handleUploadCoverImage(mess.id)}>
                      <Ionicons name="camera-outline" size={28} color="#8D7168" />
                      <Text style={s.uploadCoverText}>Upload Cover Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* ── Today's menu ── */}
                <Text style={s.menuSectionTitle}>Today's Menu</Text>
                <View style={s.menuGrid}>
                  {/* Lunch */}
                  <View style={s.menuCard}>
                    <View style={s.menuCardHeader}>
                      <View style={s.menuIconWrap}>
                        <Text style={s.menuIcon}>🍛</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.menuType}>Lunch</Text>
                        {mess.lunch
                          ? <Text style={s.menuItems} numberOfLines={2}>{mess.lunch.items.join(', ')} · ₹{mess.lunch.price}</Text>
                          : <Text style={s.menuEmpty}>No menu added</Text>
                        }
                      </View>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('UpdateMenu', { messId: mess.id, messName: mess.name, mealType: 'lunch' })}
                      >
                        <Text style={s.editLink}>{mess.lunch ? 'Edit' : 'Add'}</Text>
                      </TouchableOpacity>
                    </View>
                    {mess.lunch && (
                      <TouchableOpacity style={s.deleteMenuBtn} onPress={() => handleDeleteMenu(mess.id, mess.name, 'lunch')}>
                        <Ionicons name="trash-outline" size={13} color="#DC2626" />
                        <Text style={s.deleteMenuText}>Delete lunch</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Dinner */}
                  <View style={s.menuCard}>
                    <View style={s.menuCardHeader}>
                      <View style={[s.menuIconWrap, { backgroundColor: '#F4EBE4' }]}>
                        <Text style={s.menuIcon}>🍲</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.menuType}>Dinner</Text>
                        {mess.dinner
                          ? <Text style={s.menuItems} numberOfLines={2}>{mess.dinner.items.join(', ')} · ₹{mess.dinner.price}</Text>
                          : <Text style={s.menuEmpty}>No menu added</Text>
                        }
                      </View>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('UpdateMenu', { messId: mess.id, messName: mess.name, mealType: 'dinner' })}
                      >
                        <Text style={s.editLink}>{mess.dinner ? 'Edit' : 'Add'}</Text>
                      </TouchableOpacity>
                    </View>
                    {mess.dinner && (
                      <TouchableOpacity style={s.deleteMenuBtn} onPress={() => handleDeleteMenu(mess.id, mess.name, 'dinner')}>
                        <Ionicons name="trash-outline" size={13} color="#DC2626" />
                        <Text style={s.deleteMenuText}>Delete dinner</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* ── Everyday menu ── */}
                <TouchableOpacity
                  style={s.everydayRow}
                  onPress={() => navigation.navigate('EverydayMenu', { messId: mess.id, messName: mess.name })}
                >
                  <View style={s.everydayIcon}>
                    <Ionicons name="restaurant-outline" size={20} color="#00677E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.everydayTitle}>Everyday Menu</Text>
                    <Text style={s.everydaySub}>Manage regular items</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#8D7168" />
                </TouchableOpacity>

              </View>
            ))}

            {/* Add another mess */}
            <TouchableOpacity style={s.addAnotherBtn} onPress={() => navigation.navigate('SimpleRegisterMess')}>
              <Ionicons name="add-circle-outline" size={20} color="#AB3500" />
              <Text style={s.addAnotherText}>Add Another Mess</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F6' },

  loadingContainer: { flex: 1, backgroundColor: '#FFF8F6', alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#594139' },

  // Header
  header: {
    backgroundColor: '#fff',
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F4EBE4',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { fontSize: 13, fontWeight: '600', color: '#AB3500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#261814' },
  logoutBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  logoutText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },

  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },

  // Empty state
  emptyState: { backgroundColor: '#fff', borderRadius: 20, padding: 40, alignItems: 'center', marginTop: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#261814', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#594139', textAlign: 'center', marginBottom: 24 },
  registerBtn: { backgroundColor: '#AB3500', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  registerBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  // Status row
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  nameBlock: { flex: 1, marginRight: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  messName: { fontSize: 19, fontWeight: '700', color: '#261814' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  messAddress: { fontSize: 13, color: '#594139' },
  pendingBadge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  pendingText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
  toggleBlock: { alignItems: 'center', gap: 4 },
  statusLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statusOpen: { color: '#10B981' },
  statusClosed: { color: '#EF4444' },

  // Cover
  coverSection: { marginBottom: 18 },
  coverWrapper: { position: 'relative' },
  coverImage: { width: '100%', height: 150, borderRadius: 14, backgroundColor: '#F4EBE4' },
  changeCoverBtn: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
  },
  changeCoverText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  uploadCoverBtn: {
    backgroundColor: '#F4EBE4',
    borderWidth: 1.5, borderColor: '#E1BFB5', borderStyle: 'dashed',
    borderRadius: 14, padding: 22, alignItems: 'center', gap: 8,
  },
  uploadCoverText: { fontSize: 13, fontWeight: '600', color: '#594139' },

  // Menu section
  menuSectionTitle: { fontSize: 15, fontWeight: '700', color: '#261814', marginBottom: 10 },
  menuGrid: { gap: 10, marginBottom: 14 },
  menuCard: {
    backgroundColor: '#FFF8F6',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F4EBE4',
  },
  menuCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFDBD0', alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 20 },
  menuType: { fontSize: 12, fontWeight: '600', color: '#594139', marginBottom: 2 },
  menuItems: { fontSize: 13, color: '#261814', lineHeight: 18 },
  menuEmpty: { fontSize: 12, color: '#8D7168', fontStyle: 'italic' },
  editLink: { fontSize: 13, fontWeight: '700', color: '#AB3500' },
  deleteMenuBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, alignSelf: 'flex-end' },
  deleteMenuText: { fontSize: 11, fontWeight: '600', color: '#DC2626' },

  // Everyday menu
  everydayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#F0FAFA', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#B5EBFF',
  },
  everydayIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#B5EBFF', alignItems: 'center', justifyContent: 'center' },
  everydayTitle: { fontSize: 14, fontWeight: '700', color: '#261814' },
  everydaySub: { fontSize: 12, color: '#594139' },

  // Add another
  addAnotherBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E1BFB5',
    borderStyle: 'dashed', borderRadius: 14, padding: 18,
  },
  addAnotherText: { fontSize: 15, fontWeight: '600', color: '#AB3500' },
});
