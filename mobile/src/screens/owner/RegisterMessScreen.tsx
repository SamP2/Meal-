import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius } from '../../theme';

export default function RegisterMessScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [form, setForm] = useState({
    name: '', address: '', opening_time: '', closing_time: '', price_range: '',
  });
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to auto-detect your mess location.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      // Reverse geocode to fill address if empty
      if (!form.address) {
        const [place] = await Location.reverseGeocodeAsync(loc.coords);
        if (place) {
          const addr = [place.name, place.street, place.city, place.region].filter(Boolean).join(', ');
          setForm(f => ({ ...f, address: addr }));
        }
      }
    } catch {
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLocating(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Required';
    if (!form.address) e.address = 'Required';
    if (!coords) e.coords = 'Please use current location or enter coordinates';
    if (!form.opening_time) e.opening_time = 'Required (HH:MM)';
    if (!form.closing_time) e.closing_time = 'Required (HH:MM)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await apiClient.post('/messes', {
        name: form.name, address: form.address,
        latitude: coords!.latitude,
        longitude: coords!.longitude,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
        price_range: form.price_range || undefined,
      });
      Alert.alert('Success! 🎉', 'Your mess has been registered.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to register mess');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏪 Basic Info</Text>
          <Input label="Mess Name" placeholder="e.g. Sharma's Mess" value={form.name}
            onChangeText={set('name')} error={errors.name} />
          <Input label="Address" placeholder="Full address" value={form.address}
            onChangeText={set('address')} error={errors.address} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Location</Text>

          <TouchableOpacity
            style={[styles.locBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
            onPress={useCurrentLocation}
            disabled={locating}
          >
            <Text style={{ fontSize: 20 }}>📡</Text>
            <Text style={[styles.locBtnText, { color: colors.primary }]}>
              {locating ? 'Detecting location...' : coords ? '✅ Location detected — tap to update' : 'Use My Current Location'}
            </Text>
          </TouchableOpacity>

          {coords && (
            <View style={[styles.coordsBox, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.coordsText, { color: colors.textSecondary }]}>
                📌 {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </Text>
            </View>
          )}
          {errors.coords && <Text style={[styles.errorText, { color: colors.error }]}>{errors.coords}</Text>}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🕐 Hours & Pricing</Text>
          <Input label="Opening Time" placeholder="08:00" value={form.opening_time}
            onChangeText={set('opening_time')} error={errors.opening_time} />
          <Input label="Closing Time" placeholder="22:00" value={form.closing_time}
            onChangeText={set('closing_time')} error={errors.closing_time} />
          <Input label="Price Range (optional)" placeholder="e.g. ₹50–₹100"
            value={form.price_range} onChangeText={set('price_range')} />
        </View>

        <Button label="Register Mess" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: { borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  locBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, marginBottom: spacing.sm },
  locBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, flex: 1 },
  coordsBox: { padding: spacing.sm, borderRadius: radius.md, marginTop: 4 },
  coordsText: { fontSize: fontSize.xs, textAlign: 'center' },
  errorText: { fontSize: fontSize.xs, marginTop: 4 },
});
