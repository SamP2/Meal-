import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Single smooth animation
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.timing(slideUpAnim, { 
        toValue: 0, 
        duration: 800, 
        useNativeDriver: true 
      }),
    ]).start();

    // Auto-navigate after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('StudentStack');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigation.replace('StudentStack');
  };

  return (
    <LinearGradient
      colors={['#fff7ed', '#ffedd5', '#fed7aa']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🍱</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>MessFinder</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Find trusted mess food near you
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🗺️</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Discover Nearby</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              Find messes close to you
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📋</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Daily Menus</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              Browse menus & reviews
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>🏪</Text>
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>For Owners</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
              Register & manage messes
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.accent }]} 
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Skip Link */}
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleGetStarted}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip →</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.12,
    paddingBottom: spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  logoEmoji: {
    fontSize: 42,
  },
  appName: {
    fontSize: 36,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: fontSize.md,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  features: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  icon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginTop: 'auto' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  skipText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
