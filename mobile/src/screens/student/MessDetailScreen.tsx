import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius, shadow } from '../../theme';

interface Mess {
  id: string; name: string; description: string | null; address: string;
  opening_time: string; closing_time: string; price_range: string | null;
  is_open: boolean; is_verified: boolean; is_veg: boolean; cuisine: string;
  rating: number; review_count: number; distance_km?: number;
  cover_image: string | null; latitude: number; longitude: number;
}

interface MenuItem { id: string; name: string; description: string | null; price: number; image: string | null; }
interface Review { id: string; rating: number; comment: string | null; created_at: string; student_id: string; }

const TABS = ["Today's Menu", 'Reviews'];

export default function MessDetailScreen({ route, navigation }: any) {
  const { messId } = route.params;
  const { colors } = useTheme();
  const [mess, setMess] = useState<Mess | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState("Today's Menu");
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      apiClient.get(`/messes/${messId}`),
      apiClient.get(`/messes/${messId}/menu`, { params: { date: today } }),
      apiClient.get(`/messes/${messId}/reviews`),
    ]).then(([messRes, menuRes, reviewRes]) => {
      setMess(messRes.data);
      setMenuItems(menuRes.data.items ?? []);
      setReviews(reviewRes.data ?? []);
    }).catch(() => Alert.alert('Error', 'Could not load mess details'))
      .finally(() => setLoading(false));
  }, [messId]);

  const submitReview = async () => {
    if (myRating === 0) { Alert.alert('Rate first', 'Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await apiClient.post(`/messes/${messId}/reviews`, { rating: myRating, comment: myComment });
      const { data } = await apiClient.get(`/messes/${messId}/reviews`);
      setReviews(data);
      setMyRating(0); setMyComment('');
      Alert.alert('Thanks!', 'Your review has been submitted.');
    } catch { Alert.alert('Error', 'Could not submit review'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!mess) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.textSecondary }}>Mess not found</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        {mess.cover_image
          ? <Image source={{ uri: mess.cover_image }} style={styles.heroImage} />
          : <View style={[styles.heroPlaceholder, { backgroundColor: colors.primary }]}><Text style={styles.heroEmoji}>🍽️</Text></View>
        }
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.heroBadges}>
            <View style={[styles.statusBadge, { backgroundColor: mess.is_open ? colors.primary : colors.error }]}>
              <Text style={styles.statusText}>{mess.is_open ? 'Open Now' : 'Closed'}</Text>
            </View>
            {mess.is_verified && <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}><Text style={styles.verifiedText}>✓ Verified</Text></View>}
          </View>
          <Text style={styles.heroName}>{mess.name}</Text>
          {mess.description && <Text style={styles.heroDesc}>{mess.description}</Text>}
        </View>
      </View>

      {/* Info strip */}
      <View style={[styles.infoStrip, { backgroundColor: colors.surface }, shadow.sm]}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Distance</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>📍 {mess.distance_km?.toFixed(2) ?? '—'} km</Text>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Hours</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>🕐 {mess.opening_time}–{mess.closing_time}</Text>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.directionsBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${mess.latitude},${mess.longitude}`)}>
          <Text style={[styles.directionsBtnText, { color: colors.primary }]}>🧭 Directions</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.textSecondary }]}>{tab}</Text>
            {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === "Today's Menu" && (
          menuItems.length === 0
            ? <View style={styles.emptyTab}><Text style={styles.emptyEmoji}>🤷</Text><Text style={[styles.emptyText, { color: colors.textSecondary }]}>No menu set for today</Text></View>
            : menuItems.map(item => (
              <View key={item.id} style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {item.image && <Image source={{ uri: item.image }} style={styles.menuItemImage} />}
                <View style={styles.menuItemInfo}>
                  <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                  {item.description && <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>{item.description}</Text>}
                </View>
                <Text style={[styles.menuItemPrice, { color: colors.primary }]}>₹{item.price}</Text>
              </View>
            ))
        )}

        {activeTab === 'Reviews' && (
          <View>
            {/* Rating summary */}
            <View style={[styles.ratingSummary, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.ratingBig, { color: colors.primary }]}>{mess.rating > 0 ? mess.rating.toFixed(1) : '—'}</Text>
              <View>
                <View style={styles.stars}>
                  {[1,2,3,4,5].map(s => <Text key={s} style={{ fontSize: 18, color: s <= Math.round(mess.rating) ? colors.accent : colors.border }}>★</Text>)}
                </View>
                <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>Based on {mess.review_count} reviews</Text>
              </View>
            </View>

            {/* Write review */}
            <View style={[styles.writeReview, { backgroundColor: colors.surface }]}>
              <Text style={[styles.writeReviewTitle, { color: colors.text }]}>Write a Review</Text>
              <View style={styles.starPicker}>
                {[1,2,3,4,5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setMyRating(s)}>
                    <Text style={{ fontSize: 32, color: s <= myRating ? colors.accent : colors.border }}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.commentInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                placeholder="Share your experience..."
                placeholderTextColor={colors.textSecondary}
                value={myComment}
                onChangeText={setMyComment}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={submitReview} disabled={submitting}>
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
              </TouchableOpacity>
            </View>

            {/* Reviews list */}
            {reviews.map(r => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewAvatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.reviewAvatarText, { color: colors.primary }]}>👤</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1,2,3,4,5].map(s => <Text key={s} style={{ fontSize: 12, color: s <= r.rating ? colors.accent : colors.border }}>★</Text>)}
                  </View>
                  <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{new Date(r.created_at).toLocaleDateString()}</Text>
                </View>
                {r.comment && <Text style={[styles.reviewComment, { color: colors.text }]}>{r.comment}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 80 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg },
  heroBadges: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  statusText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, textTransform: 'uppercase' },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  verifiedText: { fontSize: fontSize.xs, fontWeight: fontWeight.extrabold, color: '#0d9488' },
  heroName: { fontSize: 32, fontWeight: fontWeight.extrabold, color: '#fff', letterSpacing: -0.5, lineHeight: 36 },
  heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginTop: 4 },
  infoStrip: { flexDirection: 'row', alignItems: 'center', margin: spacing.md, borderRadius: radius.xl, padding: spacing.md },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  infoDivider: { width: 1, height: 32, marginHorizontal: spacing.sm },
  directionsBtn: { flex: 1, alignItems: 'center' },
  directionsBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, position: 'relative' },
  tabText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  tabIndicator: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, borderRadius: 1 },
  tabContent: { padding: spacing.md },
  emptyTab: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1 },
  menuItemImage: { width: 56, height: 56, borderRadius: radius.md, marginRight: spacing.md },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  menuItemDesc: { fontSize: fontSize.xs, marginTop: 2 },
  menuItemPrice: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold },
  ratingSummary: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.md },
  ratingBig: { fontSize: 48, fontWeight: fontWeight.extrabold },
  stars: { flexDirection: 'row', gap: 2 },
  reviewCount: { fontSize: fontSize.xs, marginTop: 4 },
  writeReview: { padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.md },
  writeReviewTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  starPicker: { flexDirection: 'row', gap: 4, marginBottom: spacing.md },
  commentInput: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md, marginBottom: spacing.md, minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { padding: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  reviewCard: { padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  reviewAvatar: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: 16 },
  reviewStars: { flexDirection: 'row', flex: 1 },
  reviewDate: { fontSize: fontSize.xs },
  reviewComment: { fontSize: fontSize.sm, lineHeight: 20 },
});
