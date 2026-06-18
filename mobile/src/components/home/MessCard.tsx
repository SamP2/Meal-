import React, { memo, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MessCardProps {
  name: string;
  image: string;
  cuisine: string;
  distance: number;
  rating: number;
  pricePerMeal: number;
  isOpen: boolean;
  verified?: boolean;
  status?: string;
  lunch?: { items: string[]; price: number } | null;
  dinner?: { items: string[]; price: number } | null;
  openingTime?: string;
  closingTime?: string;
  onPress: () => void;
}

function MessCard({
  name,
  image,
  cuisine,
  distance,
  rating,
  pricePerMeal,
  isOpen,
  verified,
  lunch,
  dinner,
  onPress,
}: MessCardProps) {
  const formattedDistance = distance.toFixed(1);
  const formattedRating   = rating.toFixed(1);
  const hasValidImage     = image && !image.includes('placeholder');

  // Memoize menu preview — only recalculates when lunch/dinner change
  const menuPreview = useMemo(() => {
    const previews: string[] = [];

    if (lunch?.items?.length) {
      let items = lunch.items;
      if (items.length === 1 && items[0].includes(',')) {
        items = items[0].split(',').map(i => i.trim());
      }
      previews.push(`🍛 ${items.slice(0, 2).join(', ')}`);
    }

    if (dinner?.items?.length) {
      let items = dinner.items;
      if (items.length === 1 && items[0].includes(',')) {
        items = items[0].split(',').map(i => i.trim());
      }
      previews.push(`🌙 ${items.slice(0, 2).join(', ')}`);
    }

    return previews.length > 0 ? previews.join(' • ') : 'No menu available today';
  }, [lunch, dinner]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        {hasValidImage ? (
          <Image
            source={{ uri: image }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🍽️</Text>
          </View>
        )}

        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gradient} />

        <View style={styles.topBadges}>
          {verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
          <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
            <View style={[styles.statusDot, styles.dotWhite]} />
            <Text style={styles.statusText}>{isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        </View>

        <View style={styles.imageOverlay}>
          <Text style={styles.overlayName} numberOfLines={1}>{name}</Text>
          <View style={styles.overlayMeta}>
            <Text style={styles.overlayRating}>⭐ {formattedRating}</Text>
            <Text style={styles.overlayDistance}> • {formattedDistance} km</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.menuPreview} numberOfLines={2}>{menuPreview}</Text>
        <View style={styles.footer}>
          <Text style={styles.cuisine}>{cuisine}</Text>
          <Text style={styles.price}>₹{pricePerMeal}/meal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// memo prevents re-render when parent re-renders but props haven't changed
export default memo(MessCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  imageContainer: { width: '100%', height: 200, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: '#F4EBE4', alignItems: 'center', justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 64 },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  topBadges: {
    position: 'absolute', top: 12, left: 12, right: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  verifiedText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  statusOpen:   { backgroundColor: 'rgba(16, 185, 129, 0.95)' },
  statusClosed: { backgroundColor: 'rgba(239, 68, 68, 0.95)' },
  statusDot:    { width: 6, height: 6, borderRadius: 3 },
  dotWhite:     { backgroundColor: '#fff' },
  statusText:   { color: '#fff', fontSize: 12, fontWeight: '700' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  overlayName: {
    fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  overlayMeta: { flexDirection: 'row', alignItems: 'center' },
  overlayRating: {
    fontSize: 15, fontWeight: '700', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  overlayDistance: {
    fontSize: 15, fontWeight: '600', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  content:     { padding: 16 },
  menuPreview: { fontSize: 14, fontWeight: '500', color: '#594139', lineHeight: 20, marginBottom: 12 },
  footer:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cuisine:     { fontSize: 13, fontWeight: '600', color: '#8B7A72' },
  price:       { fontSize: 17, fontWeight: '800', color: '#AB3500' },
});
