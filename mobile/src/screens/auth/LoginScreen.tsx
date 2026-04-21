import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Platform, KeyboardAvoidingView, Animated, Keyboard,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import apiClient from '../../api/client';
import { spacing, fontSize, fontWeight, radius } from '../../theme';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // All animations use useNativeDriver: false to avoid mixing
  const logoHeight = useRef(new Animated.Value(140)).current;  // collapses header
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const formTranslate = useRef(new Animated.Value(0)).current; // slides form up

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.parallel([
          Animated.timing(logoHeight,   { toValue: 0,   duration: 220, useNativeDriver: false }),
          Animated.timing(logoOpacity,  { toValue: 0,   duration: 150, useNativeDriver: false }),
          Animated.timing(formTranslate,{ toValue: -80, duration: 220, useNativeDriver: false }),
        ]).start();
      }
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.parallel([
          Animated.timing(logoHeight,   { toValue: 140, duration: 250, useNativeDriver: false }),
          Animated.timing(logoOpacity,  { toValue: 1,   duration: 250, useNativeDriver: false }),
          Animated.timing(formTranslate,{ toValue: 0,   duration: 250, useNativeDriver: false }),
        ]).start();
      }
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      login({ id: data.user.id, email: data.user.email, role: data.user.role, token: data.session.access_token });
    } catch {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Logo — collapses and fades when keyboard opens */}
        <Animated.View style={[styles.header, { height: logoHeight, opacity: logoOpacity, overflow: 'hidden' }]}>
          <View style={[styles.logoBox, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.logoEmoji}>🍱</Text>
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>MessFinder</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Discover great meals nearby</Text>
        </Animated.View>

        {/* Form — slides up when keyboard opens */}
        <Animated.View style={[
          styles.form,
          { backgroundColor: colors.surface },
          { transform: [{ translateY: formTranslate }] },
        ]}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue</Text>

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            error={errors.password}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>{showPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            }
          />

          <Button label="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

          <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <Text style={[styles.switchLink, { color: colors.primary }]}>Register</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  logoBox: { width: 80, height: 80, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: fontSize.xxxl, fontWeight: fontWeight.extrabold, letterSpacing: -0.5 },
  tagline: { fontSize: fontSize.sm, marginTop: 4 },
  form: { borderRadius: radius.xl, padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: 4 },
  subtitle: { fontSize: fontSize.sm, marginBottom: spacing.lg },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  switchText: { fontSize: fontSize.sm },
  switchLink: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
