import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import KeyboardAwareScreen from '../../components/KeyboardAwareScreen';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { Alert.alert('Required', 'Please enter your email'); return; }
    if (!password)     { Alert.alert('Required', 'Please enter your password'); return; }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
      });
      await login({
        id:    data.user.id,
        email: data.user.email,
        role:  data.user.role || 'mess_owner',
        token: data.session.access_token,
      });
      navigation.navigate('OwnerStack', { screen: 'Dashboard' });
    } catch {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
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
        <Text style={s.tagline}>Owner portal</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Welcome back</Text>
        <Text style={s.cardSub}>Sign in to manage your mess</Text>

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
              placeholder="Your password"
              placeholderTextColor="#C4A99E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={s.showBtn} onPress={() => setShowPass(v => !v)}>
              <Text style={s.showBtnText}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[s.cta, loading && s.ctaDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.ctaText}>Sign In</Text>
          }
        </TouchableOpacity>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>New here? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.footerLink}>Create account</Text>
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
