import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import KeyboardAwareScreen from '../../components/KeyboardAwareScreen';
import Constants from 'expo-constants';

const MAPBOX_TOKEN = Constants.expoConfig?.extra?.mapboxToken || '';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SelectedLocation { lat: number; lng: number; label: string; }
interface Suggestion {
  id: string;
  main_text: string;
  secondary_text: string;
  lat: number;
  lng: number;
}

// ─── Location Search Modal ────────────────────────────────────────────────────
function LocationSearchModal({ visible, onClose, onSelect }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (loc: SelectedLocation) => void;
}) {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const debounce                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(query), 350);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query]);

  const search = async (q: string) => {
    setSearching(true);
    try {
      // Mapbox Geocoding API — free, excellent Indian coverage
      const url  = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=IN&language=en&limit=6&access_token=${MAPBOX_TOKEN}`;
      const res  = await fetch(url);
      const data = await res.json();
      const mapped: Suggestion[] = (data.features || []).map((f: any) => {
        const parts = f.place_name.split(',');
        return {
          id:             f.id,
          main_text:      f.text || parts[0].trim(),
          secondary_text: parts.slice(1, 3).join(',').trim(),
          lat:            f.center[1],
          lng:            f.center[0],
        };
      });
      setResults(mapped);
    } catch { setResults([]); }
    finally { setSearching(false); }
  };

  const pick = (item: Suggestion) => {
    onSelect({ lat: item.lat, lng: item.lng, label: item.main_text });
    setQuery(''); setResults([]); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={m.root}>
        <View style={m.header}>
          <Text style={m.title}>Search Location</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={22} color="#261814" />
          </TouchableOpacity>
        </View>

        <View style={m.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8D7168" />
          <TextInput
            style={m.searchInput}
            placeholder="Search area, street, landmark…"
            placeholderTextColor="#C4A99E"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {searching && <ActivityIndicator size="small" color="#AB3500" />}
          {query.length > 0 && !searching && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Ionicons name="close-circle" size={16} color="#8D7168" />
            </TouchableOpacity>
          )}
        </View>

        {query.length < 2 && <Text style={m.hint}>Type to search any area or landmark</Text>}

        <FlatList
          data={results}
          keyExtractor={i => i.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={m.list}
          ItemSeparatorComponent={() => <View style={m.sep} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={m.row}
              onPress={() => pick(item)}
              activeOpacity={0.7}
            >
              <View style={m.rowIcon}>
                <Ionicons name="location-outline" size={16} color="#AB3500" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={m.rowMain} numberOfLines={1}>{item.main_text}</Text>
                {item.secondary_text ? <Text style={m.rowSub} numberOfLines={1}>{item.secondary_text}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={14} color="#C4A99E" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length >= 2 && !searching
              ? <Text style={m.empty}>No results. Try a different search.</Text>
              : null
          }
        />
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SimpleRegisterMessScreen({ navigation }: any) {
  const [messName, setMessName]       = useState('');
  const [area, setArea]               = useState('');
  const [avgPrice, setAvgPrice]       = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [loading, setLoading]         = useState(false);
  const [detecting, setDetecting]     = useState(false);
  const [showSearch, setShowSearch]   = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<SelectedLocation | null>(null);
  const [locLabel, setLocLabel]       = useState('');

  useEffect(() => { detectLocation(); }, []);

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setSelectedLoc({ lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' });
        setLocLabel('Pune, Maharashtra');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const parts = [place.district || place.subregion || place.city, place.city || place.region].filter(Boolean);
        const label = parts.join(', ') || 'Your Location';
        setLocLabel(label);
        setSelectedLoc({ lat: latitude, lng: longitude, label });
      } catch {
        setLocLabel('Your Location');
        setSelectedLoc({ lat: latitude, lng: longitude, label: 'Your Location' });
      }
    } catch {
      setSelectedLoc({ lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' });
      setLocLabel('Pune, Maharashtra');
    } finally { setDetecting(false); }
  };

  const handleSubmit = async () => {
    if (!messName.trim()) { Alert.alert('Required', 'Please enter mess name'); return; }
    if (!area.trim())     { Alert.alert('Required', 'Please enter area'); return; }
    if (!selectedLoc)     { Alert.alert('Required', 'Please wait for location'); return; }

    const price      = avgPrice ? parseInt(avgPrice) : 100;
    const priceRange = `₹${Math.max(50, price - 20)}-${price + 20}`;

    setLoading(true);
    try {
      await apiClient.post('/messes', {
        name: messName.trim(), address: area.trim(),
        latitude: selectedLoc.lat, longitude: selectedLoc.lng,
        opening_time: '08:00', closing_time: '22:00',
        price_range: priceRange, cuisine: 'Mixed',
        fssai_number: fssaiNumber.trim() || undefined,
      });
      Alert.alert('Mess Registered!', 'Your mess is now live on MessFinder.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to register mess');
    } finally { setLoading(false); }
  };

  const isFormValid = messName.trim() !== '' && area.trim() !== '' && selectedLoc !== null;

  return (
    <>
      <KeyboardAwareScreen contentStyle={s.content}>
          <Text style={s.title}>Set up your mess</Text>
          <Text style={s.subtitle}>Quick setup in under a minute</Text>

          {/* Location card */}
          <View style={s.locCard}>
            <View style={s.locRow}>
              {detecting
                ? <><ActivityIndicator size="small" color="#AB3500" /><Text style={s.locText}>Detecting…</Text></>
                : <><Ionicons name="location" size={15} color="#AB3500" /><Text style={s.locText} numberOfLines={1}>{locLabel || 'Location not detected'}</Text></>
              }
            </View>
            <TouchableOpacity style={s.changeBtn} onPress={() => setShowSearch(true)} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={13} color="#AB3500" />
              <Text style={s.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Core fields */}
          <View style={s.card}>
            <Text style={s.label}>Mess Name</Text>
            <TextInput style={s.input} placeholder="Sharma's Mess" placeholderTextColor="#C4A99E" value={messName} onChangeText={setMessName} autoCapitalize="words" />
            <View style={s.divider} />
            <Text style={s.label}>Area / Locality</Text>
            <TextInput style={s.input} placeholder="Shivajinagar, Pune" placeholderTextColor="#C4A99E" value={area} onChangeText={setArea} autoCapitalize="words" />
            <Text style={s.hint}>Displayed to students on your listing</Text>
            <View style={s.divider} />
            <Text style={s.label}>Average Meal Price</Text>
            <View style={s.priceRow}>
              <Text style={s.rupee}>₹</Text>
              <TextInput style={s.priceInput} placeholder="100" placeholderTextColor="#C4A99E" value={avgPrice} onChangeText={setAvgPrice} keyboardType="numeric" />
            </View>
          </View>

          {/* Verification */}
          <View style={s.trustCard}>
            <View style={s.trustHeader}>
              <View style={s.trustIcon}><Ionicons name="shield-checkmark-outline" size={15} color="#AB3500" /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.trustTitle}>Get Verified ✓</Text>
                <Text style={s.trustSub}>Build trust with students</Text>
              </View>
            </View>
            <View style={s.benefits}>
              <View style={s.benefitRow}><Ionicons name="checkmark" size={12} color="#10B981" /><Text style={s.benefitText}>Verified badge on your listing</Text></View>
              <View style={s.benefitRow}><Ionicons name="checkmark" size={12} color="#10B981" /><Text style={s.benefitText}>Builds student trust</Text></View>
            </View>
            <TextInput style={s.fssaiInput} placeholder="FSSAI license number (optional)" placeholderTextColor="#C4A99E" value={fssaiNumber} onChangeText={setFssaiNumber} keyboardType="numeric" maxLength={14} />
            <Text style={s.fssaiHint}>Can be added later from Account settings</Text>
          </View>

          {/* Submit */}
          <TouchableOpacity style={[s.submitBtn, (!isFormValid || loading) && s.submitBtnDisabled]} onPress={handleSubmit} disabled={!isFormValid || loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Ionicons name="checkmark-circle-outline" size={17} color="#fff" /><Text style={s.submitBtnText}>Register Mess</Text></>
            }
          </TouchableOpacity>
          <View style={{ height: 40 }} />
      </KeyboardAwareScreen>

      <LocationSearchModal visible={showSearch} onClose={() => setShowSearch(false)} onSelect={(loc) => { setSelectedLoc(loc); setLocLabel(loc.label); }} />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  content: {},
  title: { fontSize: 24, fontWeight: '800', color: '#261814', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#8D7168', marginBottom: 14 },
  locCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1, gap: 10 },
  locRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  locText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#261814' },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF1ED', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  changeBtnText: { fontSize: 12, fontWeight: '700', color: '#AB3500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  divider: { height: 1, backgroundColor: '#F4EBE4', marginVertical: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#8D7168', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.6 },
  hint: { fontSize: 11, color: '#C4A99E', marginTop: 5, fontStyle: 'italic' },
  input: { fontSize: 15, fontWeight: '500', color: '#261814', padding: 0 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rupee: { fontSize: 17, fontWeight: '700', color: '#AB3500' },
  priceInput: { flex: 1, fontSize: 19, fontWeight: '700', color: '#261814', padding: 0 },
  trustCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FFDBD0', shadowColor: '#AB3500', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  trustHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  trustIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#FFF1ED', alignItems: 'center', justifyContent: 'center' },
  trustTitle: { fontSize: 14, fontWeight: '700', color: '#261814', marginBottom: 1 },
  trustSub: { fontSize: 12, color: '#8D7168' },
  benefits: { gap: 6, marginBottom: 14 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  benefitText: { fontSize: 13, color: '#594139' },
  fssaiInput: { backgroundColor: '#FFF8F6', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10, fontSize: 14, color: '#261814', borderWidth: 1, borderColor: '#F4EBE4', marginBottom: 6 },
  fssaiHint: { fontSize: 11, color: '#C4A99E', fontStyle: 'italic' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#AB3500', borderRadius: 14, paddingVertical: 15, shadowColor: '#AB3500', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 6, elevation: 4 },
  submitBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

const m = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8F6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F4EBE4' },
  title: { fontSize: 17, fontWeight: '700', color: '#261814' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', margin: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  searchInput: { flex: 1, fontSize: 15, color: '#261814', padding: 0 },
  hint: { textAlign: 'center', fontSize: 12, color: '#C4A99E', marginTop: 8 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  sep: { height: 1, backgroundColor: '#F4EBE4' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF1ED', alignItems: 'center', justifyContent: 'center' },
  rowMain: { fontSize: 14, fontWeight: '600', color: '#261814', marginBottom: 2 },
  rowSub: { fontSize: 12, color: '#8D7168' },
  empty: { textAlign: 'center', fontSize: 13, color: '#8D7168', marginTop: 32 },
});
