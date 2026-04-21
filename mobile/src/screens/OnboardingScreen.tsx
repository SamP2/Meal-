import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../theme';

const { width } = Dimensions.get('window');

const STEPS = [
  {
    emoji: '🗺️',
    title: 'Find Great Food\nNear You',
    description: 'Discover trusted mess options near your campus with real-time location tracking. Fresh meals are just steps away.',
    features: ['Curated mess listings', 'Real-time open/closed status', 'Verified reviews from students'],
  },
  {
    emoji: '📋',
    title: 'Menus &\nReviews',
    description: 'Check daily menus, read authentic reviews, and see ratings from fellow students before you go.',
    features: ['Daily menu updates', 'Star ratings & comments', 'Price range info'],
  },
  {
    emoji: '🏪',
    title: 'Own a Mess?\nList It Here',
    description: 'Register your mess, manage daily menus, and reach hundreds of hungry students nearby.',
    features: ['Easy mess registration', 'Daily menu management', 'Real-time status toggle'],
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (step < STEPS.length - 1) {
      const next = step + 1;
      setStep(next);
      Animated.timing(progressAnim, {
        toValue: next / (STEPS.length - 1),
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      navigation.replace('Auth');
    }
  };

  const current = STEPS[step];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={() => navigation.replace('Auth')}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration */}
      <View style={[styles.illustration, { backgroundColor: colors.primaryLight }]}>
        <Text style={styles.illustrationEmoji}>{current.emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{current.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{current.description}</Text>

        <View style={styles.features}>
          {current.features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progress + CTA */}
      <View style={styles.footer}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {step + 1} of {STEPS.length}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <Animated.View style={[styles.progressFill, {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['33%', '100%'] }),
            }]} />
          </View>
        </View>

        <View style={styles.ctaRow}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[
                styles.dot,
                { backgroundColor: i === step ? colors.primary : colors.border },
                i === step && styles.dotActive,
              ]} />
            ))}
          </View>
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={goNext}>
            <Text style={styles.nextBtnText}>{step === STEPS.length - 1 ? 'Get Started' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  skip: { alignSelf: 'flex-end', paddingTop: spacing.xl, paddingBottom: spacing.md },
  skipText: { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  illustration: { height: 260, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  illustrationEmoji: { fontSize: 96 },
  content: { flex: 1 },
  title: { fontSize: 36, fontWeight: fontWeight.extrabold, letterSpacing: -0.5, lineHeight: 42, marginBottom: spacing.md },
  description: { fontSize: fontSize.md, lineHeight: 24, marginBottom: spacing.lg },
  features: { gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureText: { fontSize: fontSize.sm },
  footer: { paddingBottom: spacing.xxl, gap: spacing.md },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progressLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 1 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  ctaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  nextBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.xl },
  nextBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
