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

type Role = 'student' | 'mess_owner';

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // All useNativeDriver: false — no mixing
  const logoHeight    = useRef(new Animated.Value(120)).current;
  const logoOpacity   = useRef(new Animated.Value(1)).current;
  const subtitleHeight = useRef(new Animated.Value(48)).current;  // subtitle + role label
  const roleRowHeight  = useRef(new Animated.Value(60)).current;  // role buttons row
  const formTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.parallel([
          Animated.timing(logoHeight,     { toValue: 0,  duration: 200, useNativeDriver: false }),
          Animated.timing(logoOpacity,    { toValue: 0,  duration: 150, useNativeDriver: false }),
          Animated.timing(subtitleHeight, { toValue: 0,  duration: 200, useNativeDriver: false }),
          Animated.timing(roleRowHeight,  { toValue: 0,  duration: 200, useNativeDriver: false }),
          Animated.timing(formTranslate,  { toValue: -40, duration: 220, useNativeDriver: false }),
        ]).start();
      }
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.parallel([
          Animated.timing(logoHeight,     { toValue: 120, duration: 250, useNativeDriver: false }),
          Animated.timing(logoOpacity,    { toValue: 1,   duration: 250, useNativeDriver: false }),
          Animated.timing(subtitleHeight, { toValue: 48,  duration: 250, useNativeDriver: false }),
          Animated.timing(roleRowHeight,  { toValue: 60,  duration: 250, useNativeDriver: false }),
          Animated.timing(formTranslate,  { toValue: 0,   duration: 250, useNativeDriver: false }),
        ]).start();
      }
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/register', { email, password, role });
      if (data.session) {
        login({ id: data.user.id, email: data.user.email, role: data.user.role, token: data.session.access_token });
      } else {
        Alert.alert('Almost there!', data.message ?? 'Check your email to confirm your account, then log in.');
        navigation.navigate('Login');
      }
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.message ?? 'Something went wrong. Please try again.');
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
        {/* Logo — collapses when keyboard opens */}
        <Animated.View style={[styles.header, { height: logoHeight, opacity: logoOpacity, overflow: 'hidden' }]}>
          <View style={[styles.logoBox, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.logoEmoji}>🍱</Text>
          </View>
          <Text style={[styles.appName, { color: colors.primary }]}>MessFinder</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[
          styles.form,
          { backgroundColor: colors.surface },
          { transform: [{ translateY: formTranslate }] },
        ]}>
          <Text style={[styles.title, { color: colors.text }]}>Create account</Text>

          {/* Subtitle — collapses when keyboard opens */}
          <Animated.View style={{ height: subtitleHeight, overflow: 'hidden' }}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join thousands of students finding great meals
            </Text>
          </Animated.View>

          {/* Role selector — collapses when keyboard opens */}
          <Animated.View style={{ height: roleRowHeight, overflow: 'hidden' }}>
            <View style={styles.roleRow}>
              {(['student', 'mess_owner'] as Role[]).map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.roleBtn,
                    {
                      backgroundColor: role === r ? colors.primary : colors.surfaceSecondary,
                      borderColor: role === r ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.roleEmoji}>{r === 'student' ? '🎓' : '🍽️'}</Text>
                  <Text style={[styles.roleBtnText, { color: role === r ? colors.textInverse : colors.text }]}>
                    {r === 'student' ? 'Student' : 'Mess Owner'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

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
            placeholder="Min. 8 characters"
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

          <Button label="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: spacing.sm }} />

          <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <Text style={[styles.switchLink, { color: colors.primary }]}>Sign In</Text>
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
  form: { borderRadius: radius.xl, padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: 4 },
  subtitle: { fontSize: fontSize.sm, color: '#666', paddingBottom: spacing.md },
  roleRow: { flexDirection: 'row', gap: 12, paddingBottom: 8 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: radius.md, borderWidth: 1.5 },
  roleEmoji: { fontSize: 18 },
  roleBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  switchText: { fontSize: fontSize.sm },
  switchLink: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
