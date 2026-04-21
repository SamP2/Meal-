import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, fontSize } from '../theme';

interface Props {
  label: string;
  type?: 'success' | 'error' | 'primary' | 'neutral';
}

export default function Badge({ label, type = 'neutral' }: Props) {
  const { colors } = useTheme();

  const bg = type === 'success' ? colors.successBg
    : type === 'error' ? colors.errorBg
    : type === 'primary' ? colors.primaryLight
    : colors.surfaceSecondary;

  const color = type === 'success' ? colors.success
    : type === 'error' ? colors.error
    : type === 'primary' ? colors.primary
    : colors.textSecondary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  text: { fontSize: fontSize.xs, fontWeight: '600', letterSpacing: 0.3 },
});
