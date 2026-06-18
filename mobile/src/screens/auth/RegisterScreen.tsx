import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import KeyboardAwareScreen from '../../components/KeyboardAwareScreen';

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleRegister = async () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email'); return; }
    if (password.length < 8) { Alert.alert('Too short', 'Password must be at least 8 characters'); return; }
    if (password !== confirmPass) { Alert.alert('Mismatch', 'Passwords do not match'); return; }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/register', {
        email: email.trim(),
        password,
        role: 'mess_owner',
      });

      if (data.session) {
        await login({
          id:    data.user.id,
          email: data.user.email,
          role:  data.user.role || 'mess_owner',
          token: data.session.access_token,
        });
        navigation.navigate('OwnerStack', { screen: 'Dashboard' });
      } else {
        Alert.alert(
          'Check your email',
          'We sent a confirmation link to ' + email.trim() + '. Confirm it then sign in.',
          [{ text: 'OK', onPress: () => navigation.navigate('OwnerLogin') }]
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScreen centered contentStyle={s.scroll}>
      {/* Brand */}
      <View style={s.brand}>
        <View style={s.logoBox}>
          <Ionicons name="restaurant-outline" size={32} color="#AB3500" />
        </View>
        <Text style={s.appName}>MessFinder</Text>
        <Text style={s.tagline}>Create your owner account</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Get started</Text>
        <Text style={s.cardSub}>Register to manage your mess</Text>

        <View style={s.fieldGroup}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor="#C4A99E"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <TextInput
              style={[s.input, { paddingRight: 56 }]}
              placeholder="Min. 8 characters"
              placeholderTextColor="#C4A99E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="next"
            />
            <TouchableOpacity style={s.showBtn} onPress={() => setShowPass(v => !v)}>
              <Text style={s.showBtnText}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.fieldGroup}>
          <Text style={s.label}>Confirm Password</Text>
          <TextInput
            style={s.input}
            placeholder="Re-enter password"
            placeholderTextColor="#C4A99E"
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry={!showPass}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
        </View>

        <TouchableOpacity
          style={[s.cta, (loading || !email || password.length < 8) && s.ctaDisabled]}
          onPress={handleRegister}
          disabled={loading || !email || password.length < 8}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.ctaText}>Create Account</Text>
          }
        </TouchableOpacity>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('OwnerLogin')}>
          <Text style={s.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={s.blobTR} />
      <View style={s.blobBL} />
    </KeyboardAwareScreen>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingVertical: 40 },

  brand:   { alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#F4EBE4', alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#E1BFB5' },
  appName: { fontSize: 24, fontWeight: '800', color: '#261814', marginBottom: 4 },
  tagline: { fontSize: 14, color: '#8D7168' },

  card:      { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 16, shadowColor: '#AB3500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: '#F4EBE4' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#261814', marginBottom: 4 },
  cardSub:   { fontSize: 14, color: '#8D7168', marginBottom: 24 },

  fieldGroup: { marginBottom: 16 },
  label:      { fontSize: 13, fontWeight: '600', color: '#594139', marginBottom: 7, marginLeft: 4 },

  input:      { backgroundColor: '#FFF1ED', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#261814' },
  inputWrap:  { position: 'relative' },
  showBtn:    { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  showBtnText:{ fontSize: 13, fontWeight: '700', color: '#AB3500' },

  cta:        { backgroundColor: '#FF6B35', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  ctaDisabled:{ opacity: 0.5, shadowOpacity: 0 },
  ctaText:    { fontSize: 17, fontWeight: '700', color: '#fff' },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: '#8D7168' },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#AB3500' },

  blobTR: { position: 'absolute', top: 0, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(171,53,0,0.04)', zIndex: -1 },
  blobBL: { position: 'absolute', bottom: 0, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(150,200,180,0.06)', zIndex: -1 },
});
