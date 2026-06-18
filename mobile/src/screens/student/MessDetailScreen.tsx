import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import apiClient from '../../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Mess {
  id: string;
  name: string;
  address: string;
  distance_km: number;
  is_open: boolean;
  verified: boolean;
  price_range: string | null;
  rating: number;
  is_veg: boolean;
  cuisine: string;
  latitude?: number;
  longitude?: number;
  cover_image_url?: string | null;
  lunch:  { items: string[]; price: number } | null;
  dinner: { items: string[]; price: number } | null;
}

interface EverydayMenuItem {
  id: string;
  name: string;
  price: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MessDetailScreen({ route }: any) {
  const { mess } = route.params as { mess: Mess };
  const [everydayItems, setEverydayItems] = React.useState<EverydayMenuItem[]>([]);
  const [loadingEveryday, setLoadingEveryday] = React.useState(true);

  React.useEffect(() => {
    loadEverydayMenu();
  }, []);

  const loadEverydayMenu = async () => {
    try {
      const { data } = await apiClient.get(`/messes/${mess.id}/everyday-menu`);
      setEverydayItems(data || []);
    } catch {
      // silently fail — everyday menu is optional
    } finally {
      setLoadingEveryday(false);
    }
  };

  const handleGetDirections = () => {
    if (mess.latitude && mess.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${mess.latitude},${mess.longitude}`;
      Linking.openURL(url);
    }
  };

  const renderMenuSection = (
    title: string,
    emoji: string,
    menu: { items: string[]; price: number } | null
  ) => (
    <View style={s.menuCard}>
      <Text style={s.menuTitle}>{emoji} {title}</Text>
      {menu && menu.items && menu.items.length > 0 ? (
        <View style={s.menuContent}>
          <View style={s.menuItems}>
            {menu.items.map((item, index) => (
              <View key={index} style={s.menuItemRow}>
                <Text style={s.menuBullet}>•</Text>
                <Text style={s.menuItemText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={s.menuPriceRow}>
            <Text style={s.menuPriceLabel}>Price</Text>
            <Text style={s.menuPrice}>₹{menu.price}</Text>
          </View>
        </View>
      ) : (
        <View style={s.noMenu}>
          <Text style={s.noMenuEmoji}>📋</Text>
          <Text style={s.noMenuText}>No {title.toLowerCase()} menu today</Text>
          <Text style={s.noMenuSub}>Check back later or contact the mess</Text>
        </View>
      )}
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.root}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Cover Image */}
        {mess.cover_image_url ? (
          <Image source={{ uri: mess.cover_image_url }} style={s.coverImage} resizeMode="cover" />
        ) : (
          <View style={s.coverPlaceholder}>
            <Text style={s.coverPlaceholderEmoji}>🍽️</Text>
          </View>
        )}

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View style={s.nameBlock}>
              <Text style={s.messName}>{mess.name}</Text>
              {mess.verified
                ? <Text style={s.verifiedBadge}>✓ Verified</Text>
                : <Text style={s.pendingBadge}>⏳ Pending Review</Text>
              }
            </View>
            <View style={[s.statusBadge, mess.is_open ? s.statusOpen : s.statusClosed]}>
              <Text style={[s.statusText, mess.is_open ? s.statusTextOpen : s.statusTextClosed]}>
                {mess.is_open ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <Text style={s.infoText}>📍 {mess.distance_km.toFixed(1)} km</Text>
            <Text style={s.dot}>•</Text>
            <Text style={s.infoText}>{mess.cuisine}</Text>
            <Text style={s.dot}>•</Text>
            <Text style={s.infoText}>⭐ {mess.rating.toFixed(1)}</Text>
          </View>

          {mess.price_range && (
            <Text style={s.priceRange}>{mess.price_range}</Text>
          )}

          <Text style={s.address}>{mess.address}</Text>
        </View>

        {/* Directions */}
        {mess.latitude && mess.longitude && (
          <TouchableOpacity style={s.directionsBtn} onPress={handleGetDirections} activeOpacity={0.85}>
            <Text style={s.directionsBtnText}>🧭 Get Directions</Text>
          </TouchableOpacity>
        )}

        {/* Today's Menu */}
        <View style={s.section}>
          {renderMenuSection('Lunch', '🍛', mess.lunch)}
          {renderMenuSection('Dinner', '🌙', mess.dinner)}
        </View>

        {/* Everyday Menu */}
        <View style={s.everydayCard}>
          <Text style={s.everydayTitle}>📋 Everyday Menu</Text>
          <Text style={s.everydaySub}>Always available items</Text>

          {loadingEveryday ? (
            <ActivityIndicator size="small" color="#0369A1" style={{ marginTop: 12 }} />
          ) : everydayItems.length > 0 ? (
            <View style={s.everydayList}>
              {everydayItems.map(item => (
                <View key={item.id} style={s.everydayItem}>
                  <Text style={s.everydayItemName}>• {item.name}</Text>
                  <Text style={s.everydayItemPrice}>₹{item.price}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={s.everydayEmpty}>No everyday items listed</Text>
          )}
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#FFF8F6' },
  scroll: { flex: 1 },

  // Cover
  coverImage: { width: '100%', height: 240, backgroundColor: '#F4EBE4' },
  coverPlaceholder: {
    width: '100%', height: 180,
    backgroundColor: '#F4EBE4',
    alignItems: 'center', justifyContent: 'center',
  },
  coverPlaceholderEmoji: { fontSize: 64 },

  // Header
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EBE4',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  nameBlock: { flex: 1 },
  messName: { fontSize: 24, fontWeight: '800', color: '#261814', lineHeight: 30, marginBottom: 4 },
  verifiedBadge: { fontSize: 13, fontWeight: '600', color: '#10B981' },
  pendingBadge:  { fontSize: 13, fontWeight: '600', color: '#F59E0B' },
  statusBadge:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, flexShrink: 0 },
  statusOpen:    { backgroundColor: '#D1FAE5' },
  statusClosed:  { backgroundColor: '#FED7AA' },
  statusText:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statusTextOpen:   { color: '#065F46' },
  statusTextClosed: { color: '#9A3412' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 14, color: '#594139', fontWeight: '500' },
  dot: { fontSize: 14, color: '#8B7A72' },
  priceRange: { fontSize: 13, color: '#8B7A72', marginBottom: 6 },
  address: { fontSize: 13, color: '#8B7A72', lineHeight: 18, marginTop: 4 },

  // Directions
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AB3500',
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  directionsBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Menu section
  section: { padding: 20, gap: 16 },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuTitle: { fontSize: 19, fontWeight: '700', color: '#261814', marginBottom: 14 },
  menuContent: { gap: 14 },
  menuItems: { gap: 8 },
  menuItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  menuBullet: { fontSize: 16, color: '#AB3500', fontWeight: '700', marginTop: 2 },
  menuItemText: { flex: 1, fontSize: 15, color: '#261814', lineHeight: 22 },
  menuPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F4EBE4',
  },
  menuPriceLabel: { fontSize: 14, fontWeight: '600', color: '#594139' },
  menuPrice: { fontSize: 24, fontWeight: '800', color: '#AB3500' },
  noMenu: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  noMenuEmoji: { fontSize: 28 },
  noMenuText: { fontSize: 15, fontWeight: '600', color: '#594139' },
  noMenuSub: { fontSize: 13, color: '#8B7A72' },

  // Everyday menu
  everydayCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  everydayTitle: { fontSize: 18, fontWeight: '700', color: '#0369A1', marginBottom: 2 },
  everydaySub:   { fontSize: 12, color: '#0C4A6E', marginBottom: 14 },
  everydayList:  { gap: 10 },
  everydayItem:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  everydayItemName:  { flex: 1, fontSize: 14, color: '#0C4A6E', fontWeight: '500' },
  everydayItemPrice: { fontSize: 15, fontWeight: '700', color: '#0369A1' },
  everydayEmpty: { fontSize: 13, color: '#0C4A6E', fontStyle: 'italic', marginTop: 8 },
});
